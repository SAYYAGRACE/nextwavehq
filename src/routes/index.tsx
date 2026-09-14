import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { useState, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Building2,
  Dna,
  Globe2,
  Layers,
  ShieldPlus,
  CheckCircle2,
  Rocket,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { HeroCanvas } from "@/components/HeroCanvas";
import { SpotlightCard } from "@/components/SpotlightCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import nerdhavenLogo from "../assets/nerdhaven.png";
import { SessionGallery } from "@/components/SessionGallery";
import { PartnerStrip } from "@/components/PartnerStrip";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { SITE } from "@/lib/site";

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

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
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: "Nextwave Infotech",
          url: "https://nextwave.com.ng",
          description:
            "A youth-led deep-tech movement bridging Africa's gap in AI, biotechnology, and digital health — originating from Northern Nigeria.",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Kawo, Kaduna",
            addressCountry: "NG",
          },
          sameAs: ["https://x.com/nextwaveorg", "https://instagram.com/nextwaveafrica"],
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <MarqueeBand />
        <ChallengeSection />
        <FocusAreas />
        <StatsBand />
        <TenetsSection />
        <BootcampTimeline />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-20 lg:mt-28">
          <SessionGallery />
        </div>
        <NerdHaven />
        <FaqSection />
        <CtaBand />
        <div className="mx-auto max-w-7xl px-6 lg:px-10 mt-20 lg:mt-28">
          <NewsletterSignup />
        </div>
        <PartnerStrip />
      </main>
      <SiteFooter />
    </div>
  );
}

