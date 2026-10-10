import { MAX_ATTEMPTS, RETRY_BASE_MS, RETRY_FACTOR, RETRY_MAX_MS } from "./config";

export type BackoffOptions = {
  baseMs?: number;
  factor?: number;
  maxMs?: number;
};

/** Exponential backoff for the Nth failed attempt (1-based). */
export function backoffMs(attempt: number, options: BackoffOptions = {}): number {
  const base = options.baseMs ?? RETRY_BASE_MS;
  const factor = options.factor ?? RETRY_FACTOR;
  const max = options.maxMs ?? RETRY_MAX_MS;
  const n = Math.max(1, Math.floor(attempt));
  return Math.min(base * Math.pow(factor, n - 1), max);
}

/** Whether another attempt is allowed after `attempts` failures. */
export function shouldRetry(attempts: number, maxAttempts: number = MAX_ATTEMPTS): boolean {
  return attempts < maxAttempts;
}

export function nextAttemptAt(
  lastAttemptAt: Date,
  attempts: number,
  options: BackoffOptions = {},
): Date {
  return new Date(lastAttemptAt.getTime() + backoffMs(attempts, options));
}
