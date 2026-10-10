import { PILLARS, TIERS_BY_KEY, type PillarKey } from "./rubric";
import { SAMPLE_ASSESSMENTS, SAMPLE_SCHOOLS } from "./sample-data";
import { scoreAssessment } from "./scoring";
import type {
  Assessment,
  LgaAverage,
  PillarAverage,
  ReadinessStats,
  School,
  SchoolFilters,
  SchoolWithAssessment,
  TierDatum,
  Trend,
} from "./types";
import type { TierKey } from "./rubric";

/**
 * Single flag to remove all sample data. When Supabase is live, flip this to
 * false and populate LIVE_SCHOOLS / LIVE_ASSESSMENTS from the public views.
 */
export const SAMPLE_DATA_ENABLED = true;

export const LGA_AGGREGATE_THRESHOLD = 5;

function latestPublished(assessments: Assessment[]): Map<string, Assessment> {
  const bySchool = new Map<string, Assessment>();
  for (const a of assessments) {
    if (a.status !== "published") continue;
    const existing = bySchool.get(a.schoolId);
    if (!existing || a.assessmentDate > existing.assessmentDate) bySchool.set(a.schoolId, a);
  }
  return bySchool;
}

/** Schools that may be shown publicly: consent granted AND a published assessment. */
export function getPublishedRecords(): SchoolWithAssessment[] {
  const latest = latestPublished(SAMPLE_ASSESSMENTS);
  const records: SchoolWithAssessment[] = [];
  for (const school of SAMPLE_SCHOOLS) {
    if (school.consentStatus !== "granted") continue;
    const assessment = latest.get(school.id);
    if (!assessment) continue;
    const history = SAMPLE_ASSESSMENTS.filter(
      (a) => a.schoolId === school.id && a.status === "published",
    ).sort((a, b) => (a.assessmentDate < b.assessmentDate ? -1 : 1));
    records.push({ school, assessment, history });
  }
  return records;
}

export function getStats(records = getPublishedRecords()): ReadinessStats {
  if (records.length === 0) {
    return {
      schoolsAssessed: 0,
      lgasCovered: 0,
      averageScore: 0,
      powerReliablePct: 0,
      internetPct: 0,
    };
  }
  const lgas = new Set(records.map((r) => r.school.lga));
  const avg = records.reduce((s, r) => s + (r.assessment.totalScore ?? 0), 0) / records.length;
  const powerOk = records.filter(
    (r) => indicatorScore(r.assessment, "grid_reliability") >= 3,
  ).length;
  const netOk = records.filter(
    (r) => indicatorScore(r.assessment, "internet_availability") >= 3,
  ).length;
  return {
    schoolsAssessed: records.length,
    lgasCovered: lgas.size,
    averageScore: Math.round(avg * 10) / 10,
    powerReliablePct: Math.round((powerOk / records.length) * 100),
    internetPct: Math.round((netOk / records.length) * 100),
  };
}

export function indicatorScore(assessment: Assessment, key: string): number {
  return assessment.scores.find((s) => s.indicatorKey === key)?.score ?? 0;
}

export function getTierDistribution(records = getPublishedRecords()): TierDatum[] {
  const counts = new Map<TierKey, number>();
  for (const r of records) {
    if (!r.assessment.tier) continue;
    counts.set(r.assessment.tier, (counts.get(r.assessment.tier) ?? 0) + 1);
  }
  return Object.values(TIERS_BY_KEY).map((t) => ({
    tier: t.key,
    label: t.label,
    count: counts.get(t.key) ?? 0,
    color: t.color,
  }));
}

export function getPillarAverages(records = getPublishedRecords()): PillarAverage[] {
  return PILLARS.map((pillar) => {
    let earnedSum = 0;
    let availableSum = 0;
    for (const r of records) {
      const result = scoreAssessment(r.assessment.scores);
      const p = result.pillars.find((x) => x.pillar === pillar.key);
      if (!p) continue;
      earnedSum += p.earned;
      availableSum += p.available;
    }
    const percent = availableSum === 0 ? 0 : Math.round((earnedSum / availableSum) * 1000) / 10;
    return {
      pillar: pillar.key,
      label: pillar.label,
      averagePoints: Math.round((earnedSum / Math.max(records.length, 1)) * 10) / 10,
      averageAvailable: pillar.weight,
      percent,
    };
  });
}

