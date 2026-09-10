import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, BrainCircuit, Dna, ShieldPlus, CheckCircle2, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import nerdhavenLogo from "../assets/nerdhaven.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nextwave — Empowering Africa's Youth to Lead the Next Tech Revolution" },
      {
        name: "description",
        content:
          "A strategic, youth-driven ecosystem positioning Africa at the forefront of AI, biotechnology, and digital health innovation, beginning from Northern Nigeria.",
      },
      { property: "og:title", content: "Nextwave — Empowering Africa's Youth in Deep Tech" },
      {
        property: "og:description",
        content:
          "A youth-led deep-tech movement bridging Africa's gap in AI, biotechnology, and digital health.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <FocusAreas />
        <BootcampTimeline />
        <NerdHaven />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute inset-0 radial-glow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-brand-purple/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <SectionEyebrow>Originating from Northern Nigeria</SectionEyebrow>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
            <span className="gradient-text">Empowering Africa's Youth</span>
            <br />
            <span className="text-white">to lead the next</span>
            <br />
            <span className="text-white">technological revolution.</span>
          </h1>
          <p className="mt-7 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Nextwave is a strategic, youth-driven ecosystem positioning the African continent at the
            forefront of AI, biotechnology, and digital health innovation, beginning from Northern Nigeria.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/contact"
              className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03]"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              Join the Movement
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white glass-strong hover:bg-white/5 transition-colors"
            >
              Partner With Us
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-3 gap-6 sm:gap-10 w-full max-w-2xl">
            {[
              { k: "3", v: "Tech verticals" },
              { k: "01", v: "Active bootcamp" },
              { k: "∞", v: "Borderless reach" },
            ].map((s) => (
              <div key={s.v} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text">{s.k}</div>
                <div className="mt-1 text-[11px] sm:text-xs tracking-widest uppercase text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const FOCUS = [
  {
    icon: BrainCircuit,
    title: "AI & Data Science",
    body: "Machine learning deployment, capacity building, and rigorous data engineering pipelines tuned for local-context problem solving.",
    tag: "Vertical 01",
  },
  {
    icon: Dna,
    title: "Biotechnology & Health",
    body: "Bio-informatics, genetic engineering advocacy, and innovation pathways translating frontier science into regional impact.",
    tag: "Vertical 02",
  },
  {
    icon: ShieldPlus,
    title: "Digital Health Policy",
    body: "Advocating framework adoptions and architecting healthcare infrastructure data solutions for systemic resilience.",
    tag: "Vertical 03",
  },
];

function FocusAreas() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-2xl">
          <SectionEyebrow>Core Focus Areas</SectionEyebrow>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Three verticals. <span className="gradient-text">One continental thesis.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            We operate where research, advocacy, and engineering converge — building the structural
            scaffolding for Africa's deep-tech century.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {FOCUS.map((f) => (
            <article
              key={f.title}
              className="group relative glass gradient-border rounded-2xl p-7 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                  <f.icon className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                </div>
                <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
                  {f.tag}
                </span>
              </div>
              <h3 className="mt-7 text-xl font-semibold text-white">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              <div className="mt-8 pt-5 border-t border-hairline flex items-center justify-between text-xs text-muted-foreground">
                <span>Research · Advocacy</span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const PHASES = [
  {
    n: "01",
    title: "Strategic Outreach",
    body: "Nextwave engineering staff deploy to academic institutions across Kaduna State, conducting high-intensity emerging technology masterclasses.",
  },
  {
    n: "02",
    title: "Aptitude Challenge",
    body: "Rigorous tech evaluations and analytical examinations identify the most exceptional logical talent in every cohort.",
  },
  {
    n: "03",
    title: "Industry Immersion",
    body: "Top-tier candidates embed directly into premier IT companies, shadowing senior software and system engineers in live workflows.",
  },
  {
    n: "04",
    title: "Launchpad Deployment",
    body: "Exceptional candidates receive official Nextwave certifications and are placed into high-impact holiday internships.",
  },
];

function BootcampTimeline() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <SectionEyebrow>Flagship Initiative</SectionEyebrow>
          <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            The Nextwave Bootcamp:
            <br />
            <span className="gradient-text">Nurturing Nigeria's next tech leaders.</span>
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            A metrics-driven pipeline transforming local academic talent into high-performing industry
            engineering assets, originating in Kaduna State.
          </p>
        </div>

        <div className="mt-16 relative">
          <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
          <div className="grid gap-5 lg:grid-cols-4">
            {PHASES.map((p, i) => (
              <div key={p.n} className="group relative">
                <div className="hidden lg:flex absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-5 items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-glow shadow-[0_0_12px_var(--brand-glow)]" />
                </div>
                <article className="glass gradient-border rounded-2xl p-6 h-full transition-all hover:-translate-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                      Phase {p.n}
                    </span>
                    <span className="text-3xl font-bold text-white/10 group-hover:text-brand-purple/40 transition-colors">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </article>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/contact"
            className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white glass-strong hover:bg-white/5 transition-all"
          >
            Become a Partner Host Company
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const TRACKS = [
  { n: "01", title: "Foundations", target: "Primary & Secondary", body: "Computational logic, core algorithmics, and early engineering foundations." },
  { n: "02", title: "Specializations", target: "University Undergrads", body: "Advanced AI models, data sciences, and biotechnology frameworks." },
  { n: "03", title: "Growth Hub", target: "Business Owners", body: "Enterprise digital transformation, cloud scaling, and modern technical workflows." },
];

function NerdHaven() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err" | "loading" | "dup">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) return setState("err");
    setState("loading");
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase.from("waitlist_signups").insert({
      email: email.trim().toLowerCase(),
      source: "nerdhaven-home",
    });
    if (error) {
      if (error.code === "23505") return setState("dup");
      return setState("err");
    }
    setState("ok");
    setEmail("");
  }

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12 lg:p-16">
          <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-brand-blue/25 blur-[120px]" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-purple/25 blur-[120px]" />

          <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-shrink-0 rounded-3xl border border-white/10 bg-white/5 p-4">
              <img src={nerdhavenLogo} alt="NerdHaven logo" className="h-16 w-16 object-contain" />
            </div>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/10 px-3 py-1">
                <Sparkles className="h-3 w-3 text-brand-glow" />
                <span className="text-[11px] font-medium tracking-widest uppercase text-brand-glow">
                  Coming Soon
                </span>
              </div>
              <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                NerdHaven:
                <br />
                <span className="gradient-text">The Borderless Digital Academy.</span>
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed max-w-xl">
                A comprehensive digital learning ecosystem engineered by Nextwave to democratize
                high-tier technical literacy across multiple user demographics.
              </p>
            </div>
          </div>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {TRACKS.map((t) => (
              <div key={t.n} className="rounded-2xl border border-hairline bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
                    Track {t.n}
                  </span>
                  <span className="text-[10px] tracking-widest uppercase text-brand-glow">
                    {t.target}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{t.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={submit}
            className="relative mt-10 flex flex-col sm:flex-row gap-3 max-w-xl"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state !== "idle") setState("idle");
              }}
              placeholder="Enter email address"
              className="flex-1 rounded-full bg-surface-elevated border border-hairline px-5 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30 transition-all"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03] disabled:opacity-60"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              {state === "loading" ? "Joining..." : "Join NerdHaven Waitlist"}
            </button>
          </form>
          {state === "ok" && (
            <p className="relative mt-3 text-sm text-brand-glow flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> You're on the list — confirmation will arrive shortly.
            </p>
          )}
          {state === "dup" && (
            <p className="relative mt-3 text-sm text-brand-glow">You're already on the waitlist.</p>
          )}
          {state === "err" && (
            <p className="relative mt-3 text-sm text-destructive">Please enter a valid email address.</p>
          )}
        </div>
      </div>
    </section>
  );
}
