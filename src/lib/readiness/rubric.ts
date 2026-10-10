export const RUBRIC_VERSION = "1.0";
export const RUBRIC_EFFECTIVE_DATE = "2026-10-01";

export type EvidenceType = "observed" | "measured" | "document" | "self_reported";

export const EVIDENCE_TYPES: {
  key: EvidenceType;
  label: string;
  description: string;
  maxScore: number;
}[] = [
  {
    key: "observed",
    label: "Observed",
    description: "Seen first-hand by a Nextwave assessor during the school visit.",
    maxScore: 4,
  },
  {
    key: "measured",
    label: "Measured",
    description: "A reading taken on the day, for example a speed test or test result.",
    maxScore: 4,
  },
  {
    key: "document",
    label: "Document",
    description: "Supported by a written record, for example a plan or a policy.",
    maxScore: 4,
  },
  {
    key: "self_reported",
    label: "Self-reported",
    description:
      "Provided by the school without independent verification. Capped at 2 of 4 points.",
    maxScore: 2,
  },
];

export type PillarKey =
  | "power"
  | "devices"
  | "connectivity"
  | "curriculum"
  | "students"
  | "leadership";

export type IndicatorDef = {
  key: string;
  label: string;
  weight: number;
  hint: string;
};

export type PillarDef = {
  key: PillarKey;
  label: string;
  weight: number;
  summary: string;
  indicators: IndicatorDef[];
};

export const PILLARS: PillarDef[] = [
  {
    key: "power",
    label: "Power & Infrastructure",
    weight: 15,
    summary: "Whether the school can keep technology running reliably and safely.",
    indicators: [
      {
        key: "grid_reliability",
        label: "Grid reliability",
        weight: 6,
        hint: "How dependable the daily electricity supply is.",
      },
      {
        key: "backup_power",
        label: "Backup power (solar or generator)",
        weight: 5,
        hint: "Whether there is power when the grid fails.",
      },
      {
        key: "secure_equipment_room",
        label: "Secure equipment room",
        weight: 4,
        hint: "A lockable, dry space to store devices safely.",
      },
    ],
  },
  {
    key: "devices",
    label: "Devices & Labs",
    weight: 20,
    summary: "Whether there are enough working devices, and students can actually use them.",
    indicators: [
      {
        key: "devices_per_student",
        label: "Devices per student",
        weight: 8,
        hint: "The ratio of working computers to students.",
      },
      {
        key: "devices_functional",
        label: "% of devices functional",
        weight: 6,
        hint: "The share of computers that work today.",
      },
      {
        key: "lab_access_scheduling",
        label: "Lab access & scheduling",
        weight: 6,
        hint: "Whether every student gets regular hands-on time.",
      },
    ],
  },
  {
    key: "connectivity",
    label: "Connectivity",
    weight: 15,
    summary: "Whether the school is online, how fast, and who can use it.",
    indicators: [
      {
        key: "internet_availability",
        label: "On-site internet availability",
        weight: 6,
        hint: "Whether the school has working internet.",
      },
      {
        key: "download_speed",
        label: "Measured download speed",
        weight: 5,
        hint: "A speed test taken on the day of assessment.",
      },
      {
        key: "staff_student_access",
        label: "Staff & student access",
        weight: 4,
        hint: "The share of staff and students who can get online.",
      },
    ],
  },
  {
    key: "curriculum",
    label: "Curriculum & Teachers",
    weight: 20,
    summary: "Whether digital skills are taught, and whether teachers are ready to teach them.",
    indicators: [
      {
        key: "ict_on_timetable",
        label: "ICT / coding on the timetable",
        weight: 7,
        hint: "Scheduled, timetabled computing lessons.",
      },
      {
        key: "teacher_digital_skills",
        label: "Teacher digital skills",
        weight: 7,
        hint: "Assessed confidence and capability of teaching staff.",
      },
      {
        key: "trained_ict_staff",
        label: "Dedicated trained ICT staff",
        weight: 6,
        hint: "A named, trained person responsible for ICT.",
      },
    ],
  },
  {
    key: "students",
    label: "Student Capability",
    weight: 20,
    summary: "What students can actually do. Sampled and aggregated — never individual results.",
    indicators: [
      {
        key: "digital_literacy_test",
        label: "Baseline digital-literacy test",
        weight: 10,
        hint: "Aggregate result from a sampled literacy test.",
      },
      {
        key: "aptitude_test",
        label: "Aptitude test",
        weight: 10,
        hint: "Aggregate result from a sampled problem-solving test.",
      },
    ],
  },
  {
    key: "leadership",
    label: "Leadership & Sustainability",
    weight: 10,
    summary: "Whether the school can keep this going without Nextwave in the room.",
    indicators: [
      {
        key: "ict_plan",
        label: "Written ICT plan",
        weight: 3,
        hint: "A documented, dated plan for technology.",
      },
      {
        key: "budget_maintenance",
        label: "Budget & maintenance plan",
        weight: 4,
        hint: "Money set aside and a plan to maintain equipment.",
      },
      {
        key: "safeguarding_policy",
        label: "Child-safeguarding & data-protection policy",
        weight: 3,
        hint: "A written policy protecting students and their data.",
      },
    ],
  },
];

