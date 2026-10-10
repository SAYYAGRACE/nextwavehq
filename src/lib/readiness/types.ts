import type { EvidenceType, PillarKey, TierKey } from "./rubric";

export type SchoolType = "public" | "private" | "mission";
export type SchoolLevel = "primary" | "secondary";
export type ConsentStatus = "pending" | "granted" | "declined";
export type AssessmentStatus = "draft" | "submitted" | "school_review" | "published" | "withheld";

export type IndicatorScore = {
  pillar: PillarKey;
  indicatorKey: string;
  score: number | null;
  evidenceType: EvidenceType;
  notes?: string;
  assessorAScore?: number | null;
  assessorBScore?: number | null;
};

export type Assessment = {
  id: string;
  schoolId: string;
  rubricVersion: string;
  assessmentDate: string;
  status: AssessmentStatus;
  totalScore: number | null;
  tier: TierKey | null;
  publishedAt?: string | null;
  scores: IndicatorScore[];
  cohort?: {
    sampleSize: number;
    avgLiteracyScore: number;
    avgAptitudeScore: number;
  };
};

export type School = {
  id: string;
  name: string;
  slug: string;
  lga: string;
  ward?: string;
  type: SchoolType;
  level: SchoolLevel;
  address?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  consentStatus: ConsentStatus;
  createdAt: string;
};

export type SchoolWithAssessment = {
  school: School;
  assessment: Assessment;
  history: Assessment[];
};

export type ReadinessStats = {
  schoolsAssessed: number;
  lgasCovered: number;
  averageScore: number;
  powerReliablePct: number;
  internetPct: number;
};

export type TierDatum = {
  tier: TierKey;
  label: string;
  count: number;
  color: string;
};

export type PillarAverage = {
  pillar: PillarKey;
  label: string;
  averagePoints: number;
  averageAvailable: number;
  percent: number;
};

export type LgaAverage = {
  lga: string;
  schools: number;
  averageScore: number;
  meetsThreshold: boolean;
};

export type SchoolFilters = {
  lga?: string;
  type?: SchoolType;
  level?: SchoolLevel;
  tier?: TierKey;
  year?: number;
  search?: string;
  sort?: "name" | "lga" | "recent";
};

export type Trend = {
  schoolId: string;
  slug: string;
  name: string;
  lga: string;
  firstScore: number;
  latestScore: number;
  change: number;
  firstYear: number;
  latestYear: number;
};
