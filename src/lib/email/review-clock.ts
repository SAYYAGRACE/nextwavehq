import { REVIEW_WINDOW_DAYS } from "./config";

export type ReviewClockInput = {
  deliveredAt?: string | number | Date | null;
  contactedByOtherChannelAt?: string | number | Date | null;
  windowDays?: number;
};

export type ReviewWindow = {
  started: boolean;
  startsAt: Date | null;
  deadline: Date | null;
  source: "delivered" | "other_channel" | null;
};

const MS_PER_DAY = 86_400_000;

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * The review clock only starts once delivery is confirmed — either the email
 * reached "delivered", or an admin marked the school "contacted by another
 * channel". Until then there is no deadline and no reminders are sent.
 */
export function computeReviewWindow(input: ReviewClockInput): ReviewWindow {
  const candidates: { date: Date; source: "delivered" | "other_channel" }[] = [];
  const delivered = toDate(input.deliveredAt);
  const other = toDate(input.contactedByOtherChannelAt);
  if (delivered) candidates.push({ date: delivered, source: "delivered" });
  if (other) candidates.push({ date: other, source: "other_channel" });

  if (candidates.length === 0) {
    return { started: false, startsAt: null, deadline: null, source: null };
  }

  candidates.sort((a, b) => a.date.getTime() - b.date.getTime());
  const { date, source } = candidates[0];
  const days = input.windowDays ?? REVIEW_WINDOW_DAYS;
  return {
    started: true,
    startsAt: date,
    deadline: new Date(date.getTime() + days * MS_PER_DAY),
    source,
  };
}

export function isReviewOpen(window: ReviewWindow, now: Date = new Date()): boolean {
  return window.started && window.deadline !== null && now.getTime() < window.deadline.getTime();
}

export function daysRemaining(window: ReviewWindow, now: Date = new Date()): number | null {
  if (!window.started || window.deadline === null) return null;
  const diff = window.deadline.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / MS_PER_DAY));
}
