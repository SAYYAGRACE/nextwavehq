import { PILLARS, TIERS_BY_KEY, type PillarKey, type TierKey } from "./rubric";
import { SAMPLE_ASSESSMENTS, SAMPLE_SCHOOLS } from "./sample-data";
import { scoreAssessment } from "./scoring";
import type {
  Assessment,
  EvidenceType,
  IndicatorScore,
  LgaAverage,
  PillarAverage,
  ReadinessStats,
  School,
  SchoolFilters,
  SchoolType,
  SchoolWithAssessment,
  TierDatum,
  Trend,
} from "./types";

/**
 * Public dashboard reads the read-only Supabase views (published + consent
 * granted only) when they are configured. If Supabase is missing or unreachable
 * the site falls back to the clearly-labelled sample data below.
 */
export const SAMPLE_DATA_ENABLED = true;

export const LGA_AGGREGATE_THRESHOLD = 5;

let liveCache: { records: SchoolWithAssessment[]; usingSample: boolean } | null = null;

function supabaseConfig(): { url?: string; key?: string } {
  let url: unknown;
  let key: unknown;
  try {
    url = import.meta.env?.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
    key = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  } catch {
    url = process.env.SUPABASE_URL;
    key = process.env.SUPABASE_PUBLISHABLE_KEY;
  }
  return {
    url: typeof url === "string" ? url : undefined,
    key: typeof key === "string" ? key : undefined,
  };
}

function latestPublished(assessments: Assessment[]): Map<string, Assessment> {
  const bySchool = new Map<string, Assessment>();
  for (const a of assessments) {
    if (a.status !== "published") continue;
    const existing = bySchool.get(a.schoolId);
    if (!existing || a.assessmentDate > existing.assessmentDate) bySchool.set(a.schoolId, a);
  }
  return bySchool;
}

async function loadLiveRecords(): Promise<SchoolWithAssessment[]> {
  const { supabase } = await import("@/integrations/supabase/client");

  const [schoolsRes, assessmentsRes, scoresRes] = await Promise.all([
    supabase.from("public_schools").select("id,name,slug,lga,ward,type,level").order("name"),
    supabase
      .from("public_assessments")
      .select("id,school_id,assessment_date,total_score,tier,published_at,rubric_version")
      .order("assessment_date"),
    supabase
      .from("public_indicator_scores")
      .select("assessment_id,pillar,indicator_key,score,evidence_type"),
  ]);

  if (schoolsRes.error) throw schoolsRes.error;
  if (assessmentsRes.error) throw assessmentsRes.error;
  if (scoresRes.error) throw scoresRes.error;

  const schoolsById = new Map<string, School>();
  for (const row of schoolsRes.data ?? []) {
    if (!row || typeof row.id !== "string") continue;
    schoolsById.set(row.id, {
      id: row.id,
      name: row.name ?? "",
      slug: row.slug ?? "",
      lga: row.lga ?? "",
      ward: typeof row.ward === "string" ? row.ward : undefined,
      type: (row.type ?? "public") as SchoolType,
      level: (row.level ?? "primary") as School["level"],
      consentStatus: "granted",
      createdAt: "",
    });
  }

  const scoresByAssessment = new Map<string, IndicatorScore[]>();
  for (const row of scoresRes.data ?? []) {
    if (!row || typeof row.assessment_id !== "string") continue;
    const scores = scoresByAssessment.get(row.assessment_id) ?? [];
    scores.push({
      pillar: (row.pillar ?? "power") as PillarKey,
      indicatorKey: row.indicator_key ?? "",
      score: typeof row.score === "number" ? row.score : null,
      evidenceType: (row.evidence_type ?? "observed") as EvidenceType,
    });
    scoresByAssessment.set(row.assessment_id, scores);
  }

  const assessmentsBySchool = new Map<string, Assessment[]>();
  for (const row of assessmentsRes.data ?? []) {
    if (!row || typeof row.school_id !== "string") continue;
    const assessments = assessmentsBySchool.get(row.school_id) ?? [];
    assessments.push({
      id: row.id,
      schoolId: row.school_id,
      rubricVersion: row.rubric_version ?? "1.0",
      assessmentDate: row.assessment_date ?? "",
      status: "published",
      totalScore: typeof row.total_score === "number" ? row.total_score : null,
      tier: (row.tier ?? null) as TierKey | null,
      publishedAt: typeof row.published_at === "string" ? row.published_at : null,
      scores: scoresByAssessment.get(row.id) ?? [],
    });
    assessmentsBySchool.set(row.school_id, assessments);
  }

  const records: SchoolWithAssessment[] = [];
  for (const [schoolId, assessments] of assessmentsBySchool) {
    const school = schoolsById.get(schoolId);
    if (!school) continue;
    const history = [...assessments]
      .filter((a) => a.status === "published")
      .sort((a, b) => (a.assessmentDate < b.assessmentDate ? -1 : 1));
    if (history.length === 0) continue;
    const latest = history[history.length - 1];
    school.createdAt = latest.publishedAt ?? "";
    records.push({ school, assessment: latest, history });
  }

  return records.sort((a, b) => a.school.name.localeCompare(b.school.name));
}

/**
 * Records for public display, loaded from Supabase when configured. Falls back
 * to clearly-labelled sample data otherwise so the dashboard never crashes.
 */
export async function loadPublishedRecords(): Promise<{
  records: SchoolWithAssessment[];
  usingSample: boolean;
}> {
  if (liveCache) return liveCache;

  const { url, key } = supabaseConfig();
  if (!url || !key) {
    liveCache = { records: getPublishedRecords(), usingSample: true };
    return liveCache;
  }

  try {
    liveCache = { records: await loadLiveRecords(), usingSample: false };
  } catch (error) {
    console.error("[readiness] live data unavailable; showing sample data", error);
    liveCache = { records: getPublishedRecords(), usingSample: true };
  }
  return liveCache ?? { records: getPublishedRecords(), usingSample: true };
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
