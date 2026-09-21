import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TiltCard } from "@/components/TiltCard";
import { Magnetic } from "@/components/Magnetic";
import { Aurora } from "@/components/Aurora";
import {
  Send,
  CheckCircle2,
  Mail,
  MapPin,
  Building2,
  SearchCheck,
  Reply,
  Sparkles,
  Phone,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { postSubmission } from "@/lib/submit";
import { NEXTWAVE_EMAIL } from "@/lib/email-config";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Establish Strategic Contact with Nextwave" },
      {
        name: "description",
        content:
          "Reach out to the Nextwave operations team for partnerships, talent programs, or corporate alignment.",
      },
      { property: "og:title", content: "Contact — Nextwave" },
      {
        property: "og:description",
        content: "Establish strategic contact with the Nextwave operations team.",
      },
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
    const result = await postSubmission({
      kind: "contact",
      email: form.email.trim(),
      name: form.name.trim(),
      organization: form.org.trim(),
      intent: form.intent,
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (result === "err") {
      setSubmitError("Something went wrong. Please try again.");
      return;
    }
    setSent(true);
    setForm({ name: "", org: "", email: "", intent: "", message: "" });
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-28 pb-16 lg:pt-36 overflow-hidden">
        <Aurora className="opacity-40" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto">
              <SectionEyebrow>Contact</SectionEyebrow>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
                Establish <span className="gradient-text">Strategic Contact.</span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                Reach out to the Nextwave operations team for partnerships, talent programs, or
                corporate alignment.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_2fr]">
            <Reveal delay={100}>
              <aside className="space-y-4">
                <SpotlightCard className="glass rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.03]">
                      <MapPin className="h-4 w-4 text-brand-glow" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                        Operating Location
                      </div>
                      <div className="mt-1 text-sm text-white">Kaduna State</div>
                    </div>
                  </div>
                </SpotlightCard>
                <SpotlightCard className="glass rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.03]">
                      <Mail className="h-4 w-4 text-brand-glow" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                        Email
                      </div>
                      <div className="mt-1 text-sm text-white break-words">{NEXTWAVE_EMAIL}</div>
                    </div>
                  </div>
                </SpotlightCard>
                {SITE.phone.display !== "TBD — add WhatsApp/phone" && (
                  <SpotlightCard className="glass rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.03]">
                        <Phone className="h-4 w-4 text-brand-glow" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                          Phone / WhatsApp
                        </div>
                        <div className="mt-1 text-sm text-white break-words">
                          {SITE.phone.display}
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                )}
                <SpotlightCard className="glass rounded-2xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-hairline bg-white/[0.03]">
                      <Building2 className="h-4 w-4 text-brand-glow" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                        Organization
                      </div>
                      <div className="mt-1 text-sm text-white">{SITE.name}</div>
                    </div>
                  </div>
                </SpotlightCard>
                <div className="flex flex-wrap gap-2">
                  {SITE.phone.whatsapp && (
                    <a
                      href={`https://wa.me/${SITE.phone.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-brand-purple/50 bg-brand-purple/10 px-4 py-2 text-xs text-brand-glow hover:bg-brand-purple/20 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  )}
                  {Object.values(SITE.socials).map((s) => (
                    <a
                      key={s.handle}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground hover:text-white transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> {s.handle}
                    </a>
                  ))}
                </div>
              </aside>
            </Reveal>

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
                    placeholder="e.g., Technology Firm, NGO"
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
                    <option>Training Program Alignment</option>
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
                <Magnetic strength={0.3}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.04] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
                  >
                    {submitting ? "Transmitting..." : "Transmit Message"}
                    <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </Magnetic>
              </div>
            </form>
          </div>

          <Reveal delay={120}>
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {[
                {
                  icon: SearchCheck,
                  t: "We review",
                  v: "The operations team reviews every submission against our engagement criteria.",
                },
                {
                  icon: Reply,
                  t: "We reply",
                  v: "You receive a direct response from the team — generally within a few business days.",
                },
                {
                  icon: Sparkles,
                  t: "We align",
                  v: "From partnership terms to program alignment, we define the next step collaboratively.",
                },
              ].map((s, i) => (
                <TiltCard key={s.t} maxTilt={7} className="h-full">
                  <SpotlightCard className="group glass gradient-border rounded-2xl p-7 h-full overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.03] group-hover:scale-110 transition-transform duration-300">
                        <s.icon className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                      </div>
                      <span className="text-xs tracking-widest uppercase text-muted-foreground">
                        Step 0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-white">{s.t}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.v}</p>
                  </SpotlightCard>
                </TiltCard>
              ))}
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
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
