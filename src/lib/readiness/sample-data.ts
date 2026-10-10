import { PILLARS, RUBRIC_VERSION, type EvidenceType, type PillarKey } from "./rubric";
import { scoreAssessment } from "./scoring";
import { tierForTotal } from "./scoring";
import type {
  Assessment,
  AssessmentStatus,
  ConsentStatus,
  IndicatorScore,
  School,
  SchoolLevel,
  SchoolType,
} from "./types";

/**
 * SAMPLE DATA — clearly fake demo schools used to review the dashboard before
 * live assessments exist. Never present as real. Remove by setting
 * SAMPLE_DATA_ENABLED = false in store.ts (a single flag).
 */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EVIDENCE_BY_INDICATOR: Record<string, EvidenceType> = {
  grid_reliability: "observed",
  backup_power: "observed",
  secure_equipment_room: "observed",
  devices_per_student: "measured",
  devices_functional: "measured",
  lab_access_scheduling: "observed",
  internet_availability: "observed",
  download_speed: "measured",
  staff_student_access: "self_reported",
  ict_on_timetable: "document",
  teacher_digital_skills: "observed",
  trained_ict_staff: "document",
  digital_literacy_test: "measured",
  aptitude_test: "measured",
  ict_plan: "document",
  budget_maintenance: "document",
  safeguarding_policy: "document",
};

type Seeded = {
  id: string;
  name: string;
  slug: string;
  lga: string;
  ward: string;
  type: SchoolType;
  level: SchoolLevel;
  consent: ConsentStatus;
  status: AssessmentStatus;
  base: number;
};

const SCHOOL_SEEDS: Seeded[] = [
  {
    id: "s01",
    name: "Sardauna Model Primary School",
    slug: "sardauna-model-primary",
    lga: "Kaduna North",
    ward: "Sardauna",
    type: "public",
    level: "primary",
    consent: "granted",
    status: "published",
    base: 3.6,
  },
  {
    id: "s02",
    name: "Unguwan Rimi Secondary School",
    slug: "unguwan-rimi-secondary",
    lga: "Kaduna North",
    ward: "Unguwan Rimi",
    type: "public",
    level: "secondary",
    consent: "granted",
    status: "published",
    base: 3.05,
  },
  {
    id: "s03",
    name: "Heritage International Academy",
    slug: "heritage-international-academy",
    lga: "Kaduna North",
    ward: "GRA",
    type: "private",
    level: "secondary",
    consent: "granted",
    status: "published",
    base: 2.7,
  },
  {
    id: "s04",
    name: "Al-Hikmah Science College",
    slug: "al-hikmah-science-college",
    lga: "Kaduna North",
    ward: "Kabala",
    type: "mission",
    level: "secondary",
    consent: "granted",
    status: "published",
    base: 2.25,
  },
  {
    id: "s05",
    name: "GRA Model Nursery & Primary",
    slug: "gra-model-nursery-primary",
    lga: "Kaduna North",
    ward: "GRA",
    type: "private",
    level: "primary",
    consent: "granted",
    status: "published",
    base: 3.3,
  },
  {
    id: "s06",
    name: "Kabala Community Secondary School",
    slug: "kabala-community-secondary",
    lga: "Kaduna North",
    ward: "Kabala",
    type: "public",
    level: "secondary",
    consent: "granted",
    status: "published",
    base: 1.55,
  },
  {
    id: "s07",
    name: "Sabo GRA Primary School",
    slug: "sabo-gra-primary",
    lga: "Chikun",
    ward: "Sabo",
    type: "public",
    level: "primary",
    consent: "granted",
    status: "published",
    base: 2.0,
  },
  {
    id: "s08",
    name: "Christ the King College",
    slug: "christ-the-king-college",
    lga: "Chikun",
    ward: "Narayi",
    type: "mission",
    level: "secondary",
    consent: "granted",
    status: "published",
    base: 3.0,
  },
  {
    id: "s09",
    name: "Narayi Unity Secondary School",
    slug: "narayi-unity-secondary",
    lga: "Chikun",
    ward: "Narayi",
    type: "public",
    level: "secondary",
    consent: "granted",
    status: "published",
    base: 0.85,
  },
  {
    id: "s10",
    name: "Bright Future Academy",
    slug: "bright-future-academy",
    lga: "Chikun",
    ward: "Kujama",
    type: "private",
    level: "primary",
    consent: "granted",
    status: "published",
    base: 2.6,
  },
  {
    id: "s11",
    name: "Government Girls College Zaria",
    slug: "government-girls-college-zaria",
    lga: "Zaria",
    ward: "Tudun Wada",
    type: "public",
    level: "secondary",
    consent: "granted",
    status: "published",
    base: 3.4,
  },
  {
    id: "s12",
    name: "Aliyu Dansidi College",
    slug: "aliyu-dansidi-college",
    lga: "Zaria",
    ward: "Dambo",
    type: "mission",
    level: "secondary",
    consent: "declined",
    status: "published",
    base: 1.0,
  },
];

