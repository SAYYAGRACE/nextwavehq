/**
 * Client helpers for the Coding Camp registration + sponsorship flows.
 *
 * The Paystack PUBLIC key is read from import.meta.env (VITE_PAYSTACK_PUBLIC_KEY)
 * and only ever used for client-side inline checkout. The SECRET key never
 * leaves the server.
 */

import { CAMP } from "./camp";

export type PaymentMethod = "card" | "transfer";
export type CampStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export type RegisterInput = {
  paymentMethod: PaymentMethod;
  parentName: string;
  parentWhatsapp: string;
  parentEmail: string;
  childFirstName: string;
  childAge: number;
  cityState: string;
  device: string;
  consent: boolean;
  website?: string;
  elapsedMs: number;
};

export type SponsorInput = {
  paymentMethod: PaymentMethod;
  seats: number;
  donorName: string;
  donorEmail: string;
  donorWhatsapp: string;
  consentShowName: boolean;
  website?: string;
  elapsedMs: number;
};

type ApiResult<T> =
  | ({ ok: true } & T)
  | { ok: false; error?: string; errors?: Record<string, string> };

export function paystackPublicKey(): string | undefined {
  const v = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;
  return v && v.trim() !== "" ? v.trim() : undefined;
}

export function hasPaystack(): boolean {
  return Boolean(paystackPublicKey());
}

async function post<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => null)) as ApiResult<T> | null;
    return data ?? ({ ok: false, error: "bad-response" } as ApiResult<T>);
  } catch {
    return { ok: false, error: "network" };
  }
}

export function register(input: RegisterInput) {
  return post<{
    reference: string;
    amountKobo: number;
    paymentMethod: PaymentMethod;
    bank?: unknown;
    instructions?: string;
  }>("/api/camp/register", input);
}

export function sponsor(input: SponsorInput) {
  return post<{
    reference: string;
    amountKobo: number;
    seats: number;
    paymentMethod: PaymentMethod;
    bank?: unknown;
    instructions?: string;
  }>("/api/camp/sponsor", input);
}

export function verifyPayment(reference: string) {
  return post<{ status: CampStatus }>("/api/camp/verify", { reference });
}

export type StatusResult = {
  ok: boolean;
  status?: CampStatus;
  kind?: "registration" | "sponsorship";
  amountKobo?: number;
  seats?: number;
  firstName?: string;
};

export async function getRegistrationStatus(reference: string): Promise<StatusResult> {
  try {
    const res = await fetch(`/api/camp/status?reference=${encodeURIComponent(reference)}`);
    const data = await res.json();
    return data as StatusResult;
  } catch {
    return { ok: false };
  }
}

type PaystackResult = { status: "success" | "cancelled" | "error"; error?: string };

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

function loadPaystackScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.PaystackPop) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://js.paystack.co/v1/inline.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("paystack-load-failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("paystack-load-failed"));
    document.head.appendChild(s);
  });
}

/**
 * Opens Paystack inline checkout. Resolves when the user completes or closes
 * checkout. A "success" result here does NOT mark anything paid — the caller
 * must call verifyPayment(reference), which is authoritative.
 */
export async function openPaystackInline({
  email,
  amountKobo,
  reference,
}: {
  email: string;
  amountKobo: number;
  reference: string;
}): Promise<PaystackResult> {
  const key = paystackPublicKey();
  if (!key) return { status: "error", error: "no-paystack-key" };
  try {
    await loadPaystackScript();
  } catch (e) {
    return { status: "error", error: (e as Error).message };
  }
  if (!window.PaystackPop) return { status: "error", error: "paystack-missing" };
  return new Promise<PaystackResult>((resolve) => {
    const handler = window.PaystackPop!.setup({
      key,
      email,
      amount: amountKobo,
      currency: CAMP.currency,
      ref: reference,
      metadata: { reference },
      callback: () => resolve({ status: "success" }),
      onClose: () => resolve({ status: "cancelled" }),
    });
    handler.openIframe();
  });
}
