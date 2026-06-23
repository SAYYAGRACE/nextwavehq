import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  ClipboardCheck,
  Building2,
  Rocket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import nerdhavenLogo from "../assets/nerdhaven.png";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Nextwave Bootcamp & NerdHaven" },
      { name: "description", content: "Active initiatives and future infrastructure: The Nextwave Bootcamp and NerdHaven, the borderless digital academy." },
      { property: "og:title", content: "Projects — Nextwave" },
      { property: "og:description", content: "Active initiatives and future infrastructure from Nextwave." },
      { property: "og:url", content: "/projects" },
    ],
    links: [{ rel: "canonical", href: "/projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-32 lg:pt-44">
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <SectionEyebrow>Projects & Initiatives</SectionEyebrow>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl">
            Architecting Africa's <span className="gradient-text">deep-tech pipeline.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Two pillars. One ecosystem. Active initiatives on the ground and future infrastructure
            engineered for the continent.
          </p>
        </div>

        <Bootcamp />
        <NerdHaven />
      </main>
      <SiteFooter />
    </div>
  );
}

const PHASES: { n: string; title: string; sub: string; body: string; icon: LucideIcon }[] = [
  {
    n: "01",
    title: "The Strategic Outreach",
    sub: "Academic Deployment",
    body: "Nextwave engineering staff and mentors deploy directly to secondary schools and universities across Kaduna State to deliver intensive, foundational masterclasses in AI, logic, algorithmics, and biotechnology.",
    icon: GraduationCap,
  },
  {
    n: "02",
    title: "The Aptitude Challenge",
    sub: "Rigorous Selection Framework",
    body: "Students undergo a comprehensive, standardized technical evaluation and logical reasoning examination. This data-driven filter identifies the top analytical minds per cohort.",
    icon: ClipboardCheck,
  },
  {
    n: "03",
    title: "Industry Immersion",
    sub: "Corporate Shadowing",
    body: "Top-tier candidates are embedded directly into partner IT firms and engineering departments, shadowing software engineers, system architects, and tech experts to witness live production workflows.",
    icon: Building2,
  },
  {
    n: "04",
    title: "Launchpad Deployment",
    sub: "Certifications & Placements",
    body: "Finalists are awarded official Nextwave certifications and secured high-impact holiday internships and mentorships, locking in their pathways into the global tech economy.",
    icon: Rocket,
  },
];

