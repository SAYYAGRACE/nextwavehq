const encoder = new TextEncoder();

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function hmacBase64(secret: string, content: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(content));
  return bytesToBase64(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type SvixVerifyInput = {
  secret: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
  body: string;
  toleranceSeconds?: number;
  nowSeconds?: number;
};

function secretToKey(secret: string): string {
  return secret.startsWith("whsec_") ? atob(secret.slice("whsec_".length)) : secret;
}

/** Verify a Svix (Resend) webhook signature. https://docs.svix.com/receiving/verifying-payloads */
export async function verifySvixSignature(input: SvixVerifyInput): Promise<boolean> {
  const {
    secret,
    svixId,
    svixTimestamp,
    svixSignature,
    body,
    toleranceSeconds = 300,
    nowSeconds = Math.floor(Date.now() / 1000),
  } = input;

  if (!secret || !svixId || !svixTimestamp || !svixSignature) return false;

  const timestamp = Number(svixTimestamp);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) return false;

  const key = secretToKey(secret);
  const expected = await hmacBase64(key, `${svixId}.${svixTimestamp}.${body}`);

  return svixSignature
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .some((part) => {
      const [version, signature] = part.split(",");
      return version === "v1" && !!signature && timingSafeEqual(signature, expected);
    });
}
