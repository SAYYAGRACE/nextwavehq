/**
 * Nextwave Online Coding Camp — server-only API handlers.
 *
 * Mounted from src/server.ts before the TanStack SSR handler. All money is
 * handled in kobo. Payment status is NEVER trusted from the client: a
 * registration is only marked "paid" after a server-side Paystack verify call
 * or a signature-verified Paystack webhook, never from the browser callback.
 */

import { CAMP } from "../camp";
import { FROM_EMAIL } from "../email/config";

const RECIPIENT_EMAIL = "info@nextwave.com.ng";
const PAYSTACK_API = "https://api.paystack.co";
const TABLE_REG = "camp_registrations";
const TABLE_SPN = "camp_sponsorships";

export type CampStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type PaymentMethod = "card" | "transfer";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() !== "" ? v.trim() : undefined;
}

function paystackSecret(): string | undefined {
  return env("PAYSTACK_SECRET_KEY");
}

// ---------------------------------------------------------------------------
// Supabase (service role, via raw REST — same pattern as /api/submit)
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;

async function rest(
  table: string,
  {
    method = "GET",
    path = "",
    body,
    select = "*",
    single = false,
  }: { method?: string; path?: string; body?: unknown; select?: string; single?: boolean },
): Promise<{ ok: boolean; status: number; data: unknown; error?: string }> {
  const url = env("SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return { ok: false, status: 503, data: null, error: "not-configured" };
  const sep = path.includes("?") ? "&" : "?";
  const qs = `${sep}select=${encodeURIComponent(select)}${single ? "&limit=1" : "&limit=1000"}`;
  const res = await fetch(`${url}/rest/v1/${table}${path}${qs}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: key,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text().catch(() => "");
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  if (!res.ok) return { ok: false, status: res.status, data: parsed, error: text };
  return { ok: true, status: res.status, data: parsed };
}

async function findByReference(table: string, reference: string): Promise<Row | null> {
  const r = await rest(table, {
    path: `?reference=eq.${encodeURIComponent(reference)}`,
    single: true,
  });
  if (!r.ok) return null;
  return (Array.isArray(r.data) ? r.data[0] : r.data) as Row | null;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function makeReference(kind: "REG" | "SPN"): string {
  const t = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `NWC-${kind}-${t}${rand}`;
}

function str(v: unknown, max = 200): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t.slice(0, max) : undefined;
}

function validEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Per-IP rate limiting for the money endpoints.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 8;
const rateHits = new Map<string, number[]>();
function clientKey(request: Request): string {
  const f = request.headers.get("x-forwarded-for");
  return f?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (rateHits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  rateHits.set(key, recent);
  if (rateHits.size > 5000) rateHits.clear();
  return recent.length > RATE_MAX;
}

// ---------------------------------------------------------------------------
// Paystack
// ---------------------------------------------------------------------------
async function paystackVerify(
  reference: string,
): Promise<{ ok: boolean; success: boolean; amount: number }> {
  const secret = paystackSecret();
  if (!secret) return { ok: false, success: false, amount: 0 };
  try {
    const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (!res.ok) return { ok: false, success: false, amount: 0 };
    const data = (await res.json()) as {
      status?: boolean;
      data?: { status?: string; amount?: number };
    };
    const d = data.data;
    return {
      ok: data.status === true,
      success: d?.status === "success",
      amount: typeof d?.amount === "number" ? d.amount : 0,
    };
  } catch {
    return { ok: false, success: false, amount: 0 };
  }
}

/** Idempotently mark a row paid only if the amount matches what we expected. */
async function markPaidIfVerified(table: string, reference: string): Promise<boolean> {
  const row = await findByReference(table, reference);
  if (!row) return false;
  if (row.status === "paid") return true;
  const verify = await paystackVerify(reference);
  if (!verify.ok || !verify.success) return false;
  const expected = Number(row.amount_kobo ?? 0);
  if (verify.amount < expected) return false;
  const r = await rest(table, {
    method: "PATCH",
    path: `?reference=eq.${encodeURIComponent(reference)}`,
    body: { status: "paid", paid_at: new Date().toISOString() },
  });
  return r.ok;
}

// ---------------------------------------------------------------------------
// Emails
// ---------------------------------------------------------------------------
async function sendEmail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = env("RESEND_API_KEY");
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[camp] Resend rejected (${res.status}): ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[camp] Resend request failed:", error);
    return false;
  }
}

function waLink(text?: string): string {
  return text ? `${CAMP.whatsapp.link}?text=${encodeURIComponent(text)}` : CAMP.whatsapp.link;
}

function campEmailParts() {
  const cohort = CAMP.cohortWhatsappUrl
    ? `\n\nJoin your cohort WhatsApp group: ${CAMP.cohortWhatsappUrl}`
    : "";
  return {
    cohort,
    common: `${CAMP.name}\n${CAMP.dateRangeLabel} · ${CAMP.format}\nFee: ${CAMP.feeLabel}\n\nQuestions? WhatsApp ${CAMP.whatsapp.display} (${CAMP.whatsapp.label}).`,
  };
}

async function emailRegistrationConfirmation(row: Row, status: "paid" | "pending_transfer") {
  const parts = campEmailParts();
  const reference = String(row.reference);
  const paid = status === "paid";
  const subject = paid
    ? `${CAMP.name} — registration confirmed`
    : `${CAMP.name} — registration received (awaiting payment)`;
  const lines = paid
    ? [
        `Hi ${String(row.parent_name)},`,
        "",
        `Your child's place in the ${CAMP.name} is confirmed. Here are the details:`,
        "",
        `Amount paid: ${CAMP.feeLabel}`,
        `Reference: ${reference}`,
        "",
        "Next steps:",
        `1. Class days and times are confirmed after registration — we'll send them to you on WhatsApp.`,
        "2. Add our number so you don't miss the message: " + CAMP.whatsapp.display,
      ]
    : [
        `Hi ${String(row.parent_name)},`,
        "",
        "We've received your registration. To confirm your child's place, pay by bank transfer:",
        "",
        `Bank: ${CAMP.bank.bank}`,
        `Account name: ${CAMP.bank.accountName}`,
        `Account number: ${CAMP.bank.accountNumber}`,
        `Amount: ${CAMP.feeLabel}`,
        `Use this reference in the transfer narration: ${reference}`,
        "",
        "Then send a screenshot of the receipt to " + CAMP.whatsapp.display + " on WhatsApp.",
        "Your status will show 'Awaiting confirmation' until we match the transfer.",
      ];
  const text = [...lines, "", parts.common, parts.cohort].join("\n");
  const html = `<div style="font-family:sans-serif;line-height:1.6;max-width:560px">
    <p><strong>${CAMP.name}</strong></p>
    <p>${CAMP.dateRangeLabel} · ${CAMP.format}<br/>Fee: <strong>${CAMP.feeLabel}</strong></p>
    <p>Reference: <strong>${reference}</strong></p>
    <ul>${lines
      .slice(2)
      .map((l) => (l ? `<li>${escapeHtml(l)}</li>` : ""))
      .join("")}</ul>
    <p>Questions? WhatsApp <strong>${CAMP.whatsapp.display}</strong> (${CAMP.whatsapp.label}).</p>
    ${CAMP.cohortWhatsappUrl ? `<p><a href="${CAMP.cohortWhatsappUrl}">Join the cohort WhatsApp group</a></p>` : ""}
    <p>— Nextwave Infotech</p>
  </div>`;
  await sendEmail({ to: String(row.parent_email), subject, text, html, replyTo: RECIPIENT_EMAIL });
}

async function emailSponsorshipConfirmation(row: Row) {
  const reference = String(row.reference);
  const seats = Number(row.seats ?? 1);
  const amount = CAMP.naira(Number(row.amount_kobo ?? 0) / 100);
  const subject = `${CAMP.name} — sponsorship receipt`;
  const text = [
    `Hi ${String(row.donor_name || "there")},`,
    "",
    "Thank you for sponsoring a seat at the Nextwave Online Coding Camp.",
    "",
    `Seats sponsored: ${seats}`,
    `Amount: ${amount}`,
    `Reference: ${reference}`,
    "",
    "Sponsored seats go to families who cannot afford the fee. This receipt is your record.",
    "",
    `Questions? WhatsApp ${CAMP.whatsapp.display} (${CAMP.whatsapp.label}).`,
  ].join("\n");
  await sendEmail({
    to: String(row.donor_email),
    subject,
    text,
    html: `<div style="font-family:sans-serif;line-height:1.6;max-width:560px">
      <p><strong>Thank you for sponsoring ${seats} seat${seats > 1 ? "s" : ""}.</strong></p>
      <p>Amount: <strong>${amount}</strong><br/>Reference: <strong>${reference}</strong></p>
      <p>Sponsored seats go to families who cannot afford the fee.</p>
      <p>— Nextwave Infotech</p></div>`,
    replyTo: RECIPIENT_EMAIL,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------
type RegistrationPayload = {
  kind: "register";
  paymentMethod?: unknown;
  parentName?: unknown;
  parentWhatsapp?: unknown;
  parentEmail?: unknown;
  childFirstName?: unknown;
  childAge?: unknown;
  cityState?: unknown;
  device?: unknown;
  consent?: unknown;
  website?: unknown;
  elapsedMs?: unknown;
};

type SponsorshipPayload = {
  kind: "sponsor";
  paymentMethod?: unknown;
  seats?: unknown;
  donorName?: unknown;
  donorEmail?: unknown;
  donorWhatsapp?: unknown;
  consentShowName?: unknown;
  website?: unknown;
  elapsedMs?: unknown;
};

function baseGuard(
  body: { website?: unknown; elapsedMs?: unknown },
  request: Request,
): Response | null {
  if (typeof body.website === "string" && body.website.trim() !== "")
    return json({ ok: true, silent: true });
  if (typeof body.elapsedMs === "number" && body.elapsedMs < 1500)
    return json({ ok: true, silent: true });
  if (rateLimited(clientKey(request))) return json({ ok: false, error: "rate-limited" }, 429);
  return null;
}

function paymentMethodOf(v: unknown): PaymentMethod {
  return v === "transfer" ? "transfer" : "card";
}

export async function handleCampRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const p = url.pathname;
  if (!p.startsWith("/api/camp/") && p !== "/api/paystack/webhook") return null;

  if (p === "/api/paystack/webhook" && request.method === "POST") {
    return handleWebhook(request);
  }
  if (p === "/api/camp/register" && request.method === "POST") {
    return handleRegister(await request.json().catch(() => ({})), request);
  }
  if (p === "/api/camp/sponsor" && request.method === "POST") {
    return handleSponsor(await request.json().catch(() => ({})), request);
  }
  if (p === "/api/camp/verify" && request.method === "POST") {
    return handleVerify(await request.json().catch(() => ({})));
  }
  if (p === "/api/camp/status" && request.method === "GET") {
    return handleStatus(url.searchParams.get("reference") ?? "");
  }
  // Admin
  if (p === "/api/camp/admin/list" && request.method === "GET") {
    return adminGuard(request, () => adminList(url));
  }
  if (p === "/api/camp/admin/mark" && request.method === "POST") {
    return adminGuard(request, () => adminMark(request));
  }
  if (p === "/api/camp/admin/export" && request.method === "GET") {
    return adminGuard(request, () => adminExport(url));
  }
  return null;
}

async function handleRegister(body: RegistrationPayload, request: Request): Promise<Response> {
  const guard = baseGuard(body, request);
  if (guard) return guard;

  const parentName = str(body.parentName, 120);
  const parentWhatsapp = str(body.parentWhatsapp, 40);
  const parentEmail = str(body.parentEmail, 200)?.toLowerCase();
  const childFirstName = str(body.childFirstName, 80);
  const cityState = str(body.cityState, 120);
  const device = str(body.device, 20);
  const childAge =
    typeof body.childAge === "number" && Number.isFinite(body.childAge)
      ? Math.floor(body.childAge)
      : NaN;

  const errors: Record<string, string> = {};
  if (!parentName) errors.parentName = "Required";
  if (!parentWhatsapp) errors.parentWhatsapp = "Required";
  if (!validEmail(parentEmail)) errors.parentEmail = "A valid email is required";
  if (!childFirstName) errors.childFirstName = "Required";
  if (!Number.isFinite(childAge) || childAge < 7 || childAge > 17)
    errors.childAge = "Camp is for ages 7–17";
  if (body.consent !== true) errors.consent = "Consent is required";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const ageGroup = CAMP.ageGroups.find((g) => childAge >= g.min && childAge <= g.max)!;
  const method = paymentMethodOf(body.paymentMethod);
  const reference = makeReference("REG");

  const r = await rest(TABLE_REG, {
    method: "POST",
    body: {
      parent_name: parentName,
      parent_whatsapp: parentWhatsapp,
      parent_email: parentEmail,
      child_first_name: childFirstName,
      child_age: childAge,
      age_group: ageGroup.key,
      city_state: cityState ?? null,
      device: device ?? null,
      consent: true,
      reference,
      payment_method: method,
      status: "pending",
      amount_kobo: CAMP.feeKobo,
    },
    single: true,
  });
  if (!r.ok) return json({ ok: false, error: "could-not-save" }, 500);

  return json({
    ok: true,
    reference,
    amountKobo: CAMP.feeKobo,
    paymentMethod: method,
    ...(method === "transfer"
      ? {
          bank: CAMP.bank,
          instructions: `Put the reference ${reference} in the transfer narration, then send the receipt to ${CAMP.whatsapp.display} on WhatsApp.`,
        }
      : {}),
  });
}

async function handleSponsor(body: SponsorshipPayload, request: Request): Promise<Response> {
  const guard = baseGuard(body, request);
  if (guard) return guard;

  const donorName = str(body.donorName, 120);
  const donorEmail = str(body.donorEmail, 200)?.toLowerCase();
  const donorWhatsapp = str(body.donorWhatsapp, 40);
  const seatsRaw = body.seats;
  const seats =
    typeof seatsRaw === "number" && Number.isFinite(seatsRaw) ? Math.floor(seatsRaw) : NaN;

  const errors: Record<string, string> = {};
  if (!validEmail(donorEmail)) errors.donorEmail = "A valid email is required";
  if (!Number.isFinite(seats) || seats < 1 || seats > 100) errors.seats = "Choose 1–100 seats";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  const amountKobo = seats * CAMP.feeKobo;
  const method = paymentMethodOf(body.paymentMethod);
  const reference = makeReference("SPN");

  const r = await rest(TABLE_SPN, {
    method: "POST",
    body: {
      donor_name: donorName ?? null,
      donor_email: donorEmail,
      donor_whatsapp: donorWhatsapp ?? null,
      consent_show_name: body.consentShowName === true,
      seats,
      amount_kobo: amountKobo,
      reference,
      payment_method: method,
      status: "pending",
    },
    single: true,
  });
  if (!r.ok) return json({ ok: false, error: "could-not-save" }, 500);

  return json({
    ok: true,
    reference,
    amountKobo,
    seats,
    paymentMethod: method,
    ...(method === "transfer"
      ? {
          bank: CAMP.bank,
          instructions: `Put the reference ${reference} in the transfer narration, then send the receipt to ${CAMP.whatsapp.display} on WhatsApp.`,
        }
      : {}),
  });
}

async function handleVerify(body: { reference?: unknown }): Promise<Response> {
  const reference = str(body.reference, 120);
  if (!reference) return json({ ok: false, error: "missing-reference" }, 400);

  const reg = await markPaidIfVerified(TABLE_REG, reference);
  if (reg) {
    const row = await findByReference(TABLE_REG, reference);
    if (row) await emailRegistrationConfirmation(row, "paid");
    return json({ ok: true, status: "paid", kind: "registration" });
  }
  const spn = await markPaidIfVerified(TABLE_SPN, reference);
  if (spn) {
    const row = await findByReference(TABLE_SPN, reference);
    if (row) await emailSponsorshipConfirmation(row);
    return json({ ok: true, status: "paid", kind: "sponsorship" });
  }

  // Not verified as success — reflect the current stored status, don't flip it.
  const row =
    (await findByReference(TABLE_REG, reference)) ?? (await findByReference(TABLE_SPN, reference));
  const status = (row?.status as CampStatus) ?? "pending";
  return json({ ok: true, status });
}

async function handleStatus(reference: string): Promise<Response> {
  if (!reference) return json({ ok: false, error: "missing-reference" }, 400);
  const row =
    (await findByReference(TABLE_REG, reference)) ?? (await findByReference(TABLE_SPN, reference));
  if (!row) return json({ ok: false, error: "not-found" }, 404);
  // Capability URL: only the exact unguessable reference resolves. We expose the
  // minimum needed for the confirmation screen — never contact details.
  const isSponsor = row.seats !== undefined;
  return json({
    ok: true,
    status: row.status as CampStatus,
    reference: row.reference,
    amountKobo: row.amount_kobo,
    ...(isSponsor
      ? { kind: "sponsorship", seats: row.seats }
      : { kind: "registration", firstName: row.child_first_name }),
  });
}

async function handleWebhook(request: Request): Promise<Response> {
  const secret = paystackSecret();
  const raw = await request.text();
  if (!secret) return json({ ok: true }, 200);
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = await hmacSha512Hex(raw, secret);
  if (!safeEqual(signature, expected)) return json({ ok: false, error: "bad-signature" }, 401);

  let event: { event?: string; data?: { reference?: string; status?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return json({ ok: true }, 200);
  }
  const reference = event.data?.reference;
  if (!reference) return json({ ok: true }, 200);

  if (event.event === "charge.success") {
    const reg = await markPaidIfVerified(TABLE_REG, reference);
    if (reg) {
      const row = await findByReference(TABLE_REG, reference);
      if (row) await emailRegistrationConfirmation(row, "paid");
    } else {
      const spn = await markPaidIfVerified(TABLE_SPN, reference);
      if (spn) {
        const row = await findByReference(TABLE_SPN, reference);
        if (row) await emailSponsorshipConfirmation(row);
      }
    }
  } else if (event.event === "charge.failed") {
    const row =
      (await findByReference(TABLE_REG, reference)) ??
      (await findByReference(TABLE_SPN, reference));
    if (row && row.status === "pending") {
      const table = row.seats !== undefined ? TABLE_SPN : TABLE_REG;
      await rest(table, {
        method: "PATCH",
        path: `?reference=eq.${encodeURIComponent(reference)}`,
        body: { status: "failed" },
      });
    }
  }
  return json({ ok: true }, 200);
}

async function hmacSha512Hex(data: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
function adminSecret(): string {
  return env("CAMP_ADMIN_SECRET") ?? env("NTRI_CRON_SECRET") ?? env("CRON_SECRET") ?? "";
}
function adminAuthorized(request: Request): boolean {
  const secret = adminSecret();
  if (!secret) return false;
  return safeEqual((request.headers.get("x-camp-admin") ?? "").trim(), secret);
}
async function adminGuard(request: Request, fn: () => Promise<Response>): Promise<Response> {
  if (!adminAuthorized(request)) return json({ ok: false, error: "unauthorized" }, 401);
  return fn();
}

function publicRow(row: Row) {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    paymentMethod: row.payment_method,
    amountKobo: row.amount_kobo,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    // registration fields
    parentName: row.parent_name,
    parentWhatsapp: row.parent_whatsapp,
    parentEmail: row.parent_email,
    childFirstName: row.child_first_name,
    childAge: row.child_age,
    ageGroup: row.age_group,
    cityState: row.city_state,
    device: row.device,
    // sponsorship fields
    donorName: row.donor_name,
    donorEmail: row.donor_email,
    donorWhatsapp: row.donor_whatsapp,
    seats: row.seats,
    kind: row.seats !== undefined ? "sponsorship" : "registration",
  };
}

async function adminList(url: URL): Promise<Response> {
  const type = url.searchParams.get("type") === "sponsorship" ? TABLE_SPN : TABLE_REG;
  const status = url.searchParams.get("status");
  const ageGroup = url.searchParams.get("ageGroup");
  const method = url.searchParams.get("paymentMethod");
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  let path = "?order=created_at.desc";
  const filters: string[] = [];
  if (status) filters.push(`status=eq.${encodeURIComponent(status)}`);
  if (method) filters.push(`payment_method=eq.${encodeURIComponent(method)}`);
  if (type === TABLE_REG && ageGroup) filters.push(`age_group=eq.${encodeURIComponent(ageGroup)}`);
  if (filters.length) path += `&${filters.join("&")}`;

  const r = await rest(type, { path, select: "*" });
  if (!r.ok) return json({ ok: false, error: "query-failed" }, 500);
  let rows = (Array.isArray(r.data) ? r.data : []) as Row[];
  if (q) {
    rows = rows.filter((row) =>
      [row.parent_name, row.parent_email, row.child_first_name, row.reference, row.donor_name]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }
  const paid = rows.filter((row) => row.status === "paid");
  const paidKobo = paid.reduce((s, row) => s + Number(row.amount_kobo ?? 0), 0);
  return json({
    ok: true,
    type,
    rows: rows.map(publicRow),
    totals: { count: rows.length, paid: paid.length, paidKobo },
  });
}

async function adminMark(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as {
    id?: unknown;
    action?: unknown;
    type?: unknown;
  };
  const id = str(body.id, 80);
  const action = str(body.action, 20);
  const type = body.type === "sponsorship" ? TABLE_SPN : TABLE_REG;
  if (!id || !action) return json({ ok: false, error: "missing-fields" }, 400);
  const allowed: CampStatus[] = ["paid", "refunded", "cancelled", "failed", "pending"];
  if (!allowed.includes(action as CampStatus)) return json({ ok: false, error: "bad-action" }, 400);

  const patch: Record<string, unknown> = { status: action };
  if (action === "paid") patch.paid_at = new Date().toISOString();
  const r = await rest(type, {
    method: "PATCH",
    path: `?id=eq.${encodeURIComponent(id)}`,
    body: patch,
  });
  if (!r.ok) return json({ ok: false, error: "update-failed" }, 500);
  return json({ ok: true, status: action });
}

async function adminExport(url: URL): Promise<Response> {
  const type = url.searchParams.get("type") === "sponsorship" ? TABLE_SPN : TABLE_REG;
  const r = await rest(type, { path: "?order=created_at.desc", select: "*" });
  const rows = (Array.isArray(r.data) ? r.data : []) as Row[];
  const headers =
    type === TABLE_REG
      ? [
          "reference",
          "status",
          "payment_method",
          "amount_kobo",
          "parent_name",
          "parent_whatsapp",
          "parent_email",
          "child_first_name",
          "child_age",
          "age_group",
          "city_state",
          "device",
          "created_at",
          "paid_at",
        ]
      : [
          "reference",
          "status",
          "payment_method",
          "amount_kobo",
          "seats",
          "donor_name",
          "donor_email",
          "donor_whatsapp",
          "created_at",
          "paid_at",
        ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => {
          const v = row[h];
          const s = v === null || v === undefined ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(","),
    );
  }
  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv;charset=utf-8",
      "Content-Disposition": `attachment; filename="camp-${type === TABLE_SPN ? "sponsorships" : "registrations"}.csv"`,
    },
  });
}
