import { TOKEN_SECRET } from "./config";

export type ReviewTokenPayload = {
  assessmentId: string;
  schoolId: string;
  expiresAt: number;
  nonce: string;
};

export type VerifyResult =
  | { ok: true; payload: ReviewTokenPayload }
  | { ok: false; reason: "malformed" | "invalid" | "expired" };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded =
    value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

async function hmac(data: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(data)));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createReviewToken(
  payload: ReviewTokenPayload,
  secret: string = TOKEN_SECRET,
): Promise<string> {
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(body, secret));
  return `${body}.${signature}`;
}

export async function verifyReviewToken(
  token: string,
  secret: string = TOKEN_SECRET,
  now: number = Date.now(),
): Promise<VerifyResult> {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return { ok: false, reason: "malformed" };

  const [body, signature] = parts;
  let expected: string;
  try {
    expected = bytesToBase64Url(await hmac(body, secret));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (!timingSafeEqual(expected, signature)) return { ok: false, reason: "invalid" };

  let payload: ReviewTokenPayload;
  try {
    payload = JSON.parse(decoder.decode(base64UrlToBytes(body))) as ReviewTokenPayload;
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (
    typeof payload.assessmentId !== "string" ||
    typeof payload.schoolId !== "string" ||
    typeof payload.expiresAt !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }
  if (payload.expiresAt <= now) return { ok: false, reason: "expired" };

  return { ok: true, payload };
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  return bytesToBase64Url(new Uint8Array(digest));
}

export function isRedeemable(
  record: { used_at: string | null; expires_at: string },
  now: number = Date.now(),
): boolean {
  if (record.used_at) return false;
  return new Date(record.expires_at).getTime() > now;
}
