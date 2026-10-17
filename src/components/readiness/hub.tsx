import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  Layers,
  Lightbulb,
  MapPinned,
  Presentation,
  Scale,
  ShieldCheck,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { TIERS } from "@/lib/readiness/rubric";
import type { LgaAverage, PillarAverage, ReadinessStats } from "@/lib/readiness/types";

export function KeyTakeaways({
  stats,
  pillars,
}: {
  stats: ReadinessStats;
  pillars: PillarAverage[];
}) {
  const sorted = [...pillars].sort((a, b) => b.percent - a.percent);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const items: { icon: LucideIcon; value: string; label: string }[] = [
    {
      icon: Scale,
      value: `${stats.averageScore}/100`,
      label: `Average score across ${stats.schoolsAssessed} assessed schools`,
    },
    strongest
      ? {
          icon: Layers,
          value: `${Math.round(strongest.percent)}%`,
          label: `Strongest pillar: ${strongest.label}`,
        }
      : { icon: Layers, value: "—", label: "No pillar data yet" },
    weakest
      ? {
          icon: Lightbulb,
          value: `${Math.round(weakest.percent)}%`,
          label: `Biggest gap: ${weakest.label}`,
        }
      : { icon: Lightbulb, value: "—", label: "No pillar data yet" },
    {
      icon: Zap,
      value: `${stats.powerReliablePct}%`,
      label: "of schools have reliable power",
    },
  ];

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
          <Sparkles className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-lg font-semibold text-white">Key takeaways</h2>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-2xl border border-hairline border-l-2 border-l-brand-purple/40 bg-white/[0.02] p-5"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.03] text-brand-glow">
              <it.icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="mt-3 text-2xl font-bold text-white tabular-nums">{it.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{it.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowToRead() {
  const points: { icon: LucideIcon; title: string; text: string }[] = [
    {
      icon: Scale,
      title: "Scored 0–100",
      text: "Six weighted pillars, each scored 0–4 on written descriptors, add up to a total out of 100.",
    },
    {
      icon: Layers,
      title: "Five tiers",
      text: "The total places each school in a tier, from Foundational to Leading. Higher is stronger.",
    },
    {
      icon: ShieldCheck,
      title: "Evidence-graded",
      text: "Every indicator carries an evidence type. Self-reported evidence is capped at 2 of 4 points.",
    },
    {
      icon: MapPinned,
      title: "No ranking",
      text: "This is a growth tool, not a league table. Schools are shown individually, not ranked against each other.",
    },
  ];
  return (
    <section className="mt-12 glass rounded-2xl border border-hairline p-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
          <BookOpen className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-lg font-semibold text-white">How to read this</h2>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((p) => (
          <div key={p.title}>
            <div className="flex items-center gap-2">
              <p.icon className="h-4 w-4 text-brand-glow" strokeWidth={1.75} />
              <div className="text-sm font-medium text-white">{p.title}</div>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          to="/readiness/methodology"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-glow hover:underline"
        >
          Read the methodology <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

export function SampleLimitations({
  usingSample,
  stats,
  lgas,
}: {
  usingSample: boolean;
  stats: ReadinessStats;
  lgas: LgaAverage[];
}) {
  const belowThreshold = lgas.filter((l) => !l.meetsThreshold).length;
  return (
    <section className="mt-12 glass rounded-2xl border border-hairline p-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
          <ClipboardCheck className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-lg font-semibold text-white">Sample &amp; limitations</h2>
      </div>
      <ul className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
          {stats.schoolsAssessed} schools across {stats.lgasCovered} LGAs are published so far —
          this is an emerging, not exhaustive, picture of Kaduna State.
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
          Only schools that have given consent are listed. Declined or withheld results never
          appear.
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
          LGA and overall averages are shown only where at least 5 schools contribute
          {belowThreshold > 0
            ? ` (${belowThreshold} LGA${belowThreshold === 1 ? "" : "s"} hidden)`
            : ""}
          .
        </li>
        <li className="flex gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
          Student capability is sampled and reported only as an aggregate — never individual results
          or identifiable photos.
        </li>
      </ul>
      {usingSample && (
        <p className="mt-4 text-xs text-amber-200">
          Sample data: the figures on this page are fictional demonstration data used to review the
          tool, not real assessments.
        </p>
      )}
    </section>
  );
}

function bandForScore(score: number) {
  return TIERS.find((t) => score >= t.min && score <= t.max) ?? TIERS[0];
}

export function LgaMap({ data }: { data: LgaAverage[] }) {
  return (
    <section className="mt-12 glass rounded-2xl border border-hairline p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
            <MapPinned className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <h2 className="text-lg font-semibold text-white">Coverage by LGA</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {TIERS.map((t) => (
            <span key={t.key} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Kaduna State local government areas with a published average. Areas with fewer than five
        assessed schools are held back for privacy.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((l) => {
          const band = l.meetsThreshold ? bandForScore(l.averageScore) : null;
          return (
            <div
              key={l.lga}
              className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4"
              style={band ? { borderLeft: `3px solid ${band.color}` } : undefined}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">{l.lga}</div>
                <div className="text-xs text-muted-foreground">
                  {l.schools} {l.schools === 1 ? "school" : "schools"}
                </div>
              </div>
              {l.meetsThreshold && band ? (
                <div className="text-right">
                  <div className="text-lg font-bold text-white tabular-nums">{l.averageScore}</div>
                  <div className="text-[11px]" style={{ color: band.color }}>
                    {band.label}
                  </div>
                </div>
              ) : (
                <span className="text-right text-[11px] text-muted-foreground">
                  Below threshold
                  <br />
                  (needs 5)
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function TrustProcess() {
  const steps: { icon: LucideIcon; title: string; text: string }[] = [
    {
      icon: Presentation,
      title: "Two assessors visit",
      text: "Each school is scored independently by two Nextwave assessors during an on-site visit.",
    },
    {
      icon: Scale,
      title: "Reconciliation",
      text: "Where scores differ by more than one point, assessors reconcile with a written note before submission.",
    },
    {
      icon: ClipboardCheck,
      title: "School review",
      text: "The school's contact gets a secure link to review the result and request corrections within 14 days.",
    },
    {
      icon: ShieldCheck,
      title: "Publish or withhold",
      text: "Results are published only with consent, and only after review. A school can ask to be removed at any time.",
    },
  ];
  return (
    <section className="mt-12 glass rounded-2xl border border-hairline p-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-lg font-semibold text-white">Trust &amp; process</h2>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-xl border border-hairline bg-white/[0.02] p-5">
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-brand-glow" strokeWidth={1.75} />
              <span className="text-xs font-semibold tabular-nums text-brand-purple/70">
                0{i + 1}
              </span>
            </div>
            <div className="mt-3 text-sm font-medium text-white">{s.title}</div>
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Roadmap() {
  const steps = [
    { when: "Now", what: "Publish the first cohort of assessed schools across Kaduna State." },
    {
      when: "Next",
      what: "Extend coverage to every LGA in Kaduna State and reach the n≥5 threshold everywhere.",
    },
    {
      when: "Then",
      what: "Re-assess schools annually so progress is tracked on a consistent rubric.",
    },
    {
      when: "Later",
      what: "Open the datasets and connect schools to the partners who can close their biggest gaps.",
    },
  ];
  return (
    <section className="mt-12 glass rounded-2xl border border-hairline p-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
          <CalendarClock className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-lg font-semibold text-white">Roadmap</h2>
      </div>
      <ol className="mt-5 space-y-4">
        {steps.map((s) => (
          <li key={s.when} className="flex gap-4 border-l-2 border-brand-purple/40 pl-4">
            <div>
              <div className="text-sm font-semibold text-white">{s.when}</div>
              <p className="mt-0.5 text-sm text-muted-foreground">{s.what}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

const FAQS = [
  {
    q: "Is this a ranking of schools?",
    a: "No. There is no leaderboard and schools are never ranked against each other. The index exists to show each school its own readiness and where support is most needed.",
  },
  {
    q: "Why are some LGAs not scored?",
    a: "To protect individual schools, an LGA or overall average is shown only where at least five schools contribute. Below that, publishing an average could effectively reveal a single school's result.",
  },
  {
    q: "Is student data ever published?",
    a: "Never. Student capability is measured through sampled tests and reported only as an aggregate per school. No names, no individual results and no identifiable photos of minors are stored or published.",
  },
  {
    q: "How can my school be assessed?",
    a: "Any school can request a free assessment using the request form below or the contact page. Assessment is free to schools and the results are theirs.",
  },
  {
    q: "How often is the index updated?",
    a: "Schools are re-assessed annually. Where a school has been assessed more than once, its profile shows the change since its first assessment.",
  },
];

export function ReadinessFaq() {
  return (
    <section className="mt-12">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
          <Lightbulb className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-lg font-semibold text-white">Questions</h2>
      </div>
      <div className="mt-5 space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-2xl border border-hairline bg-white/[0.02] p-5"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:hidden">
              <span className="flex items-center justify-between gap-4">
                {f.q}
                <span className="text-brand-glow transition-transform group-open:rotate-45">+</span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function PillarFunding({ pillars }: { pillars: PillarAverage[] }) {
  const ordered = [...pillars].sort((a, b) => a.percent - b.percent);
  return (
    <section className="mt-12 glass rounded-2xl border border-hairline p-6">
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-hairline bg-white/[0.02] text-brand-glow">
          <Zap className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <h2 className="text-lg font-semibold text-white">Fund a pillar</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Funders and partners can target the pillars where schools need the most help. Weakest first.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((p) => (
          <Link
            key={p.pillar}
            to="/contact"
            search={{ intent: "partner" }}
            className="group flex items-center justify-between gap-3 rounded-xl border border-hairline bg-white/[0.02] p-4 transition-colors hover:border-brand-purple/40"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-white group-hover:text-brand-glow">
                {p.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round(p.percent)}% funded today
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-glow" />
          </Link>
        ))}
      </div>
    </section>
  );
}