const PILLAR_BASE_OFFSET: Record<PillarKey, number> = {
  power: 0.1,
  devices: -0.15,
  connectivity: -0.25,
  curriculum: 0.15,
  students: -0.05,
  leadership: -0.2,
};

const WARD_ADDRESS: Record<string, string> = {
  Sardauna: "Sardauna Crescent, Kaduna North",
  "Unguwan Rimi": "Unguwan Rimi Road, Kaduna North",
  GRA: "GRA, Kaduna North",
  Kabala: "Kabala West, Kaduna North",
  Sabo: "Sabo GRA, Chikun",
  Narayi: "Narayi, Chikun",
  Kujama: "Kujama Road, Chikun",
  "Tudun Wada": "Tudun Wada, Zaria",
  Dambo: "Dambo, Zaria",
};

function buildScores(seed: Seeded, round: "first" | "latest"): IndicatorScore[] {
  const rand = mulberry32(
    seed.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) + (round === "first" ? 7 : 13),
  );
  const base = seed.base - (round === "first" ? 0.55 : 0);
  const scores: IndicatorScore[] = [];
  for (const pillar of PILLARS) {
    for (const ind of pillar.indicators) {
      const jitter = (rand() - 0.5) * 0.7;
      const raw = base + PILLAR_BASE_OFFSET[pillar.key] + jitter;
      const evidence = EVIDENCE_BY_INDICATOR[ind.key] ?? "observed";
      let score = Math.max(0, Math.min(4, Math.round(raw)));
      if (evidence === "self_reported") score = Math.min(score, 2);
      // Deterministic, small assessor disagreement within tolerance.
      const delta = rand() < 0.25 ? (rand() < 0.5 ? 1 : -1) : 0;
      const a = Math.max(0, Math.min(4, score + delta));
      const b = Math.max(0, Math.min(4, score));
      scores.push({
        pillar: pillar.key,
        indicatorKey: ind.key,
        score,
        evidenceType: evidence,
        assessorAScore: a,
        assessorBScore: b,
        notes: delta !== 0 ? "Minor difference reconciled on site." : undefined,
      });
    }
  }
  return scores;
}

function yearFor(round: "first" | "latest"): { date: string; year: number } {
  return round === "first"
    ? { date: "2025-03-12", year: 2025 }
    : { date: "2026-03-18", year: 2026 };
}

const TREND_SCHOOL_IDS = new Set(["s01", "s02", "s03", "s07", "s11"]);

function buildAssessments(): Assessment[] {
  const assessments: Assessment[] = [];
  for (const seed of SCHOOL_SEEDS) {
    const rounds: ("first" | "latest")[] = TREND_SCHOOL_IDS.has(seed.id)
      ? ["first", "latest"]
      : ["latest"];
    rounds.forEach((round, idx) => {
      const { date } = yearFor(round);
      const scores = buildScores(seed, round);
      const result = scoreAssessment(scores);
      const isLatest = round === "latest";
      const status: AssessmentStatus = isLatest ? seed.status : "published";
      assessments.push({
        id: `${seed.id}-${round}`,
        schoolId: seed.id,
        rubricVersion: RUBRIC_VERSION,
        assessmentDate: date,
        status,
        totalScore: status === "published" ? result.total : null,
        tier: status === "published" ? tierForTotal(result.total) : null,
        publishedAt: status === "published" ? `${date}T12:00:00Z` : null,
        scores,
        cohort: {
          sampleSize: 40 + Math.round(seed.base * 8),
          avgLiteracyScore: Math.round(seed.base * 22),
          avgAptitudeScore: Math.round(seed.base * 20),
        },
      });
      void idx;
    });
  }
  // Extra non-published records to prove they never surface publicly.
  const draft = SCHOOL_SEEDS[2];
  assessments.push({
    id: "s03-draft",
    schoolId: draft.id,
    rubricVersion: RUBRIC_VERSION,
    assessmentDate: "2026-09-01",
    status: "draft",
    totalScore: null,
    tier: null,
    scores: buildScores({ ...draft, base: 3.9 }, "latest"),
  });
  const withheld = SCHOOL_SEEDS[8];
  assessments.push({
    id: "s09-withheld",
    schoolId: withheld.id,
    rubricVersion: RUBRIC_VERSION,
    assessmentDate: "2026-08-20",
    status: "withheld",
    totalScore: null,
    tier: null,
    scores: buildScores(withheld, "latest"),
  });
  return assessments;
}

export const SAMPLE_SCHOOLS: School[] = SCHOOL_SEEDS.map((seed) => ({
  id: seed.id,
  name: seed.name,
  slug: seed.slug,
  lga: seed.lga,
  ward: seed.ward,
  type: seed.type,
  level: seed.level,
  address: WARD_ADDRESS[seed.ward],
  contactName: seed.consent === "granted" ? "School Principal" : undefined,
  contactEmail: seed.consent === "granted" ? "principal@example.edu.ng" : undefined,
  contactPhone: seed.consent === "granted" ? "+2348000000000" : undefined,
  consentStatus: seed.consent,
  createdAt: "2025-02-01T00:00:00Z",
}));

export const SAMPLE_ASSESSMENTS: Assessment[] = buildAssessments();
