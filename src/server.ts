import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type FormKind = "contact" | "newsletter" | "waitlist";

const RECIPIENT_EMAIL = "info@nextwave.com.ng";
const SANITY_PROJECT_ID =
  process.env.VITE_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? "nffdmmjo";
const SANITY_DATASET =
  process.env.VITE_SANITY_DATASET ?? process.env.SANITY_DATASET ?? "production";
const SANITY_API_VERSION = "2024-01-01";

async function writeSubmission(input: {
  kind: FormKind;
  email: string;
  name?: string;
  organization?: string;
  intent?: string;
  message?: string;
  source?: string;
}): Promise<boolean> {
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
    return res.ok;
  } catch {
    return false;
  }
}

function buildEmail(input: {
  kind: FormKind;
  email: string;
  name?: string;
  organization?: string;
  intent?: string;
  message?: string;
  source?: string;
}): { subject: string; text: string } {
  const head =
    input.kind === "contact"
      ? "New Contact Form Submission"
      : input.kind === "newsletter"
        ? "New Newsletter Signup"
        : "New NerdHaven Waitlist Signup";
  const lines = [`Type: ${input.kind}`, `Email: ${input.email}`];
  if (input.name) lines.push(`Name: ${input.name}`);
  if (input.organization) lines.push(`Organization: ${input.organization}`);
  if (input.intent) lines.push(`Intent: ${input.intent}`);
  if (input.message) lines.push(`Message: ${input.message}`);
  if (input.source) lines.push(`Source: ${input.source}`);
  lines.push("", "Sent from the Nextwave website (nextwave.com.ng).");
  return { subject: `[Nextwave] ${head}`, text: lines.join("\n") };
}

async function sendEmail(input: {
  kind: FormKind;
  email: string;
  name?: string;
  organization?: string;
  intent?: string;
  message?: string;
  source?: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.RESEND_FROM_EMAIL ?? "Nextwave <no-reply@nextwave.com.ng>";
  const { subject, text } = buildEmail(input);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [RECIPIENT_EMAIL], subject, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function handleSubmit(rawBody: string): Promise<Response> {
  let body: {
    kind?: unknown;
    email?: unknown;
    name?: unknown;
    organization?: unknown;
    intent?: unknown;
    message?: unknown;
    source?: unknown;
  };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ ok: false, error: "bad-json" }, { status: 400 });
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
  };

  const [written, emailed] = await Promise.all([writeSubmission(input), sendEmail(input)]);
  if (written || emailed) return Response.json({ ok: true });
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
        return await handleSubmit(await request.text());
      }
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
