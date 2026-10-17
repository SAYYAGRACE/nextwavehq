import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, CreditCard, Building2, Gift, Loader2 } from "lucide-react";
import { CAMP, naira } from "@/lib/camp";
import {
  hasPaystack,
  openPaystackInline,
  sponsor,
  verifyPayment,
  type PaymentMethod,
} from "@/lib/camp-client";

type Errors = Partial<Record<"donorEmail" | "seats", string>>;

export function CampSponsorSection() {
  const navigate = useNavigate();
  const startedAt = useRef(Date.now());
  const [seats, setSeats] = useState(1);
  const [customSeats, setCustomSeats] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [form, setForm] = useState({
    donorName: "",
    donorEmail: "",
    donorWhatsapp: "",
    consentShowName: false,
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paystackReady = hasPaystack();
  const seatCount = customSeats
    ? Math.max(1, Math.min(100, Math.floor(Number(customSeats) || 1)))
    : seats;
  const amount = seatCount * CAMP.feeNaira;

  function submit(e: FormEvent) {
    e.preventDefault();
    void run();
  }

  async function run() {
    setError(null);
    setStatus(null);
    const next: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail.trim()))
      next.donorEmail = "Valid email required";
    if (!Number.isFinite(seatCount) || seatCount < 1) next.seats = "Choose at least 1 seat";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      setStatus("Creating your sponsorship…");
      const res = await sponsor({
        paymentMethod: method,
        seats: seatCount,
        donorName: form.donorName.trim(),
        donorEmail: form.donorEmail.trim().toLowerCase(),
        donorWhatsapp: form.donorWhatsapp.trim(),
        consentShowName: form.consentShowName,
        website: form.website,
        elapsedMs: Date.now() - startedAt.current,
      });

      if (!res.ok) {
        if (res.errors) setErrors(res.errors as Errors);
        if (res.error === "rate-limited")
          setError("Too many attempts. Please wait a few minutes and try again.");
        else if (!res.errors) setError("Something went wrong. Please try again.");
        setBusy(false);
        setStatus(null);
        return;
      }

      if (method === "transfer" || !paystackReady) {
        navigate({ to: "/camp/thank-you", search: { ref: res.reference, method: "transfer" } });
        return;
      }

      setStatus("Opening secure checkout…");
      const pay = await openPaystackInline({
        email: form.donorEmail.trim().toLowerCase(),
        amountKobo: res.amountKobo,
        reference: res.reference,
      });
      if (pay.status === "success") {
        setStatus("Verifying your payment…");
        await verifyPayment(res.reference);
        navigate({ to: "/camp/thank-you", search: { ref: res.reference, method: "card" } });
        return;
      }
      setError(
        pay.status === "cancelled"
          ? "Checkout was closed before payment completed. Your sponsorship is saved — retry or use bank transfer."
          : "We couldn't open secure card checkout. Please use bank transfer.",
      );
      setBusy(false);
      setStatus(null);
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
      setStatus(null);
    }
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      id="sponsor"
      className="relative rounded-2xl border border-hairline bg-white/[0.02] p-6 sm:p-9"
    >
      <div className="mb-7 flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
          <Gift className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
        </span>
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-[1.1]">
            Sponsor a seat
          </h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Fund a place for a child whose family can't afford the fee. Sponsored seats go directly
            to families who need them.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      {status && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-hairline bg-white/[0.03] px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-brand-glow" />
          <p className="text-sm text-white">{status}</p>
        </div>
      )}

      <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs tracking-widest uppercase text-muted-foreground">
              Number of seats
            </span>
            {errors.seats && <span className="text-[11px] text-destructive">{errors.seats}</span>}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {CAMP.sponsorSeatOptions.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setSeats(n);
                  setCustomSeats("");
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                  !customSeats && seats === n
                    ? "border-brand-purple bg-white/[0.05] text-white"
                    : "border-hairline bg-white/[0.02] text-muted-foreground hover:text-white"
                }`}
              >
                {n} seat{n > 1 ? "s" : ""}
              </button>
            ))}
            <input
              type="number"
              min={1}
              max={100}
              inputMode="numeric"
              value={customSeats}
              onChange={(e) => setCustomSeats(e.target.value)}
              placeholder="Custom"
              className="w-28 rounded-full border border-hairline bg-surface-elevated px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 focus:border-brand-purple"
            />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {seatCount} seat{seatCount > 1 ? "s" : ""} × {CAMP.feeLabel} ={" "}
            <span className="text-white font-medium">{naira(amount)}</span>
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name (optional)">
            <input
              type="text"
              autoComplete="name"
              value={form.donorName}
              onChange={(e) => setForm((f) => ({ ...f, donorName: e.target.value }))}
              placeholder="e.g., A. Bello"
              className={inputCls()}
            />
          </Field>
          <Field label="Email for receipt" error={errors.donorEmail}>
            <input
              type="email"
              autoComplete="email"
              value={form.donorEmail}
              onChange={(e) => setForm((f) => ({ ...f, donorEmail: e.target.value }))}
              placeholder="name@example.com"
              className={inputCls(errors.donorEmail)}
            />
          </Field>
        </div>

        <Field label="WhatsApp (optional)">
          <input
            type="tel"
            inputMode="tel"
            value={form.donorWhatsapp}
            onChange={(e) => setForm((f) => ({ ...f, donorWhatsapp: e.target.value }))}
            placeholder="e.g., 0803 000 0000"
            className={inputCls()}
          />
        </Field>

        <div>
          <div className="mb-2 text-xs tracking-widest uppercase text-muted-foreground">
            Payment method
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMethod("card")}
              disabled={!paystackReady}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                method === "card" && paystackReady
                  ? "border-brand-purple bg-white/[0.04]"
                  : "border-hairline bg-white/[0.02] hover:bg-white/[0.04]"
              } ${!paystackReady ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-brand-glow" strokeWidth={1.5} />
              <span>
                <span className="block text-sm font-medium text-white">Card</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {paystackReady ? "Secure Paystack checkout" : "Unavailable — use bank transfer"}
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("transfer")}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                method === "transfer"
                  ? "border-brand-purple bg-white/[0.04]"
                  : "border-hairline bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-glow" strokeWidth={1.5} />
              <span>
                <span className="block text-sm font-medium text-white">Bank transfer</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  Pay to {CAMP.bank.bank}, then send us the receipt
                </span>
              </span>
            </button>
          </div>
        </div>

        <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label>
            Company website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
            />
          </label>
        </div>

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={form.consentShowName}
            onChange={(e) => setForm((f) => ({ ...f, consentShowName: e.target.checked }))}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline bg-surface-elevated accent-brand-purple"
          />
          <span>You may list me as a sponsor (optional).</span>
        </label>
      </fieldset>

      <div className="mt-7 flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-[filter] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Please wait…
            </>
          ) : method === "transfer" || !paystackReady ? (
            "Get transfer details"
          ) : (
            `Sponsor ${naira(amount)}`
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs tracking-widest uppercase text-muted-foreground">{label}</span>
        {error && <span className="text-[11px] text-destructive">{error}</span>}
      </div>
      {children}
    </label>
  );
}

function inputCls(error?: string) {
  return `w-full rounded-lg bg-surface-elevated border px-4 py-3 text-sm text-white placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 transition-all ${
    error
      ? "border-destructive/60 focus:ring-destructive/30 focus:border-destructive"
      : "border-hairline focus:border-brand-purple focus:ring-brand-purple/30"
  }`;
}