function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);

  return (
    <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute inset-0 radial-glow" />
      <HeroCanvas />

      <motion.div
        style={prefersReducedMotion ? undefined : { y }}
        className="relative mx-auto max-w-7xl px-6 lg:px-10"
      >
        <motion.div
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
          variants={prefersReducedMotion ? undefined : stagger}
          initial={prefersReducedMotion ? "visible" : "hidden"}
          animate="visible"
        >
          <motion.div variants={fadeUp}>
            <SectionEyebrow>Originating from Northern Nigeria</SectionEyebrow>
          </motion.div>
          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            <span className="gradient-text">Empowering Africa's Youth</span>
            <br />
            <span className="text-white">to lead the next</span>
            <br />
            <span className="text-white">technological revolution.</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-7 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
          >
            Nextwave is a strategic, youth-driven ecosystem positioning the African continent at the
            forefront of AI, biotechnology, and digital health innovation, beginning from Northern
            Nigeria.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center gap-3"
          >
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
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-20 grid grid-cols-3 gap-6 sm:gap-10 w-full max-w-2xl"
          >
            {[
              { k: 300, suffix: "+", v: "Learners reached" },
              { k: 15, suffix: "+", v: "Partner schools" },
              { k: 20, suffix: "+", v: "Mentors & instructors" },
            ].map((s) => (
              <div key={s.v} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text tabular-nums">
                  <AnimatedNumber value={s.k} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-[11px] sm:text-xs tracking-widest uppercase text-muted-foreground">
                  {s.v}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

const MARQUEE = [
  "AI & Data Science",
  "Biotechnology & Health",
  "Digital Health Policy",
  "Nextwave Bootcamp",
  "NerdHaven Academy",
];

function MarqueeBand() {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div className="border-y border-hairline bg-white/[0.02] px-6 py-5 overflow-hidden">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {MARQUEE.map((m) => (
            <span key={m} className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {m}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div
      className="border-y border-hairline bg-white/[0.02] py-5 overflow-hidden"
      aria-hidden="false"
    >
      <div className="marquee flex w-max whitespace-nowrap">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {MARQUEE.map((m) => (
              <span
                key={m}
                className="mx-8 flex items-center gap-16 text-xs tracking-[0.2em] uppercase text-muted-foreground"
              >
                {m}
                <Sparkles className="h-3.5 w-3.5 text-brand-purple/60" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const CHALLENGES = [
  {
    icon: BrainCircuit,
    title: "A widening frontier",
    body: "Deep tech is outpacing local skill ecosystems. Without deliberate pipelines, regions become consumers of technology they never helped build.",
  },
  {
    icon: Globe2,
    title: "Talent without on-ramps",
    body: "Exceptionally analytical young minds across Northern Nigeria lack structured pathways from discovery to industry-grade deployment.",
  },
  {
    icon: Building2,
    title: "Infra built elsewhere",
    body: "Policy, data, and health infrastructure get architected abroad — we exist to build them here, on the ground, from first principles.",
  },
];

function ChallengeSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16 items-start">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <SectionEyebrow>The Moment</SectionEyebrow>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                Africa can't afford to sit out the{" "}
                <span className="gradient-text">deep-tech century.</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Every frontier technology creates two kinds of societies: the architects and the
                consumers. Nextwave is our continent's answer — a deliberate, team-built pathway
                from raw talent to world-class engineering.
              </p>
              <Link
                to="/about"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-brand-glow hover:text-white transition-colors"
              >
                Read our story
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-1">
            {CHALLENGES.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <SpotlightCard className="glass gradient-border rounded-2xl p-7">
                  <div className="flex gap-5 items-start">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                      <c.icon className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </Reveal>
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
        <Reveal>
          <div className="max-w-2xl">
            <SectionEyebrow>Core Focus Areas</SectionEyebrow>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Three verticals. <span className="gradient-text">One continental thesis.</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              We operate where research, advocacy, and engineering converge — building the
              structural scaffolding for Africa's deep-tech century.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {FOCUS.map((f) => (
              <SpotlightCard key={f.title} className="glass gradient-border rounded-2xl p-7 h-full">
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
              </SpotlightCard>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const STATS = [
  { value: 300, suffix: "+", label: "Learners reached" },
  { value: 15, suffix: "+", label: "Partner schools" },
  { value: 8, suffix: "+", label: "Industry partners" },
  { value: 20, suffix: "+", label: "Mentors & instructors" },
];

function StatsBand() {
  return (
    <section className="relative py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-3xl border border-hairline bg-hairline">
            {STATS.map((s) => (
              <div key={s.label} className="bg-background px-8 py-10 text-center">
                <div className="text-4xl sm:text-5xl font-bold gradient-text">
                  <AnimatedNumber value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-2 text-xs tracking-widest uppercase text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const TENETS = [
  {
    icon: Trophy,
    title: "Merit before access",
    body: "Talent is everywhere — opportunity is not. We identify exceptional logical minds early and route them through a transparent, merit-first pipeline.",
  },
  {
    icon: Globe2,
    title: "Borders as UI, not walls",
    body: "Nextwave is a borderless academy. Our programs extend across communities — reaching learners wherever they choose to engage.",
  },
  {
    icon: Layers,
    title: "Own the stack",
    body: "From AI to digital health policy, we engineer the infrastructure, not just the talent. We run the full build.",
  },
  {
    icon: Activity,
    title: "Measure everything",
    body: "Every cohort is tracked against clear success metrics. Certification, placement, and long-term trajectory are built into the pipeline.",
  },
];

function TenetsSection() {
  return (
    <section className="relative py-24 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <SectionEyebrow>How We Think</SectionEyebrow>
        </Reveal>
        <Reveal delay={100}>
          <div className="mt-5 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Four tenets <span className="gradient-text">guiding the mission.</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Every decision, partnership, and cohort is filtered through these core operating
              principles.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TENETS.map((t, i) => (
            <Reveal key={t.title} delay={160 + i * 80}>
              <SpotlightCard className="h-full glass gradient-border rounded-2xl p-7">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                  <t.icon className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{t.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              </SpotlightCard>
            </Reveal>
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
    body: "Nextwave engineering staff deploy across Kaduna State, running high-intensity emerging technology masterclasses.",
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
        <Reveal>
          <div className="max-w-3xl">
            <SectionEyebrow>Flagship Initiative</SectionEyebrow>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              The Nextwave Bootcamp:
              <br />
              <span className="gradient-text">Nurturing Nigeria's next tech leaders.</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A metrics-driven pipeline transforming local talent into high-performing industry
              engineering assets, originating in Kaduna State.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mt-16 relative">
            <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
            <div className="grid gap-5 lg:grid-cols-4">
              {PHASES.map((p, i) => (
                <div key={p.n} className="group relative">
                  <div className="hidden lg:flex absolute -top-2 left-1/2 -translate-x-1/2 h-5 w-5 items-center justify-center">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-glow shadow-[0_0_12px_var(--brand-glow)]" />
                  </div>
                  <SpotlightCard className="glass gradient-border rounded-2xl p-6 h-full">
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
                  </SpotlightCard>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-12 flex justify-center">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white glass-strong hover:bg-white/5 transition-all"
            >
              Become a Partner Host Company
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const TRACKS = [
  {
    n: "01",
    title: "Foundations",
    target: "Primary & Secondary",
    body: "Computational logic, core algorithmics, and early engineering foundations.",
  },
  {
    n: "02",
    title: "Specializations",
    target: "Undergraduate Learners",
    body: "Advanced AI models, data sciences, and biotechnology frameworks.",
  },
  {
    n: "03",
    title: "Growth Hub",
    target: "Business Owners",
    body: "Enterprise digital transformation, cloud scaling, and modern technical workflows.",
  },
];

function NerdHaven() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "err" | "loading" | "dup">("idle");

  async function submit(e: FormEvent) {
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
    <section id="nerdhaven" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12 lg:p-16">
            <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-brand-blue/25 blur-[120px]" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-brand-purple/25 blur-[120px]" />

            <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="flex-shrink-0 rounded-3xl border border-white/10 bg-white/5 p-4">
                <img
                  src={nerdhavenLogo}
                  alt="NerdHaven logo"
                  width={64}
                  height={64}
                  loading="lazy"
                  decoding="async"
                  className="h-16 w-16 object-contain"
                />
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
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {TRACKS.map((t) => (
              <SpotlightCard
                key={t.n}
                className="rounded-2xl border border-hairline bg-white/[0.02] p-6 backdrop-blur-sm"
              >
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
              </SpotlightCard>
            ))}
          </div>
        </Reveal>

        <Reveal delay={250}>
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
              <CheckCircle2 className="h-4 w-4" /> You're on the list — confirmation will arrive
              shortly.
            </p>
          )}
          {state === "dup" && (
            <p className="relative mt-3 text-sm text-brand-glow">You're already on the waitlist.</p>
          )}
          {state === "err" && (
            <p className="relative mt-3 text-sm text-destructive">
              Please enter a valid email address.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Who is Nextwave for?",
    a: "Young learners, educators, partner companies, and organizations across Nigeria — especially Northern Nigeria — who want to be part of Africa's deep-tech future. We work across schools, universities, and industry.",
  },
  {
    q: "How does the Nextwave Bootcamp work?",
    a: "It's a four-phase pipeline: Strategic Outreach masterclasses, a rigorous Aptitude Challenge, Industry Immersion inside premier IT companies, and Launchpad Deployment into high-impact internships for exceptional candidates.",
  },
  {
    q: "What is NerdHaven?",
    a: "NerdHaven is Nextwave's upcoming borderless digital academy — a learning platform with three tracks spanning foundations, specializations, and business-oriented growth skills. Join the waitlist to secure early access.",
  },
  {
    q: "How can my company become a Partner Host Company?",
    a: "Partner host companies host top bootcamp candidates, shadowing senior engineers in live workflows. Reach out via the contact page and the team will work through engagement terms with you.",
  },
  {
    q: "How do I get involved or volunteer?",
    a: "Use the contact form and select the Volunteer Application intent. The operations team reviews every submission and responds directly.",
  },
];

function FaqSection() {
  return (
    <section className="relative py-24 lg:py-28">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <Reveal>
          <div className="text-center">
            <SectionEyebrow>Questions</SectionEyebrow>
            <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Quick <span className="gradient-text">answers.</span>
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Everything you need to know about the movement, the bootcamp, and NerdHaven.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Accordion type="single" collapsible className="mt-12 w-full space-y-3">
            {FAQS.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="glass gradient-border rounded-2xl border-0 px-6"
              >
                <AccordionTrigger className="flex-1 text-left text-base font-semibold text-white py-5 [&[data-state=open]>svg]:rotate-180 [&>svg]:transition-transform [&>svg]:text-brand-glow">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl glass-strong px-8 py-14 sm:px-14 text-center">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-brand-purple/25 blur-[130px]" />
            <div className="absolute inset-0 grid-bg opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />
            <div className="relative">
              <Rocket className="mx-auto h-9 w-9 text-brand-glow" strokeWidth={1.5} />
              <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                Ready to build <span className="gradient-text">Africa's next wave?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
                Whether you're a learner, a partner host company, or an organization aligned with
                our mission — there's a seat at the table.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03]"
                  style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
                >
                  Join the Movement
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/projects"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white glass-strong hover:bg-white/5 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  See Our Initiatives
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