export function getLgaAverages(records = getPublishedRecords()): LgaAverage[] {
  const groups = new Map<string, number[]>();
  for (const r of records) {
    const list = groups.get(r.school.lga) ?? [];
    list.push(r.assessment.totalScore ?? 0);
    groups.set(r.school.lga, list);
  }
  return [...groups.entries()]
    .map(([lga, scores]) => ({
      lga,
      schools: scores.length,
      averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      meetsThreshold: scores.length >= LGA_AGGREGATE_THRESHOLD,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);
}

export function listSchools(filters: SchoolFilters = {}): SchoolWithAssessment[] {
  let records = getPublishedRecords();
  if (filters.lga) records = records.filter((r) => r.school.lga === filters.lga);
  if (filters.type) records = records.filter((r) => r.school.type === filters.type);
  if (filters.level) records = records.filter((r) => r.school.level === filters.level);
  if (filters.tier) records = records.filter((r) => r.assessment.tier === filters.tier);
  if (filters.year)
    records = records.filter(
      (r) => new Date(r.assessment.assessmentDate).getFullYear() === filters.year,
    );
  if (filters.search) {
    const q = filters.search.toLowerCase();
    records = records.filter(
      (r) =>
        r.school.name.toLowerCase().includes(q) ||
        r.school.lga.toLowerCase().includes(q) ||
        (r.school.ward ?? "").toLowerCase().includes(q),
    );
  }
  const sort = filters.sort ?? "name";
  records.sort((a, b) => {
    if (sort === "lga")
      return a.school.lga.localeCompare(b.school.lga) || a.school.name.localeCompare(b.school.name);
    if (sort === "recent")
      return b.assessment.assessmentDate.localeCompare(a.assessment.assessmentDate);
    return a.school.name.localeCompare(b.school.name);
  });
  return records;
}

export function getSchoolBySlug(slug: string): SchoolWithAssessment | null {
  return getPublishedRecords().find((r) => r.school.slug === slug) ?? null;
}

export function getSchoolSlugs(): string[] {
  return getPublishedRecords().map((r) => r.school.slug);
}

export function getTrends(records = getPublishedRecords()): Trend[] {
  return records
    .filter((r) => r.history.length >= 2)
    .map((r) => {
      const first = r.history[0];
      const latest = r.history[r.history.length - 1];
      const firstScore = first.totalScore ?? 0;
      const latestScore = latest.totalScore ?? 0;
      return {
        schoolId: r.school.id,
        slug: r.school.slug,
        name: r.school.name,
        lga: r.school.lga,
        firstScore,
        latestScore,
        change: Math.round((latestScore - firstScore) * 10) / 10,
        firstYear: new Date(first.assessmentDate).getFullYear(),
        latestYear: new Date(latest.assessmentDate).getFullYear(),
      };
    })
    .sort((a, b) => b.change - a.change);
}

export function getFilterOptions(records = getPublishedRecords()) {
  const lgas = [...new Set(records.map((r) => r.school.lga))].sort();
  const types = [...new Set(records.map((r) => r.school.type))].sort();
  const levels = [...new Set(records.map((r) => r.school.level))].sort();
  const years = [
    ...new Set(records.map((r) => new Date(r.assessment.assessmentDate).getFullYear())),
  ].sort((a, b) => b - a);
  return { lgas, types, levels, years };
}

export function countsByPillarLow(records: SchoolWithAssessment[], pillar: PillarKey): number {
  return records.filter((r) => {
    const p = scoreAssessment(r.assessment.scores).pillars.find((x) => x.pillar === pillar);
    return p ? p.percent < 50 : false;
  }).length;
}

export type { School };
