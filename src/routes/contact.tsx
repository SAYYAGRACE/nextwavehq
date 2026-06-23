import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Send, CheckCircle2, Mail, MapPin, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NEXTWAVE_EMAIL } from "@/lib/email-config";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Establish Strategic Contact with Nextwave" },
      { name: "description", content: "Reach out to the Nextwave operations team for partnerships, institutional programs, or corporate alignment." },
      { property: "og:title", content: "Contact — Nextwave" },
      { property: "og:description", content: "Establish strategic contact with the Nextwave operations team." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

type Errors = Partial<Record<"name" | "org" | "email" | "intent" | "message", string>>;

function ContactPage() {
  const [form, setForm] = useState({ name: "", org: "", email: "", intent: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Required";
    if (!form.org.trim()) next.org = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Valid email required";
    if (!form.intent) next.intent = "Select an option";
    if (form.message.trim().length < 10) next.message = "Provide at least 10 characters";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name.trim(),
      organization: form.org.trim(),
      email: form.email.trim(),
      intent: form.intent,
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (error) {
      setSubmitError("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
    setForm({ name: "", org: "", email: "", intent: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-32 pb-20 lg:pt-44">
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto">
            <SectionEyebrow>Contact</SectionEyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Establish <span className="gradient-text">Strategic Contact.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Reach out to the Nextwave operations team for partnerships, institutional programs, or
              corporate alignment.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <aside className="space-y-4">
              {[
                { icon: Mail, t: "Direct Email", v: NEXTWAVE_EMAIL },
                { icon: Building2, t: "Operations", v: "Nextwave Infotech" },
                { icon: MapPin, t: "Headquarters", v: "Kaduna State, Nigeria" },
              ].map((c) => (
                <div key={c.t} className="glass rounded-2xl p-5 flex items-start gap-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.03]">
                    <c.icon className="h-4 w-4 text-brand-glow" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{c.t}</div>
                    <div className="mt-1 text-sm text-white truncate">{c.v}</div>
                  </div>
                </div>
              ))}
            </aside>

            <form onSubmit={submit} noValidate className="glass-strong rounded-2xl p-6 sm:p-10">
              {sent && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-brand-purple/40 bg-brand-purple/10 px-4 py-3">
                  <CheckCircle2 className="h-4 w-4 text-brand-glow" />
                  <p className="text-sm text-white">Message transmitted. We'll respond shortly.</p>
                </div>
              )}
              {submitError && (
                <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
                  <p className="text-sm text-destructive">{submitError}</p>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g., John Doe"
                    className={inputCls(errors.name)}
                  />
                </Field>
                <Field label="Organization Name" error={errors.org}>
                  <input
                    type="text"
                    value={form.org}
                    onChange={(e) => update("org", e.target.value)}
                    placeholder="e.g., Technology Firm, University"
                    className={inputCls(errors.org)}
                  />
                </Field>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Email Address" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="name@company.com"
                    className={inputCls(errors.email)}
                  />
                </Field>
                <Field label="Engagement Intent" error={errors.intent}>
                  <select
                    value={form.intent}
                    onChange={(e) => update("intent", e.target.value)}
                    className={`${inputCls(errors.intent)} appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat`}
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394A3B8'><path d='M5.5 7.5L10 12l4.5-4.5z'/></svg>\")",
                    }}
                  >
                    <option value="">Select Purpose of Engagement</option>
                    <option>Corporate Partnership Inquiry</option>
                    <option>Academic Institution Alignment</option>
                    <option>Volunteer Application</option>
                    <option>General Media & Public Relations</option>
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Message" error={errors.message}>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="Provide a comprehensive overview of your engagement intent..."
                    className={`${inputCls(errors.message)} resize-none`}
                  />
                </Field>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
                >
                  {submitting ? "Transmitting..." : "Transmit Message"}
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs tracking-widest uppercase text-muted-foreground">{label}</span>
        {error && <span className="text-[11px] text-destructive">{error}</span>}
      </div>
      {children}
    </label>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-lg bg-surface-elevated border px-4 py-3 text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 transition-all ${
    error
      ? "border-destructive/60 focus:ring-destructive/30 focus:border-destructive"
      : "border-hairline focus:border-brand-purple focus:ring-brand-purple/30"
  }`;
}
