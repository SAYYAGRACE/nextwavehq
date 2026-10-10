import { describe, expect, it } from "vitest";
import {
  createReviewToken,
  hashToken,
  isRedeemable,
  verifyReviewToken,
  type ReviewTokenPayload,
} from "./review-token";

const SECRET = "test-secret-value";
const payload: ReviewTokenPayload = {
  assessmentId: "asmt-1",
  schoolId: "school-1",
  expiresAt: Date.now() + 60_000,
  nonce: "abc123",
};

describe("review tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await createReviewToken(payload, SECRET);
    const result = await verifyReviewToken(token, SECRET);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.assessmentId).toBe("asmt-1");
      expect(result.payload.schoolId).toBe("school-1");
    }
  });

  it("rejects a malformed token", async () => {
    const result = await verifyReviewToken("not-a-token", SECRET);
    expect(result).toEqual({ ok: false, reason: "malformed" });
  });

  it("rejects a tampered payload", async () => {
    const token = await createReviewToken(payload, SECRET);
    const [body, signature] = token.split(".");
    const forged = `${body}x.${signature}`;
    const result = await verifyReviewToken(forged, SECRET);
    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects a tampered signature", async () => {
    const token = await createReviewToken(payload, SECRET);
    const [body] = token.split(".");
    const result = await verifyReviewToken(`${body}.deadbeef`, SECRET);
    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createReviewToken(payload, SECRET);
    const result = await verifyReviewToken(token, "another-secret");
    expect(result).toEqual({ ok: false, reason: "invalid" });
  });

  it("rejects an expired token", async () => {
    const expired = await createReviewToken({ ...payload, expiresAt: Date.now() - 1 }, SECRET);
    const result = await verifyReviewToken(expired, SECRET);
    expect(result).toEqual({ ok: false, reason: "expired" });
  });

  it("honours the injected clock", async () => {
    const token = await createReviewToken({ ...payload, expiresAt: 1000 }, SECRET);
    const before = await verifyReviewToken(token, SECRET, 500);
    const after = await verifyReviewToken(token, SECRET, 2000);
    expect(before.ok).toBe(true);
    expect(after).toEqual({ ok: false, reason: "expired" });
  });

  it("hashes tokens deterministically and one-way", async () => {
    const token = await createReviewToken(payload, SECRET);
    const a = await hashToken(token);
    const b = await hashToken(token);
    expect(a).toBe(b);
    expect(a).not.toContain(token);
  });
});

describe("isRedeemable", () => {
  const now = Date.now();
  it("is true when unused and unexpired", () => {
    expect(
      isRedeemable({ used_at: null, expires_at: new Date(now + 1000).toISOString() }, now),
    ).toBe(true);
  });
  it("is false when already used", () => {
    expect(
      isRedeemable(
        {
          used_at: new Date(now - 1000).toISOString(),
          expires_at: new Date(now + 1000).toISOString(),
        },
        now,
      ),
    ).toBe(false);
  });
  it("is false when expired", () => {
    expect(isRedeemable({ used_at: null, expires_at: new Date(now - 1).toISOString() }, now)).toBe(
      false,
    );
  });
});
