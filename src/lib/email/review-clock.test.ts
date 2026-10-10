import { describe, expect, it } from "vitest";
import { computeReviewWindow, daysRemaining, isReviewOpen } from "./review-clock";

const DAY = 86_400_000;
const start = new Date("2026-10-01T09:00:00.000Z");

describe("computeReviewWindow", () => {
  it("does not start until delivery is confirmed", () => {
    const window = computeReviewWindow({});
    expect(window.started).toBe(false);
    expect(window.startsAt).toBeNull();
    expect(window.deadline).toBeNull();
    expect(window.source).toBeNull();
  });

  it("starts when the email is delivered", () => {
    const window = computeReviewWindow({ deliveredAt: start });
    expect(window.started).toBe(true);
    expect(window.startsAt?.toISOString()).toBe(start.toISOString());
    expect(window.source).toBe("delivered");
    expect(window.deadline?.getTime()).toBe(start.getTime() + 14 * DAY);
  });

  it("starts when an admin marks contacted by another channel", () => {
    const window = computeReviewWindow({ contactedByOtherChannelAt: start });
    expect(window.started).toBe(true);
    expect(window.source).toBe("other_channel");
    expect(window.deadline?.getTime()).toBe(start.getTime() + 14 * DAY);
  });

  it("uses the earliest confirmation when both exist", () => {
    const later = new Date(start.getTime() + 3 * DAY);
    const window = computeReviewWindow({ deliveredAt: later, contactedByOtherChannelAt: start });
    expect(window.source).toBe("other_channel");
    expect(window.startsAt?.toISOString()).toBe(start.toISOString());
  });

  it("ignores invalid dates", () => {
    const window = computeReviewWindow({ deliveredAt: "not-a-date" });
    expect(window.started).toBe(false);
  });

  it("honours a custom window length", () => {
    const window = computeReviewWindow({ deliveredAt: start, windowDays: 7 });
    expect(window.deadline?.getTime()).toBe(start.getTime() + 7 * DAY);
  });
});

describe("isReviewOpen / daysRemaining", () => {
  it("is closed and has no remaining days before it starts", () => {
    const window = computeReviewWindow({});
    expect(isReviewOpen(window, start)).toBe(false);
    expect(daysRemaining(window, start)).toBeNull();
  });

  it("is open before the deadline", () => {
    const window = computeReviewWindow({ deliveredAt: start });
    const day5 = new Date(start.getTime() + 5 * DAY);
    expect(isReviewOpen(window, day5)).toBe(true);
    expect(daysRemaining(window, day5)).toBe(9);
  });

  it("is closed at or after the deadline", () => {
    const window = computeReviewWindow({ deliveredAt: start });
    const deadline = new Date(start.getTime() + 14 * DAY);
    expect(isReviewOpen(window, deadline)).toBe(false);
    expect(daysRemaining(window, deadline)).toBe(0);
  });
});
