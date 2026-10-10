import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, TrendingUp } from "lucide-react";
import type { LgaAverage, Trend } from "@/lib/readiness/types";

export function SampleDataBanner() {
  return (
    <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-3.5">
      <p className="flex items-start gap-2.5 text-sm text-amber-100">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          <strong className="font-semibold">Sample data.</strong> The figures, schools and scores on
          this page are fictional demonstration data used to review the tool. They are not real
          assessments.
        </span>
      </p>
    </div>
  );
}

export function LgaRanking({ data }: { data: LgaAverage[] }) {
  return (
    <figure className="space-y-3">
      {data.map((l) => (
        <div key={l.lga} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-sm text-white sm:w-44">{l.lga}</span>
          {l.meetsThreshold ? (
            <>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${l.averageScore}%`, background: "var(--gradient-brand)" }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {l.averageScore} · {l.schools} schools
              </span>
            </>
          ) : (
            <span className="flex-1 text-xs text-muted-foreground">
              Not shown yet — needs at least 5 schools for privacy (currently {l.schools}).
            </span>
          )}
        </div>
      ))}
      <figcaption className="pt-1 text-xs text-muted-foreground">
        Local government areas with fewer than 5 assessed schools are listed but not scored, so no
        single school can be identified from an average.
      </figcaption>
    </figure>
  );
}

export function TrendList({ data }: { data: Trend[] }) {
  if (data.length === 0) return null;
  return (
    <div className="space-y-3">
      {data.map((t) => (
        <Link
          key={t.schoolId}
          to="/readiness/$slug"
          params={{ slug: t.slug }}
          className="group flex items-center justify-between gap-4 rounded-xl border border-hairline bg-white/[0.02] px-4 py-3 transition-colors hover:border-brand-purple/40"
        >
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-white">{t.name}</div>
            <div className="text-xs text-muted-foreground">
              {t.lga} · {t.firstYear} → {t.latestYear}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs tabular-nums text-muted-foreground">
              {t.firstScore} → {t.latestScore}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-purple/40 bg-brand-purple/10 px-2.5 py-1 text-xs font-semibold text-brand-glow">
              <TrendingUp className="h-3.5 w-3.5" />+{t.change}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ReadinessCta() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div className="glass-strong rounded-2xl border border-hairline p-6">
        <h3 className="text-lg font-semibold text-white">Get your school assessed</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Any school in Kaduna State can request a visit. Assessment is free to schools and your
          results are yours.
        </p>
        <Link
          to="/contact"
          search={{ intent: "assessment" }}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-glow hover:gap-3 transition-all"
        >
          Request an assessment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="glass-strong rounded-2xl border border-hairline p-6">
        <h3 className="text-lg font-semibold text-white">Help close the gaps</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Funders, companies and government partners can support the pillars where schools need the
          most help.
        </p>
        <Link
          to="/contact"
          search={{ intent: "partner" }}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-glow hover:gap-3 transition-all"
        >
          Partner with Nextwave <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
