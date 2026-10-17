import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Building2,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Aurora } from "@/components/Aurora";
import { RadarChart, TierBadge } from "@/components/readiness/charts";
import { SampleDataBanner } from "@/components/readiness/panels";
import { CorrectionForm } from "@/components/readiness/CorrectionForm";
import {
  effectiveScore,
  indicatorPoints,
  round1,
  scoreAssessment,
  strengthsAndGaps,
} from "@/lib/readiness/scoring";
import {
  EVIDENCE_TYPES,
  LEVEL_DESCRIPTORS,
  PILLARS,
  TIERS_BY_KEY,
  type PillarKey,
} from "@/lib/readiness/rubric";
import type { SchoolWithAssessment } from "@/lib/readiness/types";
import { loadPublishedRecords } from "@/lib/readiness/store";

export const Route = createFileRoute("/readiness/$slug")({
  loader: async ({ params }) => {
    const { records, usingSample } = await loadPublishedRecords();
    return {
      record: records.find((r) => r.school.slug === params.slug) ?? null,
      usingSample,
      slug: params.slug,
    };
  },
  head: ({ loaderData }) => {
    const r = loaderData?.record;
    const title = r
      ? `${r.school.name} — Tech Readiness | Nextwave`
      : "School Tech Readiness — Nextwave";
    const desc = r
      ? `${r.school.name} (${r.school.lga}) scored ${r.assessment.totalScore}/100 on the Nextwave School Tech Readiness Index.`
      : "A school's technology-readiness profile from the Nextwave School Tech Readiness Index.";
    const ogImage = r
      ? `https://nextwave.com.ng/og/${r.school.slug}.png`
      : "https://nextwave.com.ng/og.jpg";
    const url = r
      ? `https://nextwave.com.ng/readiness/${r.school.slug}`
      : "https://nextwave.com.ng/readiness";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: ogImage },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: SchoolProfile,
});

const PROGRAM_BY_PILLAR: Record<PillarKey, { title: string; text: string }> = {
  power: {
    title: "Infrastructure & power support",
    text: "We help schools plan affordable backup power and safe equipment storage, including through partner programmes.",
  },
  devices: {
    title: "Devices & lab programme",
    text: "Access to refurbished devices, lab setup guidance and shared-equipment partnerships.",
  },
  connectivity: {
    title: "Connectivity partnerships",
    text: "We connect schools to low-cost connectivity options and community access models.",
  },
  curriculum: {
    title: "Teacher training & curriculum",
    text: "Teacher digital-skills training and ready-made ICT and coding lesson plans for the timetable.",
  },
  students: {
    title: "Bootcamp & NerdHaven",
    text: "Direct student programmes — the Nextwave Bootcamp and NerdHaven — to build hands-on digital skills.",
  },
  leadership: {
    title: "ICT planning & governance",
    text: "Templates and support for ICT plans, maintenance budgets and child-safeguarding policies.",
  },
};

