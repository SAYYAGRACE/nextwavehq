import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { FROM_EMAIL, isDeliverableAddress } from "./lib/email/config";
import { handleEmailRequest } from "./lib/email/server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type FormKind = "contact" | "newsletter" | "waitlist";

type SubmissionInput = {
  kind: FormKind;
  email: string;
  name?: string;
  organization?: string;
  intent?: string;
  message?: string;
  source?: string;
  schoolName?: string;
  lga?: string;
  consent?: boolean;
};

const RECIPIENT_EMAIL = "info@nextwave.com.ng";
const SANITY_PROJECT_ID =
  process.env.VITE_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? "nffdmmjo";
const SANITY_DATASET =
  process.env.VITE_SANITY_DATASET ?? process.env.SANITY_DATASET ?? "production";
const SANITY_API_VERSION = "2024-01-01";

async function writeSubmissionToSupabase(input: SubmissionInput): Promise<boolean> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/rest/v1/website_submissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        kind: input.kind,
        email: input.email.trim().toLowerCase(),
        name: input.name?.trim() || null,
        organization: input.organization?.trim() || null,
        intent: input.intent?.trim() || null,
        message: input.message?.trim() || null,
        source: input.source?.trim() || "web",
        school_name: input.schoolName?.trim() || null,
        lga: input.lga?.trim() || null,
        consent: input.consent === true,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[submit] Supabase archive failed (${res.status}): ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[submit] Supabase archive request failed:", error);
    return false;
  }
}

async function writeSubmission(input: SubmissionInput): Promise<boolean> {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) return false;
  const document: Record<string, unknown> = {
    _type: "submission",
    kind: input.kind,
    email: input.email.trim().toLowerCase(),
    source: input.source?.trim() || "web",
    createdAt: new Date().toISOString(),
  };
  if (input.name?.trim()) document.name = input.name.trim();
  if (input.organization?.trim()) document.organization = input.organization.trim();
  if (input.intent?.trim()) document.intent = input.intent.trim();
  if (input.message?.trim()) document.message = input.message.trim();
  try {
    const res = await fetch(
      `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/mutate/${SANITY_DATASET}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mutations: [{ create: document }] }),
      },
    );
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[submit] Sanity archive failed (${res.status}): ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[submit] Sanity archive request failed:", error);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmail(input: SubmissionInput): { subject: string; text: string; html: string } {
  const head =
    input.kind === "contact"
      ? "New Contact Form Submission"
      : input.kind === "newsletter"
        ? "New Newsletter Signup"
        : "New NerdHaven Waitlist Signup";
  const rows: Array<[string, string]> = [
    ["Type", input.kind],
    ["Email", input.email],
  ];
  if (input.name) rows.push(["Name", input.name]);
  if (input.organization) rows.push(["Organization", input.organization]);
  if (input.intent) rows.push(["Intent", input.intent]);
  if (input.schoolName) rows.push(["School", input.schoolName]);
  if (input.lga) rows.push(["LGA", input.lga]);
  if (input.consent) rows.push(["Consent", "Yes — agreed to be contacted"]);
  if (input.message) rows.push(["Message", input.message]);
  if (input.source) rows.push(["Source", input.source]);

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    "Sent from the Nextwave website (nextwave.com.ng).",
  ].join("\n");

  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#666;white-space:nowrap;vertical-align:top">${escapeHtml(
          label,
        )}</td><td style="padding:6px 0;color:#111;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:560px;margin:0 auto;padding:24px;line-height:1.6">
<h1 style="font-size:18px;margin:0 0 16px">${head}</h1>
<table style="border-collapse:collapse;font-size:14px">${htmlRows}</table>
<hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
<p style="font-size:12px;color:#666">Sent from the Nextwave website · <a href="https://nextwave.com.ng" style="color:#7c3aed">nextwave.com.ng</a></p>
</body></html>`;

  return { subject: `[Nextwave] ${head}`, text, html };
}

async function sendEmail(input: SubmissionInput): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("[submit] RESEND_API_KEY is not configured; notification email skipped");
    return false;
  }
  const { subject, text, html } = buildEmail(input);
  const from = process.env.RESEND_FROM_EMAIL?.trim() || `Nextwave Website <${FROM_EMAIL}>`;
  const replyTo = isDeliverableAddress(input.email) ? input.email : undefined;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [RECIPIENT_EMAIL],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const detail = (await res.json().catch(() => null)) as { message?: string } | null;
      console.error(
        `[submit] Resend rejected notification (${res.status}): ${detail?.message ?? "unknown error"}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("[submit] Resend request failed:", error);
    return false;
  }
}

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MIN_FILL_MS = 1500;
const rateHits = new Map<string, number[]>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (rateHits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateHits.set(key, recent);
  if (rateHits.size > 5000) rateHits.clear();
  return recent.length > RATE_LIMIT_MAX;
}

async function handleSubmit(rawBody: string, request: Request): Promise<Response> {
  let body: {
    kind?: unknown;
    email?: unknown;
    name?: unknown;
    organization?: unknown;
    intent?: unknown;
    message?: unknown;
    source?: unknown;
    schoolName?: unknown;
    lga?: unknown;
    consent?: unknown;
    website?: unknown;
    elapsedMs?: unknown;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field. Accept silently so bots
  // get no signal, but never store or forward the submission.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return Response.json({ ok: true, written: false, emailed: false });
  }

  // Timing signal: forms submitted implausibly fast are treated as automated.
  const elapsedMs = typeof body.elapsedMs === "number" ? body.elapsedMs : undefined;
  if (elapsedMs !== undefined && elapsedMs < MIN_FILL_MS) {
    return Response.json({ ok: true, written: false, emailed: false });
  }

  const key = clientKey(request);
  if (isRateLimited(key)) {
    return Response.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  const kind = body.kind === "newsletter" || body.kind === "waitlist" ? body.kind : "contact";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ ok: false, error: "invalid-email" }, { status: 400 });
  }

  const input = {
    kind,
    email,
    name: typeof body.name === "string" ? body.name.trim().slice(0, 120) : undefined,
    organization:
      typeof body.organization === "string" ? body.organization.trim().slice(0, 160) : undefined,
    intent: typeof body.intent === "string" ? body.intent.trim().slice(0, 120) : undefined,
    message: typeof body.message === "string" ? body.message.trim().slice(0, 5000) : undefined,
    source: typeof body.source === "string" ? body.source.trim().slice(0, 60) : undefined,
    schoolName:
      typeof body.schoolName === "string" ? body.schoolName.trim().slice(0, 160) : undefined,
    lga: typeof body.lga === "string" ? body.lga.trim().slice(0, 80) : undefined,
    consent: body.consent === true,
  };

  const [supabaseStored, sanityStored, emailed] = await Promise.all([
    writeSubmissionToSupabase(input),
    writeSubmission(input),
    sendEmail(input),
  ]);
  const written = supabaseStored || sanityStored;
  if (written || emailed) return Response.json({ ok: true, written, emailed });
  return Response.json({ ok: false, error: "delivery-failed" }, { status: 502 });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (request.method === "POST" && url.pathname === "/api/submit") {
        return await handleSubmit(await request.text(), request);
      }
      const emailResponse = await handleEmailRequest(request);
      if (emailResponse) return emailResponse;
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
