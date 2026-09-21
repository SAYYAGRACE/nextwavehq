import { createServerFn } from "@tanstack/react-start";

export type FormKind = "contact" | "newsletter" | "waitlist";

type SubmissionInput = {
  kind: FormKind;
  email: string;
  name?: string;
  organization?: string;
  intent?: string;
  message?: string;
  source?: string;
};

const RECIPIENT_EMAIL = "info@nextwave.com.ng";

const SANITY_PROJECT_ID =
  process.env.VITE_SANITY_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? "nffdmmjo";
const SANITY_DATASET =
  process.env.VITE_SANITY_DATASET ?? process.env.SANITY_DATASET ?? "production";
const SANITY_API_VERSION = "2024-01-01";

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
    return res.ok;
  } catch {
    return false;
  }
}

function buildEmail(input: SubmissionInput): { subject: string; text: string } {
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

async function sendEmail(input: SubmissionInput): Promise<boolean> {
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

export const submitForm = createServerFn({ method: "POST" })
  .inputValidator((d: SubmissionInput) => ({
    kind: d?.kind === "newsletter" || d?.kind === "waitlist" ? d.kind : "contact",
    email: typeof d?.email === "string" ? d.email.trim().toLowerCase().slice(0, 254) : "",
    name: typeof d?.name === "string" ? d.name.trim().slice(0, 120) : undefined,
    organization:
      typeof d?.organization === "string" ? d.organization.trim().slice(0, 160) : undefined,
    intent: typeof d?.intent === "string" ? d.intent.trim().slice(0, 120) : undefined,
    message: typeof d?.message === "string" ? d.message.trim().slice(0, 5000) : undefined,
    source: typeof d?.source === "string" ? d.source.trim().slice(0, 60) : undefined,
  }))
  .handler(async ({ data }) => {
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (!validEmail) return "err";
    const [written, emailed] = await Promise.all([writeSubmission(data), sendEmail(data)]);
    if (written || emailed) return "ok";
    return "err";
  });
