import { describe, it, expect } from "vitest";
import {
  effectiveScore,
  indicatorPoints,
  scoreAssessment,
  tierForTotal,
  validateAssessment,
} from "./scoring";
import type { IndicatorScore } from "./types";

describe("tierForTotal — boundaries at each threshold", () => {
  const cases: [number, string][] = [
    [0, "foundational"],
    [24, "foundational"],
    [24.9, "foundational"],
    [25, "emerging"],
    [49, "emerging"],
    [49.9, "emerging"],
    [50, "developing"],
    [69, "developing"],
    [69.9, "developing"],
    [70, "advanced"],
    [84, "advanced"],
    [84.9, "advanced"],
    [85, "leading"],
    [100, "leading"],
  ];
  it.each(cases)("total %d -> %s", (total, tier) => {
    expect(tierForTotal(total)).toBe(tier);
  });

  it("clamps totals outside 0-100", () => {
    expect(tierForTotal(-5)).toBe("foundational");
    expect(tierForTotal(140)).toBe("leading");
  });
});

describe("indicatorPoints — (score / 4) * weight", () => {
  it("gives full weight at a score of 4", () => {
    expect(indicatorPoints(4, 8, "observed")).toBe(8);
  });
  it("gives half weight at a score of 2", () => {
    expect(indicatorPoints(2, 10, "measured")).toBe(5);
  });
  it("gives zero at a score of 0", () => {
    expect(indicatorPoints(0, 7, "document")).toBe(0);
  });
  it("treats null / missing scores as zero", () => {
    expect(indicatorPoints(null, 8, "observed")).toBe(0);
    expect(indicatorPoints(undefined as unknown as null, 8, "observed")).toBe(0);
  });
});

describe("self-reported evidence cap", () => {
  it("caps the effective score at 2 of 4", () => {
    expect(effectiveScore(4, "self_reported")).toBe(2);
    expect(effectiveScore(3, "self_reported")).toBe(2);
    expect(effectiveScore(1, "self_reported")).toBe(1);
  });

  it("lets verified evidence score up to 4", () => {
    expect(effectiveScore(4, "observed")).toBe(4);
    expect(effectiveScore(4, "measured")).toBe(4);
    expect(effectiveScore(4, "document")).toBe(4);
  });

  it("awards only half the weight for a maxed self-reported indicator", () => {
    expect(indicatorPoints(4, 8, "self_reported")).toBe(4);
  });

  it("flags a self-reported score above 2 in validation", () => {
    const issues = validateAssessment([
      {
        pillar: "power",
        indicatorKey: "grid_reliability",
        score: 4,
        evidenceType: "self_reported",
      },
    ]);
    expect(issues.some((i) => i.code === "self_reported_cap")).toBe(true);
  });
});

describe("partial assessments", () => {
  it("scores only what is present and reports completeness", () => {
    const scores: IndicatorScore[] = [
      { pillar: "power", indicatorKey: "grid_reliability", score: 4, evidenceType: "observed" },
      { pillar: "power", indicatorKey: "backup_power", score: null, evidenceType: "observed" },
    ];
    const result = scoreAssessment(scores);
    expect(result.total).toBe(6);
    expect(result.isComplete).toBe(false);
    expect(result.scored).toBe(1);
    expect(result.pillars.find((p) => p.pillar === "power")!.scored).toBe(1);
  });

  it("handles an empty assessment without crashing", () => {
    const result = scoreAssessment([]);
    expect(result.total).toBe(0);
    expect(result.tier).toBe("foundational");
    expect(result.isComplete).toBe(false);
  });
});

describe("full assessment computation", () => {
  it("sums indicator points across pillars", () => {
    const scores: IndicatorScore[] = [
      { pillar: "power", indicatorKey: "grid_reliability", score: 4, evidenceType: "observed" }, // 6
      {
        pillar: "devices",
        indicatorKey: "devices_per_student",
        score: 2,
        evidenceType: "measured",
      }, // 4
      {
        pillar: "students",
        indicatorKey: "digital_literacy_test",
        score: 4,
        evidenceType: "measured",
      }, // 10
    ];
    const result = scoreAssessment(scores);
    expect(result.total).toBe(20);
    expect(result.tier).toBe("foundational");
  });
});

describe("validation", () => {
  it("requires both assessors", () => {
    const issues = validateAssessment([
      { pillar: "power", indicatorKey: "grid_reliability", score: 2, evidenceType: "observed" },
    ]);
    expect(issues.some((i) => i.code === "missing_assessors")).toBe(true);
  });

  it("accepts matching assessor scores", () => {
    const issues = validateAssessment([
      {
        pillar: "power",
        indicatorKey: "grid_reliability",
        score: 3,
        evidenceType: "observed",
        assessorAScore: 3,
        assessorBScore: 3,
      },
    ]);
    expect(issues).toHaveLength(0);
  });

  it("flags assessors that differ by more than 1 without a note", () => {
    const issues = validateAssessment([
      {
        pillar: "power",
        indicatorKey: "grid_reliability",
        score: 2,
        evidenceType: "observed",
        assessorAScore: 0,
        assessorBScore: 3,
      },
    ]);
    expect(issues.some((i) => i.code === "unreconciled")).toBe(true);
  });

  it("accepts a large difference once reconciled with a note", () => {
    const issues = validateAssessment([
      {
        pillar: "power",
        indicatorKey: "grid_reliability",
        score: 2,
        evidenceType: "observed",
        assessorAScore: 0,
        assessorBScore: 3,
        notes: "Reconciled after review of the school's generator logs.",
      },
    ]);
    expect(issues).toHaveLength(0);
  });

  it("flags out-of-range scores", () => {
    const issues = validateAssessment([
      {
        pillar: "power",
        indicatorKey: "grid_reliability",
        score: 5,
        evidenceType: "observed",
        assessorAScore: 5,
        assessorBScore: 5,
      },
    ]);
    expect(issues.some((i) => i.code === "range")).toBe(true);
  });
});
