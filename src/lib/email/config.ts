function readEnv(key: string, fallback: string): string {
  const value = typeof process !== "undefined" && process.env ? process.env[key] : undefined;
  return value && value.trim() ? value.trim() : fallback;
}

export const SENDING_DOMAIN = "mail.nextwave.com.ng";

export const FROM_EMAIL = readEnv("NTRI_FROM_EMAIL", "ntri@nextwave.com.ng");

export const FROM = readEnv("NTRI_EMAIL_FROM", `Nextwave Readiness <${FROM_EMAIL}>`);

export const REPLY_TO = readEnv("NTRI_REPLY_TO", "info@nextwave.com.ng");

export const SITE_URL = readEnv("NTRI_SITE_URL", "https://nextwave.com.ng");

export const ADMIN_URL = readEnv("NTRI_ADMIN_URL", `${SITE_URL}/contact`);

export const REVIEW_WINDOW_DAYS = 14;

export const MAX_ATTEMPTS = 5;

export const RETRY_BASE_MS = 60_000;

export const RETRY_FACTOR = 2;

export const RETRY_MAX_MS = 6 * 60 * 60 * 1000;

export const TOKEN_SECRET = readEnv("NTRI_TOKEN_SECRET", "dev-insecure-token-secret");

const NO_REPLY = /no[-_.]?reply/i;

export function isDeliverableAddress(address: string): boolean {
  const email = address.replace(/.*<([^>]+)>.*/, "$1").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !NO_REPLY.test(email);
}

export function assertDeliverableAddress(address: string, label: string): void {
  if (!isDeliverableAddress(address)) {
    throw new Error(`${label} must be a real, monitored mailbox (no no-reply): ${address}`);
  }
}
