import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  FROM,
  MAX_ATTEMPTS,
  REVIEW_WINDOW_DAYS,
  REPLY_TO,
  SITE_URL,
  TOKEN_SECRET,
  assertDeliverableAddress,
} from "./config";
import { processQueue, type EmailJob, type SendResult } from "./queue";
import { createReviewToken, hashToken, isRedeemable, verifyReviewToken } from "./review-token";
import { verifySvixSignature } from "./svix";
import type { EmailStatus, EmailType, TemplateData } from "./types";

type Row = Record<string, unknown>;

function serviceClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

type AdminAuth = { ok: true; userId: string } | { ok: false; response: Response };

async function authenticateAdmin(client: SupabaseClient, request: Request): Promise<AdminAuth> {
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return { ok: false, response: json({ ok: false, error: "unauthorized" }, 401) };
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) {
    return { ok: false, response: json({ ok: false, error: "unauthorized" }, 401) };
  }
  const { data: role } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (!role) return { ok: false, response: json({ ok: false, error: "forbidden" }, 403) };
  return { ok: true, userId: userData.user.id };
}

async function sendViaResend(
  job: EmailJob,
  rendered: { subject: string; text: string; html: string },
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "resend-not-configured" };
  assertDeliverableAddress(FROM, "From");
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [job.recipient],
        reply_to: REPLY_TO,
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok || !data.id) {
      return { ok: false, error: data.message ?? `resend-${res.status}` };
    }
    return { ok: true, providerMessageId: data.id };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "resend-network-error" };
  }
}

function rowToJob(row: Row): EmailJob {
  return {
    id: String(row.id),
    type: row.type as EmailType,
    recipient: String(row.recipient),
    schoolId: (row.school_id as string | null) ?? null,
    assessmentId: (row.assessment_id as string | null) ?? null,
    attempts: Number(row.attempts ?? 0),
    templateData: (row.template_data as TemplateData | null) ?? {},
  };
}

async function runQueue(client: SupabaseClient): Promise<ReturnType<typeof processQueue>> {
  return processQueue({
    now: () => new Date(),
    listDue: async (now) => {
      const { data } = await client
        .from("email_log")
        .select(
          "id, type, recipient, school_id, assessment_id, attempts, template_data, next_attempt_at",
        )
        .eq("status", "queued")
        .or(`next_attempt_at.is.null,next_attempt_at.lte.${now.toISOString()}`)
        .order("created_at", { ascending: true })
        .limit(50);
      return (data ?? []).map((r) => rowToJob(r as Row));
    },
    send: sendViaResend,
    markSent: async (job, providerMessageId) => {
      await client
        .from("email_log")
        .update({
          status: "sent",
          provider_message_id: providerMessageId,
          attempts: job.attempts + 1,
          last_attempt_at: new Date().toISOString(),
          error: null,
        })
        .eq("id", job.id);
    },
    scheduleRetry: async (job, nextAt, error) => {
      await client
        .from("email_log")
        .update({
          status: "queued",
          attempts: job.attempts + 1,
          next_attempt_at: nextAt.toISOString(),
          last_attempt_at: new Date().toISOString(),
          error,
        })
        .eq("id", job.id);
    },
    markFailed: async (job, error) => {
      await client
        .from("email_log")
        .update({
          status: "failed",
          attempts: job.attempts + 1,
          last_attempt_at: new Date().toISOString(),
          error,
        })
        .eq("id", job.id);
    },
    onFinalFailure: async (job, error) => {
      if (job.assessmentId) {
        await client.rpc("mark_contact_undeliverable", {
          _assessment_id: job.assessmentId,
          _error: error,
        });
      } else {
        await client.from("admin_alerts").insert({
          kind: "delivery_failed",
          severity: "warning",
          title: "Email delivery failed",
          body: `To ${job.recipient}: ${error}`,
        });
      }
    },
  });
}

const WEBHOOK_STATUS: Record<string, EmailStatus> = {
  "email.sent": "sent",
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
  "email.failed": "failed",
};

