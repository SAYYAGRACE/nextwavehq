"use client";

import { useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { postSubmission } from "@/lib/submit";

const inputClass =
  "w-full rounded-lg border border-hairline bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-brand-purple/60";

export function CorrectionForm({ schoolName }: { schoolName?: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    school: schoolName ?? "",
    issue: "",
    evidence: "",
    email: "",
  });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const result = await postSubmission({
      kind: "contact",
      email: form.email,
      name: form.school,
      intent: "NTRI correction",
      message: `School: ${form.school}\nWhat is wrong: ${form.issue}\nEvidence: ${form.evidence}`,
      source: "ntri-correction",
    });
    setState(result === "ok" ? "sent" : "error");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
      >
        <Flag className="h-4 w-4 text-brand-glow/70" /> Report a correction
      </button>
    );
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-brand-purple/40 bg-brand-purple/10 p-5 text-sm text-white">
        <CheckCircle2 className="mb-2 h-5 w-5 text-brand-glow" />
        Thank you — your correction has been received. We review every submission.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-hairline bg-white/[0.02] p-5">
      <h3 className="text-sm font-semibold text-white">Report a correction</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Tell us what looks wrong and how you know. We verify each report against our records.
      </p>
      <div className="mt-4 space-y-3">
        <input
          required
          value={form.school}
          onChange={(e) => setForm((f) => ({ ...f, school: e.target.value }))}
          placeholder="School name"
          className={inputClass}
        />
        <textarea
          required
          value={form.issue}
          onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))}
          placeholder="What is wrong?"
          rows={3}
          className={inputClass}
        />
        <textarea
          value={form.evidence}
          onChange={(e) => setForm((f) => ({ ...f, evidence: e.target.value }))}
          placeholder="Evidence or a link we can check (optional)"
          rows={2}
          className={inputClass}
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="Your email"
          className={inputClass}
        />
        {state === "error" && (
          <p className="text-xs text-amber-200">
            We couldn't send that just now. Please try again in a moment.
          </p>
        )}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={state === "sending"}
            className="rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--gradient-brand)" }}
          >
            {state === "sending" ? "Sending…" : "Submit correction"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-muted-foreground hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
