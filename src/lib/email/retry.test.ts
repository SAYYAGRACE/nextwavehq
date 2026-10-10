import { describe, expect, it } from "vitest";
import { backoffMs, nextAttemptAt, shouldRetry } from "./retry";

describe("backoffMs", () => {
  it("is the base for the first retry", () => {
    expect(backoffMs(1, { baseMs: 1000 })).toBe(1000);
  });

  it("grows exponentially", () => {
    expect(backoffMs(2, { baseMs: 1000, factor: 2 })).toBe(2000);
    expect(backoffMs(3, { baseMs: 1000, factor: 2 })).toBe(4000);
    expect(backoffMs(4, { baseMs: 1000, factor: 2 })).toBe(8000);
  });

  it("caps at maxMs", () => {
    expect(backoffMs(50, { baseMs: 1000, factor: 2, maxMs: 5000 })).toBe(5000);
  });

  it("treats non-positive attempts as the first attempt", () => {
    expect(backoffMs(0, { baseMs: 1000 })).toBe(1000);
  });
});

describe("shouldRetry", () => {
  it("allows retries below the max", () => {
    expect(shouldRetry(0, 5)).toBe(true);
    expect(shouldRetry(1, 5)).toBe(true);
    expect(shouldRetry(4, 5)).toBe(true);
  });

  it("stops at the max attempts", () => {
    expect(shouldRetry(5, 5)).toBe(false);
    expect(shouldRetry(6, 5)).toBe(false);
  });

  it("defaults to 5 attempts", () => {
    expect(shouldRetry(4)).toBe(true);
    expect(shouldRetry(5)).toBe(false);
  });
});

describe("nextAttemptAt", () => {
  it("schedules the next attempt after the backoff delay", () => {
    const last = new Date("2026-10-10T12:00:00.000Z");
    const next = nextAttemptAt(last, 3, { baseMs: 1000, factor: 2 });
    expect(next.toISOString()).toBe("2026-10-10T12:00:04.000Z");
  });
});