async function handleResendWebhook(request: Request): Promise<Response> {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const client = serviceClient();
  if (!secret || !client) return json({ ok: false, error: "not-configured" }, 503);

  const body = await request.text();
  const valid = await verifySvixSignature({
    secret,
    svixId: request.headers.get("svix-id") ?? "",
    svixTimestamp: request.headers.get("svix-timestamp") ?? "",
    svixSignature: request.headers.get("svix-signature") ?? "",
    body,
  });
  if (!valid) return json({ ok: false, error: "invalid-signature" }, 401);

  let event: { type?: string; data?: { email_id?: string; bounce?: { message?: string } } };
  try {
    event = JSON.parse(body);
  } catch {
    return json({ ok: false, error: "bad-json" }, 400);
  }

  const status = event.type ? WEBHOOK_STATUS[event.type] : undefined;
  const providerId = event.data?.email_id;
  if (!status || !providerId) return json({ ok: true, ignored: true });

  const { data: row } = await client
    .from("email_log")
    .select("id, assessment_id")
    .eq("provider_message_id", providerId)
    .maybeSingle();

  if (!row) return json({ ok: true, unmatched: true });

  await client
    .from("email_log")
    .update({ status, error: event.data?.bounce?.message ?? null })
    .eq("id", row.id);

  if ((status === "bounced" || status === "failed") && row.assessment_id) {
    await client.rpc("mark_contact_undeliverable", {
      _assessment_id: row.assessment_id,
      _error: event.data?.bounce?.message ?? `Email ${status}`,
    });
  }

  return json({ ok: true });
}

async function handleDispatch(request: Request): Promise<Response> {
  const secret = process.env.NTRI_CRON_SECRET;
  if (!secret || request.headers.get("x-ntri-cron-secret") !== secret) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  const client = serviceClient();
  if (!client) return json({ ok: false, error: "not-configured" }, 503);
  const report = await runQueue(client);
  return json({ ok: true, ...report });
}

async function handleRequeue(request: Request): Promise<Response> {
  const client = serviceClient();
  if (!client) return json({ ok: false, error: "not-configured" }, 503);

  const auth = await authenticateAdmin(client, request);
  if (!auth.ok) return auth.response;

  let payload: { emailLogId?: string };
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "bad-json" }, 400);
  }
  if (!payload.emailLogId) return json({ ok: false, error: "missing-id" }, 400);

  await client
    .from("email_log")
    .update({ status: "queued", attempts: 0, next_attempt_at: null, error: null })
    .eq("id", payload.emailLogId);

  return json({ ok: true });
}

const REVIEW_LINK_TYPES: EmailType[] = ["consent_request", "review_link_invitation"];

async function handleSend(request: Request): Promise<Response> {
  const client = serviceClient();
  if (!client) return json({ ok: false, error: "not-configured" }, 503);

  const auth = await authenticateAdmin(client, request);
  if (!auth.ok) return auth.response;

  let payload: {
    type?: EmailType;
    schoolId?: string;
    assessmentId?: string;
    recipient?: string;
    templateData?: TemplateData;
    expiresAt?: string;
  };
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "bad-json" }, 400);
  }

  if (!payload.type || !payload.recipient) {
    return json({ ok: false, error: "missing-fields" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.recipient)) {
    return json({ ok: false, error: "invalid-recipient" }, 400);
  }

  const templateData: TemplateData = { ...(payload.templateData ?? {}) };

  if (REVIEW_LINK_TYPES.includes(payload.type) && payload.assessmentId && payload.schoolId) {
    const expiresAt = payload.expiresAt
      ? new Date(payload.expiresAt)
      : new Date(Date.now() + REVIEW_WINDOW_DAYS * 86_400_000);
    const token = await createReviewToken(
      {
        assessmentId: payload.assessmentId,
        schoolId: payload.schoolId,
        expiresAt: expiresAt.getTime(),
        nonce: crypto.randomUUID(),
      },
      TOKEN_SECRET,
    );
    await client.from("review_tokens").insert({
      assessment_id: payload.assessmentId,
      school_id: payload.schoolId,
      token_hash: await hashToken(token),
      expires_at: expiresAt.toISOString(),
    });
    templateData.reviewUrl = `${SITE_URL}/api/review/${token}`;
    templateData.deadline = expiresAt.toISOString().slice(0, 10);
  }

  const { data, error } = await client
    .from("email_log")
    .insert({
      type: payload.type,
      recipient: payload.recipient,
      school_id: payload.schoolId ?? null,
      assessment_id: payload.assessmentId ?? null,
      status: "queued",
      attempts: 0,
      next_attempt_at: new Date().toISOString(),
      template_data: templateData,
    })
    .select("id")
    .single();

  if (error) return json({ ok: false, error: error.message }, 500);
  return json({ ok: true, emailLogId: data.id });
}

