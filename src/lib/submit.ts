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

export async function postSubmission(input: SubmissionInput): Promise<"ok" | "err"> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) return "err";
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    return data?.ok ? "ok" : "err";
  } catch {
    return "err";
  }
}
