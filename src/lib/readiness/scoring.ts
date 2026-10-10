import {
  INDICATORS_BY_KEY,
  LEVEL_DESCRIPTORS,
  PILLARS,
  TIERS,
  TOTAL_WEIGHT,
  type EvidenceType,
  type PillarKey,
  type TierKey,
} from "./rubric";
import type { Assessment, IndicatorScore } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Evidence caps: self-reported evidence can earn at most 2 of 4 points. */
export function maxScoreForEvidence(evidenceType: EvidenceType): number {
  return evidenceType === "self_reported" ? 2 : 4;
}

/** The score actually counted, after the evidence cap is applied. */
export function effectiveScore(score: number, evidenceType: EvidenceType): number {
  return clamp(score, 0, maxScoreForEvidence(evidenceType));
}

/** Indicator points = (effective score / 4) * indicator weight. */
export function indicatorPoints(
  score: number | null,
  weight: number,
  evidenceType: EvidenceType,
): number {
  if (score === null || score === undefined || Number.isNaN(score)) return 0;
  return (effectiveScore(score, evidenceType) / 4) * weight;
}

export type PillarResult = {
  pillar: PillarKey;
  label: string;
  earned: number;
  available: number;
  percent: number;
  scored: number;
  total: number;
};

export type ScoringResult = {
  total: number;
  tier: TierKey;
  pillars: PillarResult[];
  scored: number;
  totalIndicators: number;
  isComplete: boolean;
};

const ALL_INDICATOR_COUNT = PILLARS.reduce((s, p) => s + p.indicators.length, 0);

export function computePillars(scores: IndicatorScore[]): PillarResult[] {
  const byKey = new Map(scores.map((s) => [s.indicatorKey, s]));
  return PILLARS.map((pillar) => {
    let earned = 0;
    let scored = 0;
    for (const ind of pillar.indicators) {
      const s = byKey.get(ind.key);
      if (s && s.score !== null && s.score !== undefined) {
        earned += indicatorPoints(s.score, ind.weight, s.evidenceType);
        scored += 1;
      }
    }
    const available = pillar.indicators.reduce((sum, i) => sum + i.weight, 0);
    return {
      pillar: pillar.key,
      label: pillar.label,
      earned: round1(earned),
      available,
      percent: available === 0 ? 0 : round1((earned / available) * 100),
      scored,
      total: pillar.indicators.length,
    };
  });
}

/** Compute total score, tier and pillar breakdown for a set of indicator scores. */
export function scoreAssessment(scores: IndicatorScore[]): ScoringResult {
  const pillars = computePillars(scores);
  const raw = pillars.reduce((sum, p) => sum + p.earned, 0);
  const total = round1(Math.min(raw, TOTAL_WEIGHT));
  const scored = scores.filter((s) => s.score !== null && s.score !== undefined).length;
  return {
    total,
    tier: tierForTotal(total),
    pillars,
    scored,
    totalIndicators: ALL_INDICATOR_COUNT,
    isComplete: scored >= ALL_INDICATOR_COUNT,
  };
}

export function tierForTotal(total: number): TierKey {
  const t = clamp(total, 0, 100);
  for (let i = 0; i < TIERS.length; i += 1) {
    const next = TIERS[i + 1];
    if (!next) return TIERS[i].key;
    if (t < next.min) return TIERS[i].key;
  }
  return "leading";
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export type ScoreValidationIssue = {
  indicatorKey: string;
  code: "range" | "self_reported_cap" | "missing_evidence" | "missing_assessors" | "unreconciled";
  message: string;
};

export function validateIndicator(s: IndicatorScore): ScoreValidationIssue[] {
  const issues: ScoreValidationIssue[] = [];
  const { indicatorKey } = s;
  if (s.score !== null && s.score !== undefined) {
    if (s.score < 0 || s.score > 4 || !Number.isInteger(s.score)) {
      issues.push({
        indicatorKey,
        code: "range",
        message: "Score must be a whole number from 0 to 4.",
      });
    }
    if (!s.evidenceType) {
      issues.push({
        indicatorKey,
        code: "missing_evidence",
        message: "An evidence type is required.",
      });
    } else if (s.evidenceType === "self_reported" && s.score > 2) {
      issues.push({
        indicatorKey,
        code: "self_reported_cap",
        message: "Self-reported evidence is capped at 2 of 4 points.",
      });
    }
  }
  const a = s.assessorAScore;
  const b = s.assessorBScore;
  if (a === null || a === undefined || b === null || b === undefined) {
    issues.push({
      indicatorKey,
      code: "missing_assessors",
      message: "Both assessors must score this indicator.",
    });
  } else if (Math.abs(a - b) > 1 && !s.notes?.trim()) {
    issues.push({
      indicatorKey,
      code: "unreconciled",
      message: "Assessors differ by more than 1 point — add a reconciliation note.",
    });
  }
  return issues;
}

export function validateAssessment(scores: IndicatorScore[]): ScoreValidationIssue[] {
  return scores.flatMap(validateIndicator);
}

export type StrengthGap = { pillar: PillarKey; label: string; percent: number; text: string };

export function strengthsAndGaps(pillars: PillarResult[]): {
  strengths: StrengthGap[];
  gaps: StrengthGap[];
} {
  const sorted = [...pillars].sort((a, b) => b.percent - a.percent);
  const strengths = sorted
    .filter((p) => p.percent >= 55)
    .slice(0, 2)
    .map((p) => ({
      pillar: p.pillar,
      label: p.label,
      percent: p.percent,
      text: `${p.label} is a relative strength, at ${Math.round(p.percent)}% of available points.`,
    }));
  const gaps = [...sorted]
    .reverse()
    .filter((p) => p.percent < 60)
    .slice(0, 2)
    .map((p) => ({
      pillar: p.pillar,
      label: p.label,
      percent: p.percent,
      text: `${p.label} is the clearest priority, at ${Math.round(p.percent)}% of available points.`,
    }));
  if (strengths.length === 0) {
    strengths.push({
      pillar: sorted[0].pillar,
      label: sorted[0].label,
      percent: sorted[0].percent,
      text: `${sorted[0].label} is the closest to established, at ${Math.round(sorted[0].percent)}%.`,
    });
  }
  return { strengths, gaps };
}

export function assessmentWithScore(base: Omit<Assessment, "totalScore" | "tier">): Assessment {
  const result = scoreAssessment(base.scores);
  return { ...base, totalScore: result.total, tier: result.tier };
}

export function levelDescriptor(score: number) {
  return LEVEL_DESCRIPTORS.find((d) => d.score === clamp(Math.round(score), 0, 4));
}

export function indicatorLabel(key: string): string {
  return INDICATORS_BY_KEY[key]?.label ?? key;
}
