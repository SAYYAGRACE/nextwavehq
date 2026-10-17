import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  Smartphone,
  Building2,
  AlertCircle,
} from "lucide-react";
import { CAMP, ageGroupForAge } from "@/lib/camp";
import {
  hasPaystack,
  openPaystackInline,
  register,
  verifyPayment,
  type PaymentMethod,
} from "@/lib/camp-client";

type Errors = Partial<
  Record<
    "parentName" | "parentWhatsapp" | "parentEmail" | "childFirstName" | "childAge" | "consent",
    string
  >
>;

const AGES = Array.from({ length: 11 }, (_, i) => i + 7); // 7..17
const DEVICES = [
  { value: "phone", label: "Phone / tablet" },
  { value: "laptop", label: "Laptop / desktop" },
  { value: "both", label: "Both" },
];

export function CampRegistrationForm() {
  const navigate = useNavigate();
  const startedAt = useRef(Date.now());
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [form, setForm] = useState({
    parentName: "",
    parentWhatsapp: "",
    parentEmail: "",
    childFirstName: "",
    childAge: "",
    cityState: "",
    device: "phone",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paystackReady = hasPaystack();
  const ageNum = Number(form.childAge);
  const group = Number.isFinite(ageNum) && form.childAge !== "" ? ageGroupForAge(ageNum) : null;

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as keyof Errors]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!form.parentName.trim()) next.parentName = "Required";
    if (!form.parentWhatsapp.trim()) next.parentWhatsapp = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail.trim()))
      next.parentEmail = "Valid email required";
    if (!form.childFirstName.trim()) next.childFirstName = "Required";
    if (form.childAge === "" || ageNum < 7 || ageNum > 17) next.childAge = "Ages 7–17";
    if (!form.consent) next.consent = "Please agree before continuing";
    return next;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus(null);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      setStatus("Creating your registration…");
      const res = await register({
        paymentMethod: method,
        parentName: form.parentName.trim(),
        parentWhatsapp: form.parentWhatsapp.trim(),
        parentEmail: form.parentEmail.trim().toLowerCase(),
        childFirstName: form.childFirstName.trim(),
        childAge: ageNum,
        cityState: form.cityState.trim(),
        device: form.device,
        consent: true,
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
        navigate({
          to: "/camp/thank-you",
          search: { ref: res.reference, method: "transfer" },
        });
        return;
      }

      setStatus("Opening secure checkout…");
      const pay = await openPaystackInline({
        email: form.parentEmail.trim().toLowerCase(),
        amountKobo: res.amountKobo,
        reference: res.reference,
      });

      if (pay.status === "success") {
        setStatus("Verifying your payment…");
        await verifyPayment(res.reference);
        navigate({
          to: "/camp/thank-you",
          search: { ref: res.reference, method: "card" },
        });
        return;
      }

      if (pay.status === "cancelled") {
        setError(
          "Checkout was closed before payment completed. Your registration is saved — you can retry card payment or switch to bank transfer.",
        );
      } else {
        setError(
          "We couldn't open secure card checkout. Please switch to bank transfer to complete your registration.",
        );
      }
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
      className="relative rounded-2xl border border-hairline bg-white/[0.02] p-6 sm:p-9"
      id="register"
    >
      <div className="mb-7">
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-[1.1]">
          Register your child
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          We only ask for what we need: your contact details and your child's first name and age.{" "}
          {CAMP.classScheduleNote}
        </p>
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Parent / guardian name" error={errors.parentName}>
            <input
              type="text"
              autoComplete="name"
              value={form.parentName}
              onChange={(e) => update("parentName", e.target.value)}
              placeholder="e.g., Aisha Bello"
              className={inputCls(errors.parentName)}
            />
          </Field>
          <Field label="Parent WhatsApp number" error={errors.parentWhatsapp}>
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={form.parentWhatsapp}
              onChange={(e) => update("parentWhatsapp", e.target.value)}
              placeholder="e.g., 0803 000 0000"
              className={inputCls(errors.parentWhatsapp)}
            />
          </Field>
        </div>

        <Field label="Parent email" error={errors.parentEmail}>
          <input
            type="email"
            autoComplete="email"
            value={form.parentEmail}
            onChange={(e) => update("parentEmail", e.target.value)}
            placeholder="name@example.com"
            className={inputCls(errors.parentEmail)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Child's first name" error={errors.childFirstName}>
            <input
              type="text"
              value={form.childFirstName}
              onChange={(e) => update("childFirstName", e.target.value)}
              placeholder="First name only"
              className={inputCls(errors.childFirstName)}
            />
          </Field>
          <Field
            label={group ? `Child's age — ${group.label}` : "Child's age (7–17)"}
            error={errors.childAge}
          >
            <select
              value={form.childAge}
              onChange={(e) => update("childAge", e.target.value)}
              className={`${inputCls(errors.childAge)} appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat`}
              style={{ backgroundImage: chevron }}
            >
              <option value="">Select age</option>
              {AGES.map((a) => (
                <option key={a} value={a}>
                  {a} years old
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="City / state (optional)">
            <input
              type="text"
              value={form.cityState}
              onChange={(e) => update("cityState", e.target.value)}
              placeholder="e.g., Kaduna, Kaduna State"
              className={inputCls()}
            />
          </Field>
          <Field label="Device they'll learn on">
            <select
              value={form.device}
              onChange={(e) => update("device", e.target.value)}
              className={`${inputCls()} appearance-none bg-[length:14px] bg-[right_1rem_center] bg-no-repeat`}
              style={{ backgroundImage: chevron }}
            >
              {DEVICES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

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
              onChange={(e) => update("website", e.target.value)}
            />
          </label>
        </div>

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update("consent", e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline bg-surface-elevated accent-brand-purple"
          />
          <span>
            I'm the parent/guardian and I agree to Nextwave's{" "}
            <a href="/terms" className="text-brand-glow hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-brand-glow hover:underline">
              Privacy Policy
            </a>
            , including the{" "}
            <a href="/terms#refunds" className="text-brand-glow hover:underline">
              refund policy
            </a>
            .
            {errors.consent && (
              <span className="mt-1 block text-[11px] text-destructive">{errors.consent}</span>
            )}
          </span>
        </label>
      </fieldset>

      <div className="mt-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Secure payment · No card details touch our servers
        </div>
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
          ) : (
            <>
              {method === "transfer" || !paystackReady
                ? "Get transfer details"
                : `Pay ${CAMP.feeLabel}`}
              <Smartphone className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {CAMP.feeLabel} · {CAMP.feeNote}. {CAMP.refundPolicy.summary}
      </p>
    </form>
  );
}

const chevron =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394A3B8'><path d='M5.5 7.5L10 12l4.5-4.5z'/></svg>\")";

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
