"use client";

import { Download } from "lucide-react";
import type { LgaAverage, PillarAverage, ReadinessStats, TierDatum } from "@/lib/readiness/types";

type Props = {
  stats: ReadinessStats;
  tiers: TierDatum[];
  pillars: PillarAverage[];
  lgas: LgaAverage[];
};

export function DownloadAggregates({ stats, tiers, pillars, lgas }: Props) {
  function download() {
    const rows: string[][] = [
      ["NTRI aggregate data (sample)"],
      [],
      ["Headline metric", "Value"],
      ["Schools assessed", String(stats.schoolsAssessed)],
      ["LGAs covered", String(stats.lgasCovered)],
      ["Average score", String(stats.averageScore)],
      ["% with reliable power", `${stats.powerReliablePct}%`],
      ["% with working internet", `${stats.internetPct}%`],
      [],
      ["Tier", "Schools"],
      ...tiers.map((t) => [t.label, String(t.count)]),
      [],
      ["Pillar", "Percent of available points"],
      ...pillars.map((p) => [p.label, `${p.percent}%`]),
      [],
      ["LGA", "Schools", "Average score"],
      ...lgas.map((l) => [
        l.lga,
        String(l.schools),
        l.meetsThreshold ? String(l.averageScore) : "below threshold",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nextwave-readiness-aggregates.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] px-4 py-2 text-sm text-muted-foreground hover:text-white hover:border-brand-purple/50 transition-all"
    >
      <Download className="h-4 w-4" /> Download aggregate data (CSV)
    </button>
  );
}