function Bootcamp() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative mx-auto max-w-7xl px-6 lg:px-10 mt-24 lg:mt-32">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs tracking-[0.2em] uppercase text-brand-glow">Pillar 01 · Active Initiative</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-end">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          The Nextwave Bootcamp:
          <br />
          <span className="gradient-text">Nurturing Nigeria's next tech leaders.</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge tone="active">Status: Active</Badge>
          <Badge>Location: Kaduna State Focus</Badge>
        </div>
      </div>
      <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">
        A high-impact, metrics-driven pipeline transforming local academic talent into high-performing
        industry engineering assets.
      </p>

      {/* Stepper */}
      <div className="mt-14 grid gap-3 md:grid-cols-4">
        {PHASES.map((p, i) => (
          <button
            key={p.n}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`group text-left rounded-2xl p-5 border transition-all ${
              active === i
                ? "border-brand-purple/60 bg-brand-purple/[0.07] shadow-[0_0_0_1px_var(--brand-purple)] -translate-y-1"
                : "border-hairline bg-white/[0.02] hover:border-white/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                Phase {p.n}
              </span>
              <p.icon className={`h-4 w-4 ${active === i ? "text-brand-glow" : "text-muted-foreground"}`} strokeWidth={1.5} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">{p.title}</h3>
            <p className="mt-1 text-xs text-brand-glow/80">{p.sub}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 glass-strong rounded-2xl p-7 sm:p-10 min-h-[180px]">
        <div className="flex items-baseline gap-4">
          <span className="text-5xl font-bold gradient-text">{PHASES[active].n}</span>
          <div>
            <h3 className="text-xl font-semibold text-white">{PHASES[active].title}</h3>
            <p className="text-sm text-brand-glow/90">{PHASES[active].sub}</p>
          </div>
        </div>
        <p className="mt-5 text-muted-foreground leading-relaxed max-w-3xl">{PHASES[active].body}</p>
      </div>

      {/* B2B CTA */}
      <div className="mt-10 relative overflow-hidden rounded-2xl glass-strong p-8 sm:p-10">
        <div className="absolute -top-24 -right-12 h-64 w-64 rounded-full bg-brand-blue/20 blur-[100px]" />
        <div className="relative grid gap-6 md:grid-cols-[1.7fr_auto] md:items-center">
          <div>
            <span className="text-[10px] tracking-[0.2em] uppercase text-brand-glow">Enterprise Partnership</span>
            <h3 className="mt-3 text-xl sm:text-2xl font-semibold text-white">
              Want to source premier elite talent?
            </h3>
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-2xl">
              Become a Partner Host Company to open holiday internships for our top-tier finalists.
            </p>
          </div>
          <Link
            to="/contact"
            className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03] whitespace-nowrap"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            Apply for Enterprise Partnership
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const TRACKS = [
  {
    code: "Track A",
    title: "Foundations",
    target: "Primary & Secondary Students",
    body: "Gamified logical reasoning, early computational thinking, scratch algorithms, and basic programming frameworks.",
  },
  {
    code: "Track B",
    title: "Specializations",
    target: "University Undergraduates",
    body: "Deep-dives into industry-grade technologies, machine learning data models, API integrations, cloud architecture, and bioinformatics.",
  },
  {
    code: "Track C",
    title: "Growth Hub",
    target: "Business Owners & Founders",
    body: "Digital transformation strategies, workflow automation, cloud collaboration tools, and leveraging tech to scale regional enterprises.",
  },
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
      source: "nerdhaven-projects",
    });
    if (error) {
      if (error.code === "23505") return setState("dup");
      return setState("err");
    }
    setState("ok");
    setEmail("");
  }

  return (
    <section className="relative mx-auto max-w-7xl px-6 lg:px-10 mt-28 lg:mt-40">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-xs tracking-[0.2em] uppercase text-brand-glow">Pillar 02 · Future Infrastructure</span>
      </div>
      <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-end">
        <div className="rounded-2xl bg-white p-4 w-fit shadow-glow">
          <img src={nerdhavenLogo} alt="Nerdhaven, est. 2026" className="h-20 w-20 object-contain" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          NerdHaven:
          <br />
          <span className="gradient-text">The Borderless Digital Academy.</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge tone="dev">Status: In Development</Badge>
          <Badge>Medium: Digital Platform</Badge>
        </div>
      </div>
      <p className="mt-6 max-w-3xl text-muted-foreground leading-relaxed">
        A borderless, scalable digital learning management ecosystem engineered by Nextwave to
        democratize world-class technical literacy across demographics.
      </p>

      {/* Mock dashboard */}
      <div className="mt-12 rounded-2xl glass-strong overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-hairline bg-white/[0.02]">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <div className="mx-auto text-xs text-muted-foreground tracking-widest uppercase">
            nerdhaven · academy preview
          </div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="grid gap-4 md:grid-cols-3">
            {TRACKS.map((t) => (
              <div
                key={t.code}
                className="group rounded-xl border border-hairline bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition-all hover:border-brand-purple/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{t.code}</span>
                  <span className="text-[10px] tracking-widest uppercase text-brand-glow text-right max-w-[55%]">{t.target}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-white">{t.title}</h3>
                <div className="mt-3 h-px bg-gradient-to-r from-brand-purple/40 to-transparent" />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist */}
      <div className="mt-10 relative overflow-hidden rounded-2xl glass-strong p-8 sm:p-12 text-center">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-brand-purple/15 blur-[120px]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/10 px-3 py-1">
            <Sparkles className="h-3 w-3 text-brand-glow" />
            <span className="text-[11px] font-medium tracking-widest uppercase text-brand-glow">
              Early Access
            </span>
          </div>
          <h3 className="mt-5 text-2xl sm:text-3xl font-bold text-white">
            Secure Early Access to NerdHaven.
          </h3>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join the borderless tech academy waitlist to receive instant notifications upon beta
            module deployment.
          </p>
          <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state !== "idle") setState("idle");
              }}
              placeholder="Enter your email address"
              className="flex-1 rounded-full bg-surface-elevated border border-hairline px-5 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03] whitespace-nowrap disabled:opacity-60"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              {state === "loading" ? "Joining..." : "Join NerdHaven Waitlist"}
            </button>
          </form>
          {state === "ok" && (
            <p className="mt-4 text-sm text-brand-glow inline-flex items-center gap-2 justify-center">
              <CheckCircle2 className="h-4 w-4" /> Success: You're on the list!
            </p>
          )}
          {state === "dup" && (
            <p className="mt-4 text-sm text-brand-glow">You're already on the waitlist.</p>
          )}
          {state === "err" && (
            <p className="mt-4 text-sm text-destructive">Please enter a valid email address.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: "active" | "dev" }) {
  const dot =
    tone === "active"
      ? "bg-emerald-400 shadow-[0_0_8px_oklch(0.75_0.18_150)]"
      : tone === "dev"
      ? "bg-amber-400 shadow-[0_0_8px_oklch(0.78_0.18_80)]"
      : "bg-brand-glow";
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-3 py-1.5 text-[11px] tracking-widest uppercase text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}