function cap(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function fmt(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function SchoolProfile() {
  const { record, usingSample } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-28 pb-16 lg:pt-36 overflow-hidden">
        <Aurora className="opacity-30" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/readiness"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> All readiness data
            </Link>
            {record && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground hover:text-white hover:border-brand-purple/50 transition-colors"
              >
                <Printer className="h-4 w-4" /> Print / save as PDF
              </button>
            )}
          </div>

          {!record ? (
            <div className="mt-10 rounded-3xl glass-strong p-12 text-center">
              <GraduationCap className="mx-auto h-9 w-9 text-brand-glow" strokeWidth={1.5} />
              <h1 className="mt-5 text-2xl font-bold text-white">School not found.</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                This school is not published, or has not consented to be listed.
              </p>
            </div>
          ) : (
            <ProfileBody record={record} usingSample={usingSample} />
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProfileBody({
  record,
  usingSample,
}: {
  record: SchoolWithAssessment;
  usingSample: boolean;
}) {
  const { school, assessment, history } = record;
  const result = scoreAssessment(assessment.scores);
  const { strengths, gaps } = strengthsAndGaps(result.pillars);
  const lowest = [...result.pillars].sort((a, b) => a.percent - b.percent).slice(0, 2);
  const tierInfo = assessment.tier ? TIERS_BY_KEY[assessment.tier] : null;

  return (
    <div className="mt-6">
      {usingSample && (
        <div className="mb-6">
          <SampleDataBanner />
        </div>
      )}

      <Reveal>
        <SectionEyebrow>School profile</SectionEyebrow>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-2xl">
              {school.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {school.lga}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" /> {cap(school.type)} · {cap(school.level)}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> Assessed {fmt(assessment.assessmentDate)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-4xl font-bold text-white">
                {assessment.totalScore}
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <div className="mt-1">
                <TierBadge tier={assessment.tier} size="lg" />
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          {strengths[0]?.text} {gaps[0]?.text}
        </p>
      </Reveal>

      <Reveal delay={40}>
        <div className="mt-8 glass rounded-2xl border border-hairline p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <Info className="h-5 w-5 text-brand-glow" /> How to read this score
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tierInfo
                  ? `A total of ${assessment.totalScore}/100 places this school in the ${tierInfo.label} tier (${tierInfo.min}–${tierInfo.max}). ${tierInfo.blurb}`
                  : "This assessment is not yet scored."}
              </p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Higher is stronger. The score reflects what is in place today, not potential.
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Each of the six pillars is scored 0–4 on written descriptors, then weighted to a
                100-point total. Evidence is graded, and self-reported evidence is capped at 2 of 4
                so it cannot score as highly as something an assessor verified.
              </p>
              <Link
                to="/readiness/methodology"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-glow hover:underline"
              >
                Read the full methodology →
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="section-divider mt-12" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="glass rounded-2xl border border-hairline p-6">
            <h2 className="text-lg font-semibold text-white">Pillar profile</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              How this school scores across the six NTRI pillars.
            </p>
            <div className="mt-6">
              <RadarChart data={result.pillars} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="glass rounded-2xl border border-hairline p-6">
            <h2 className="text-lg font-semibold text-white">Pillar breakdown</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Points earned out of points available.
            </p>
            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Pillar</th>
                  <th className="pb-2 text-right font-medium">Earned</th>
                  <th className="pb-2 text-right font-medium">Available</th>
                </tr>
              </thead>
              <tbody>
                {result.pillars.map((p) => (
                  <tr key={p.pillar} className="border-t border-hairline/60">
                    <td className="py-2.5 pr-3 text-muted-foreground">{p.label}</td>
                    <td className="py-2.5 text-right tabular-nums text-white">{p.earned}</td>
                    <td className="py-2.5 text-right tabular-nums text-muted-foreground">
                      {p.available}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-12 glass rounded-2xl border border-hairline p-6">
          <h2 className="text-lg font-semibold text-white">Indicator detail</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Every indicator behind this school's score, with the level reached, the evidence used
            and the points earned.
          </p>
          <div className="mt-6 space-y-7">
            {PILLARS.map((pillar) => {
              const pillarResult = result.pillars.find((p) => p.pillar === pillar.key);
              return (
                <div key={pillar.key}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{pillar.label}</h3>
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {pillarResult?.earned ?? 0}/{pillarResult?.available ?? pillar.weight} pts ·{" "}
                      {pillarResult?.percent ?? 0}%
                    </span>
                  </div>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                          <th className="pb-2 pr-3 font-medium">Indicator</th>
                          <th className="pb-2 px-3 font-medium">Level</th>
                          <th className="pb-2 px-3 font-medium">Evidence</th>
                          <th className="pb-2 pl-3 text-right font-medium">Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pillar.indicators.map((ind) => {
                          const s = assessment.scores.find((x) => x.indicatorKey === ind.key);
                          const raw = s?.score ?? null;
                          const ev = s?.evidenceType ?? "observed";
                          const eff = typeof raw === "number" ? effectiveScore(raw, ev) : null;
                          const level =
                            eff !== null
                              ? LEVEL_DESCRIPTORS.find((d) => d.score === eff)
                              : undefined;
                          const evidence = EVIDENCE_TYPES.find((e) => e.key === s?.evidenceType);
                          const pts =
                            typeof raw === "number" ? indicatorPoints(raw, ind.weight, ev) : null;
                          return (
                            <tr key={ind.key} className="border-t border-hairline/60 align-top">
                              <td className="py-2.5 pr-3 text-muted-foreground">{ind.label}</td>
                              <td className="py-2.5 px-3 text-white">
                                {level ? (
                                  <>
                                    {level.label}
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      ({eff}/4)
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">Not scored</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-muted-foreground">
                                {evidence?.label ?? "—"}
                                {s?.evidenceType === "self_reported" && (
                                  <span className="text-amber-300"> · capped</span>
                                )}
                              </td>
                              <td className="py-2.5 pl-3 text-right tabular-nums text-white">
                                {pts !== null ? `${round1(pts)}/${ind.weight}` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Level 0–4: {LEVEL_DESCRIPTORS.map((d) => `${d.score} ${d.label}`).join(" · ")}.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="glass rounded-2xl border border-hairline p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <CheckCircle2 className="h-5 w-5 text-brand-glow" /> Strengths
            </h2>
            <ul className="mt-4 space-y-3">
              {strengths.map((s) => (
                <li key={s.pillar} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow" />
                  {s.text}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="glass rounded-2xl border border-hairline p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <AlertTriangle className="h-5 w-5 text-amber-300" /> Priority gaps
            </h2>
            <ul className="mt-4 space-y-3">
              {gaps.map((g) => (
                <li key={g.pillar} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                  {g.text}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-12 glass rounded-2xl border border-hairline p-6">
          <h2 className="text-lg font-semibold text-white">Evidence used</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The kinds of evidence behind each pillar. Weaker, self-reported evidence is capped so it
            cannot score as highly as something we verified.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, idx) => {
              const keys = new Set(
                assessment.scores.filter((s) => s.pillar === p.key).map((s) => s.evidenceType),
              );
              return (
                <div key={p.key} className="rounded-xl border border-hairline bg-white/[0.02] p-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[11px] font-semibold tabular-nums text-brand-purple/70">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <div className="text-sm font-medium text-white">{p.label}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {[...keys].map((k) => {
                      const meta = EVIDENCE_TYPES.find((e) => e.key === k);
                      return (
                        <span
                          key={k}
                          className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {meta?.label ?? k}
                          {k === "self_reported" && (
                            <span className="text-amber-300"> · capped</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="section-divider mt-12" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="glass rounded-2xl border border-hairline p-6">
            <h2 className="text-lg font-semibold text-white">Assessment history</h2>
            <div className="mt-5 space-y-4">
              {history.map((h, i) => {
                const prev = i > 0 ? (history[i - 1].totalScore ?? 0) : null;
                const change =
                  prev !== null ? Math.round(((h.totalScore ?? 0) - prev) * 10) / 10 : null;
                return (
                  <div
                    key={h.id}
                    className="flex items-center justify-between gap-4 border-l-2 border-brand-purple/40 pl-4"
                  >
                    <div>
                      <div className="text-sm text-white">{fmt(h.assessmentDate)}</div>
                      <div className="text-xs text-muted-foreground">Rubric v{h.rubricVersion}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white">{h.totalScore}</span>
                      <TierBadge tier={h.tier} />
                      {change !== null && (
                        <span className="text-xs font-medium text-brand-glow">
                          {change >= 0 ? "+" : ""}
                          {change}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="glass rounded-2xl border border-hairline p-6">
            <h2 className="text-lg font-semibold text-white">What Nextwave can offer</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Based on this school's lowest pillars, these programmes are the best next step.
            </p>
            <div className="mt-5 space-y-4">
              {lowest.map((p) => {
                const prog = PROGRAM_BY_PILLAR[p.pillar];
                return (
                  <div
                    key={p.pillar}
                    className="rounded-xl border border-hairline bg-white/[0.02] p-4"
                  >
                    <div className="text-sm font-medium text-white">{prog.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{prog.text}</p>
                  </div>
                );
              })}
            </div>
            <Link
              to="/contact"
              search={{ intent: "partner" }}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-glow hover:underline"
            >
              Talk to us about supporting this school →
            </Link>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <div className="mt-12 glass rounded-2xl border border-hairline p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
            <ShieldCheck className="h-5 w-5 text-brand-glow" /> Method & limitations
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
              Each school is scored independently by two Nextwave assessors; where they differ by
              more than one point, the score is reconciled with a written note before submission.
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
              Every indicator carries one evidence type. Self-reported evidence is capped at 2 of 4
              points so it cannot score as highly as an assessor-verified result.
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
              Student capability is measured through sampled tests and reported only as an aggregate
              for the school — never individual results, names or identifiable photos.
            </li>
            <li className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-glow/70" />
              This profile was scored under rubric v{assessment.rubricVersion} and is re-assessed
              annually.
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            {usingSample
              ? "These figures are illustrative sample data, not a real assessment. "
              : ""}
            Results are published only with the school's consent.{" "}
            <Link to="/readiness/methodology" className="text-brand-glow hover:underline">
              Read the full methodology
            </Link>
            .
          </p>
        </div>
      </Reveal>

      <div className="section-divider mt-12" />
      <Reveal>
        <div className="mt-8 glass rounded-2xl border border-hairline p-6">
          <h2 className="text-lg font-semibold text-white">Something look wrong?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Schools and parents can report a correction. We verify each report against our records.
          </p>
          <div className="mt-4">
            <CorrectionForm schoolName={school.name} />
          </div>
        </div>
      </Reveal>

      <p className="mt-10 border-t border-hairline pt-6 text-xs text-muted-foreground">
        Assessed by Nextwave Infotech · {fmt(assessment.assessmentDate)} · Rubric v
        {assessment.rubricVersion}. Consent status: {school.consentStatus}. Published results are
        reviewed by the school before publication.
      </p>
    </div>
  );
}