function reviewPage(title: string, message: string, status = 200): Response {
  return html(
    `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${title}</title><meta name="robots" content="noindex" /></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;color:#111;line-height:1.6">
<h1 style="font-size:20px">${title}</h1>
<p style="color:#444">${message}</p>
<p style="font-size:12px;color:#666">Nextwave Infotech · <a href="${SITE_URL}" style="color:#7c3aed">${SITE_URL.replace(/^https?:\/\//, "")}</a></p>
</body></html>`,
    status,
  );
}

async function handleReviewOpen(
  client: SupabaseClient,
  token: string,
  request: Request,
): Promise<Response> {
  const verified = await verifyReviewToken(token, TOKEN_SECRET);
  if (!verified.ok) {
    const message =
      verified.reason === "expired"
        ? "This review link has expired. Please contact us and we will send a fresh one."
        : "This review link is not valid.";
    return reviewPage("Link unavailable", message, verified.reason === "expired" ? 410 : 400);
  }

  const tokenHash = await hashToken(token);
  const { data: record } = await client
    .from("review_tokens")
    .select("id, assessment_id, school_id, expires_at, used_at, opened_count")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!record) return reviewPage("Link unavailable", "This review link is not recognised.", 404);
  if (!isRedeemable(record as { used_at: string | null; expires_at: string })) {
    return reviewPage(
      "Link already used",
      "This review link has already been used or has expired.",
      410,
    );
  }

  await client
    .from("review_tokens")
    .update({ opened_count: Number(record.opened_count ?? 0) + 1 })
    .eq("id", record.id);

  await client.from("review_events").insert({
    assessment_id: record.assessment_id,
    school_id: record.school_id,
    token_id: record.id,
    event: "opened",
    user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
  });

  return reviewPage(
    "Your school readiness review",
    "You are signed in through your single-use review link. From here you can confirm the findings or ask us to correct something.",
  );
}

async function handleReviewAction(client: SupabaseClient, token: string): Promise<Response> {
  const verified = await verifyReviewToken(token, TOKEN_SECRET);
  if (!verified.ok) return json({ ok: false, error: verified.reason }, 410);

  const tokenHash = await hashToken(token);
  const { data: record } = await client
    .from("review_tokens")
    .select("id, assessment_id, school_id, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!record) return json({ ok: false, error: "unknown-token" }, 404);
  if (!isRedeemable(record as { used_at: string | null; expires_at: string })) {
    return json({ ok: false, error: "expired-or-used" }, 410);
  }

  return json({ ok: true, assessmentId: record.assessment_id });
}

export async function handleEmailRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === "POST" && pathname === "/api/emails/dispatch") {
    return handleDispatch(request);
  }
  if (request.method === "POST" && pathname === "/api/emails/send") {
    return handleSend(request);
  }
  if (request.method === "POST" && pathname === "/api/emails/requeue") {
    return handleRequeue(request);
  }
  if (request.method === "POST" && pathname === "/api/webhooks/resend") {
    return handleResendWebhook(request);
  }
  if (pathname.startsWith("/api/review/")) {
    const client = serviceClient();
    if (!client)
      return reviewPage(
        "Temporarily unavailable",
        "Review links are not available right now.",
        503,
      );
    const token = decodeURIComponent(pathname.slice("/api/review/".length));
    if (request.method === "GET") return handleReviewOpen(client, token, request);
    if (request.method === "POST") return handleReviewAction(client, token);
  }
  return null;
}

export const __testing = { WEBHOOK_STATUS, MAX_ATTEMPTS };