export const INDICATORS_BY_KEY: Record<string, IndicatorDef & { pillar: PillarKey }> =
  Object.fromEntries(
    PILLARS.flatMap((p) => p.indicators.map((i) => [i.key, { ...i, pillar: p.key }])),
  );

export const TOTAL_WEIGHT = PILLARS.reduce(
  (sum, p) => sum + p.indicators.reduce((s, i) => s + i.weight, 0),
  0,
);

export const LEVEL_DESCRIPTORS: { score: number; label: string; description: string }[] = [
  { score: 0, label: "Absent", description: "Not present at all." },
  { score: 1, label: "Nascent", description: "Minimal, informal or barely functional." },
  { score: 2, label: "Partial", description: "Present but inconsistent or incomplete." },
  { score: 3, label: "Established", description: "Working well for most, with minor gaps." },
  { score: 4, label: "Strong", description: "Fully in place, consistent and sustained." },
];

export type TierKey = "foundational" | "emerging" | "developing" | "advanced" | "leading";

export type Tier = {
  key: TierKey;
  label: string;
  min: number;
  max: number;
  color: string;
  onColor: string;
  blurb: string;
};

export const TIERS: Tier[] = [
  {
    key: "foundational",
    label: "Foundational",
    min: 0,
    max: 24,
    color: "#94a3b8",
    onColor: "#0b1020",
    blurb: "Starting from the ground up.",
  },
  {
    key: "emerging",
    label: "Emerging",
    min: 25,
    max: 49,
    color: "#7dd3fc",
    onColor: "#0b1020",
    blurb: "Early foundations are forming.",
  },
  {
    key: "developing",
    label: "Developing",
    min: 50,
    max: 69,
    color: "#a78bfa",
    onColor: "#0b1020",
    blurb: "Solid base, clear room to grow.",
  },
  {
    key: "advanced",
    label: "Advanced",
    min: 70,
    max: 84,
    color: "#c084fc",
    onColor: "#0b1020",
    blurb: "Strong capability, minor gaps.",
  },
  {
    key: "leading",
    label: "Leading",
    min: 85,
    max: 100,
    color: "#f0abfc",
    onColor: "#0b1020",
    blurb: "A model for others to learn from.",
  },
];

export const TIERS_BY_KEY: Record<TierKey, Tier> = Object.fromEntries(
  TIERS.map((t) => [t.key, t]),
) as Record<TierKey, Tier>;

export const RUBRIC_DEFINITION = {
  version: RUBRIC_VERSION,
  effectiveDate: RUBRIC_EFFECTIVE_DATE,
  scale: { min: 0, max: 4, descriptors: LEVEL_DESCRIPTORS },
  evidence: EVIDENCE_TYPES,
  tiers: TIERS.map((t) => ({ key: t.key, label: t.label, min: t.min, max: t.max })),
  pillars: PILLARS,
  totalWeight: TOTAL_WEIGHT,
};
