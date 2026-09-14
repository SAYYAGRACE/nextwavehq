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

async function writeSubmission(input: SubmissionInput): Promise<"ok" | "err"> {
  const token = process.env.SANITY_API_TOKEN;
  const projectId = process.env.SANITY_PROJECT_ID ?? import.meta.env?.VITE_SANITY_PROJECT_ID;
  const dataset =
    process.env.SANITY_DATASET ??
    (import.meta.env?.VITE_SANITY_DATASET as string | undefined) ??
    "production";
  if (!token || !projectId) return "err";
  try {
    const { createClient } = await import("@sanity/client");
    const client = createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: false,
      token,
    });
    await client.create({
      _type: "submission",
      kind: input.kind,
      email: input.email.trim().toLowerCase(),
      name: input.name?.trim() || undefined,
      organization: input.organization?.trim() || undefined,
      intent: input.intent?.trim() || undefined,
      message: input.message?.trim() || undefined,
      source: input.source?.trim() || "web",
      createdAt: new Date().toISOString(),
    });
    return "ok";
  } catch {
    return "err";
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
    return writeSubmission(data);
  });
