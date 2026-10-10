import { describe, expect, it } from "vitest";
import { verifySvixSignature } from "./svix";

async function sign(secret: string, content: string): Promise<string> {
  const enc = new TextEncoder();
  const raw = secret.startsWith("whsec_") ? atob(secret.slice(6)) : secret;
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(raw),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(content)));
  let binary = "";
  for (const b of sig) binary += String.fromCharCode(b);
  return btoa(binary);
}

const SECRET = "whsec_" + btoa("super-secret-key");
const ID = "msg_2abc";
const TS = "1700000000";
const BODY = JSON.stringify({ type: "email.delivered", data: { email_id: "e_1" } });

async function valid() {
  const content = `${ID}.${TS}.${BODY}`;
  return `v1,${await sign(SECRET, content)}`;
}

describe("verifySvixSignature", () => {
  it("accepts a correctly signed payload", async () => {
    const ok = await verifySvixSignature({
      secret: SECRET,
      svixId: ID,
      svixTimestamp: TS,
      svixSignature: await valid(),
      body: BODY,
      nowSeconds: 1_700_000_000,
    });
    expect(ok).toBe(true);
  });

  it("accepts a signature placed after another space-separated entry", async () => {
    const ok = await verifySvixSignature({
      secret: SECRET,
      svixId: ID,
      svixTimestamp: TS,
      svixSignature: `v1,deadbeef ${await valid()}`,
      body: BODY,
      nowSeconds: 1_700_000_000,
    });
    expect(ok).toBe(true);
  });

  it("rejects a tampered body", async () => {
    const ok = await verifySvixSignature({
      secret: SECRET,
      svixId: ID,
      svixTimestamp: TS,
      svixSignature: await valid(),
      body: JSON.stringify({ type: "email.bounced" }),
      nowSeconds: 1_700_000_000,
    });
    expect(ok).toBe(false);
  });

  it("rejects a wrong secret", async () => {
    const ok = await verifySvixSignature({
      secret: "whsec_" + btoa("other-key"),
      svixId: ID,
      svixTimestamp: TS,
      svixSignature: await valid(),
      body: BODY,
      nowSeconds: 1_700_000_000,
    });
    expect(ok).toBe(false);
  });

  it("rejects a stale timestamp outside tolerance", async () => {
    const ok = await verifySvixSignature({
      secret: SECRET,
      svixId: ID,
      svixTimestamp: TS,
      svixSignature: await valid(),
      body: BODY,
      nowSeconds: 1_700_001_000,
    });
    expect(ok).toBe(false);
  });

  it("rejects missing headers", async () => {
    const ok = await verifySvixSignature({
      secret: SECRET,
      svixId: "",
      svixTimestamp: TS,
      svixSignature: await valid(),
      body: BODY,
      nowSeconds: 1_700_000_000,
    });
    expect(ok).toBe(false);
  });
});
