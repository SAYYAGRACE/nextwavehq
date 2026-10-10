import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Aurora } from "@/components/Aurora";
import { TierBadge, TierBarChart, PillarBars } from "@/components/readiness/charts";
import {
  LgaRanking,
  ReadinessCta,
  SampleDataBanner,
  TrendList,
} from "@/components/readiness/panels";
import { SchoolDirectory } from "@/components/readiness/SchoolDirectory";
import { DownloadAggregates } from "@/components/readiness/DownloadAggregates";
import {
  SAMPLE_DATA_ENABLED,
  getFilterOptions,
  getLgaAverages,
  getPillarAverages,
  getPublishedRecords,
  getStats,
  getTierDistribution,
  getTrends,
} from "@/lib/readiness/store";

export const Route = createFileRoute("/readiness/")({
  head: () => ({
    meta: [
      { title: "School Tech Readiness Index — Nextwave" },
      {
        name: "description",
        content:
          "Mapping the tech readiness of Northern Nigeria's schools. Explore published NTRI scores, tier distribution and the gaps by pillar and LGA.",
      },
      { property: "og:title", content: "Nextwave School Tech Readiness Index (NTRI)" },
      {
        property: "og:description",
        content:
          "Public data on how ready Northern Nigeria's schools are for technology — by school, pillar and LGA.",
      },
      { property: "og:url", content: "https://nextwave.com.ng/readiness" },
      { property: "og:image", content: "https://nextwave.com.ng/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Nextwave School Tech Readiness Index (NTRI)" },
      {
        name: "twitter:description",
        content:
          "Public data on how ready Northern Nigeria's schools are for technology — by school, pillar and LGA.",
      },
      { name: "twitter:image", content: "https://nextwave.com.ng/og.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nextwave.com.ng/readiness" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Nextwave School Tech Readiness Index (NTRI)",
          description:
            "An open index of technology readiness across schools in Kaduna State, Nigeria, scored on a 100-point, six-pillar framework.",
          url: "https://nextwave.com.ng/readiness",
          creator: { "@type": "Organization", name: "Nextwave Infotech" },
          publisher: { "@type": "Organization", name: "Nextwave Infotech" },
          isAccessibleForFree: true,
          license: "https://nextwave.com.ng/terms",
          spatialCoverage: { "@type": "Place", name: "Kaduna State, Nigeria" },
          temporalCoverage: "2025/2026",
          measurementTechnique:
            "Two independent assessors, reconciled; published after school review.",
          variableMeasured: [
            "Power & Infrastructure",
            "Devices & Labs",
            "Connectivity",
            "Curriculum & Teachers",
            "Student Capability",
            "Leadership & Sustainability",
          ],
        }),
      },
    ],
  }),
  loader: () => {
    const records = getPublishedRecords();
    return {
      records,
      options: getFilterOptions(records),
      stats: getStats(records),
      tiers: getTierDistribution(records),
      pillars: getPillarAverages(records),
      lgas: getLgaAverages(records),
      trends: getTrends(records),
    };
  },
  component: ReadinessDashboard,
});

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="glass rounded-2xl border border-hairline p-5">
      <div className="text-3xl font-bold text-white">
        {value}
        {suffix && <span className="text-lg text-muted-foreground">{suffix}</span>}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function ReadinessDashboard() {
  const { records, options, stats, tiers, pillars, lgas, trends } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-28 pb-16 lg:pt-36 overflow-hidden">
        <Aurora className="opacity-30" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionEyebrow>Readiness</SectionEyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl">
              Mapping the tech readiness of{" "}
              <span className="gradient-text">Northern Nigeria's schools.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Our assessors visit schools and grade their technology readiness on a 100-point,
              six-pillar framework. Where schools are, and where they are heading.{" "}
              <Link to="/readiness/methodology" className="text-brand-glow hover:underline">
                Read the methodology
              </Link>
              .
            </p>
          </Reveal>

          {SAMPLE_DATA_ENABLED && (
            <Reveal delay={40}>
              <div className="mt-8">
                <SampleDataBanner />
              </div>
            </Reveal>
          )}

          <Reveal delay={80}>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard label="Schools assessed" value={stats.schoolsAssessed} />
              <StatCard label="LGAs covered" value={stats.lgasCovered} />
              <StatCard label="Average NTRI score" value={stats.averageScore} suffix="/100" />
              <StatCard label="with reliable power" value={stats.powerReliablePct} suffix="%" />
              <StatCard label="with working internet" value={stats.internetPct} suffix="%" />
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="glass rounded-2xl border border-hairline p-6 h-full">
                <h2 className="text-lg font-semibold text-white">Distribution by tier</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Counts of assessed schools. Higher tiers mean stronger readiness.
                </p>
                <div className="mt-6">
                  <TierBarChart data={tiers} />
                </div>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div className="glass rounded-2xl border border-hairline p-6 h-full">
                <h2 className="text-lg font-semibold text-white">Gaps by pillar</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Average share of available points earned across all assessed schools.
                </p>
                <div className="mt-6">
                  <PillarBars data={pillars} />
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-12 glass rounded-2xl border border-hairline p-6">
              <h2 className="text-lg font-semibold text-white">Average score by LGA</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Kaduna State local government areas, from highest to lowest.
              </p>
              <div className="mt-6">
                <LgaRanking data={lgas} />
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">School directory</h2>
                  <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                    Every assessed school that has agreed to be listed. There is no ranking and no
                    leaderboard — search, filter and open a school to see its full profile.
                  </p>
                </div>
                <DownloadAggregates stats={stats} tiers={tiers} pillars={pillars} lgas={lgas} />
              </div>
              <div className="mt-6">
                <SchoolDirectory records={records} options={options} />
              </div>
            </div>
          </Reveal>

          {trends.length > 0 && (
            <Reveal>
              <div className="mt-12 glass rounded-2xl border border-hairline p-6">
                <h2 className="text-lg font-semibold text-white">
                  Progress since first assessment
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Schools assessed more than once, showing the change in their total score.
                </p>
                <div className="mt-6">
                  <TrendList data={trends} />
                </div>
              </div>
            </Reveal>
          )}

          <Reveal>
            <div className="mt-12">
              <ReadinessCta />
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-10 flex items-center gap-3">
              <TierBadge tier="leading" />
              <Link
                to="/readiness/methodology"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
              >
                <BookOpen className="h-4 w-4" /> How we score schools
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
