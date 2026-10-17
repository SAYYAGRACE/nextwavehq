import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  MessageCircle,
  RefreshCw,
  Clock,
  XCircle,
  Building2,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Aurora } from "@/components/Aurora";
import { CAMP, whatsappLink } from "@/lib/camp";
import { getRegistrationStatus, type StatusResult } from "@/lib/camp-client";

export const Route = createFileRoute("/camp/thank-you")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { ref?: string; method?: "card" | "transfer" } => ({
    ref: typeof search.ref === "string" ? search.ref : undefined,
    method: search.method === "card" || search.method === "transfer" ? search.method : undefined,
  }),
  head: () => ({
    meta: [
      { title: `Registration received — ${CAMP.name}` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ThankYouPage,
});

const POLL_MS = 8000;
const MAX_POLLS = 6;

function ThankYouPage() {
  const { ref, method } = Route.useSearch();
  const [status, setStatus] = useState<StatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const polls = useRef(0);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function check() {
      const res = await getRegistrationStatus(ref!);
      if (cancelled) return;
      setStatus(res);
      setLoading(false);
      const isPending = res.ok && res.status === "pending";
      if (isPending && polls.current < MAX_POLLS) {
        polls.current += 1;
        timer = setTimeout(check, POLL_MS);
      }
    }
    check();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ref]);

  const paid = status?.ok && status.status === "paid";
  const failed = status?.ok && (status.status === "failed" || status.status === "cancelled");
  const pending =
    !loading && (!status?.ok || status?.status === "pending" || status?.status === "refunded");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="relative overflow-hidden pt-28 pb-20 lg:pt-36">
        <Aurora className="opacity-40" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <div className="text-center">
              <SectionEyebrow>Registration</SectionEyebrow>
              {loading ? (
                <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  Checking your registration…
                </h1>
              ) : paid ? (
                <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  You're <span className="gradient-text">confirmed.</span>
                </h1>
              ) : failed ? (
                <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  Payment didn't go through.
                </h1>
              ) : (
                <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-white">
                  Almost there.
                </h1>
              )}
              {ref && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Reference: <span className="font-mono text-white">{ref}</span>
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-10 rounded-2xl border border-hairline bg-white/[0.02] p-7 sm:p-9">
              {loading && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-glow" />
                  Fetching your status…
                </div>
              )}

              {!loading && !ref && (
                <EmptyState
                  title="We couldn't find a reference"
                  body="This page needs the reference from your registration. If you just registered, check your email or message us on WhatsApp."
                />
              )}

              {!loading && ref && paid && <PaidState status={status} />}

              {!loading && ref && !paid && !failed && (
                <PendingState status={status} method={method} />
              )}

              {!loading && ref && failed && <FailedState />}
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={whatsappLink(
                  `Hello, I have a question about my Coding Camp registration (ref ${ref ?? "n/a"})`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-[filter] hover:brightness-110"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
              >
                <MessageCircle className="h-4 w-4" />
                Message us on WhatsApp
              </a>
              <Link
                to="/camp"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white border border-hairline bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
              >
                Back to camp
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Questions about payment? The Camp WhatsApp line is {CAMP.whatsapp.display} (
            {CAMP.whatsapp.label}).
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function PaidState({ status }: { status: StatusResult | null }) {
  const isSponsor = status?.kind === "sponsorship";
  return (
    <div className="text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-hairline bg-white/[0.03]">
        <CheckCircle2 className="h-7 w-7 text-brand-glow" />
      </span>
      <h2 className="mt-5 text-xl font-semibold text-white">
        {isSponsor ? "Thank you for sponsoring." : "Your child's place is confirmed."}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {isSponsor
          ? `You've sponsored ${status?.seats ?? 1} seat${(status?.seats ?? 1) > 1 ? "s" : ""}. A receipt has been emailed to you.`
          : "A confirmation email is on its way. We'll send your class schedule to your WhatsApp number."}
      </p>
      <div className="mt-6 rounded-xl border border-hairline bg-white/[0.02] p-5 text-left">
        <div className="text-xs tracking-widest uppercase text-muted-foreground">
          What happens next
        </div>
        <ul className="mt-3 space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow/80" />
            {CAMP.classScheduleNote}
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow/80" />
            Save the Camp WhatsApp number: {CAMP.whatsapp.display}
          </li>
          {CAMP.cohortWhatsappUrl && (
            <li className="flex items-start gap-2.5">
              <a
                href={CAMP.cohortWhatsappUrl}
                className="text-brand-glow hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Join your cohort WhatsApp group
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function PendingState({
  status,
  method,
}: {
  status: StatusResult | null;
  method?: "card" | "transfer";
}) {
  const [copied, setCopied] = useState(false);
  const isSponsor = status?.kind === "sponsorship";
  const amount =
    status?.amountKobo !== undefined
      ? `₦${(status.amountKobo / 100).toLocaleString("en-NG")}`
      : CAMP.feeLabel;

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
          <Clock className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">
            {method === "transfer" || !method
              ? "Awaiting your bank transfer"
              : "Awaiting payment confirmation"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {isSponsor
              ? "Your sponsorship is saved. Complete the transfer below and send us the receipt."
              : "Your registration is saved. Complete the transfer below, then send us the receipt on WhatsApp — we'll confirm your place."}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-hairline bg-white/[0.02] p-5">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" /> Bank transfer details
        </div>
        <dl className="mt-4 space-y-2.5 text-sm">
          <Row label="Bank" value={CAMP.bank.bank} />
          <Row label="Account name" value={CAMP.bank.accountName} />
          <Row
            label="Account number"
            value={CAMP.bank.accountNumber}
            onCopy={copy}
            copied={copied}
          />
          <Row label="Amount" value={amount} />
          {status?.reference && (
            <Row
              label="Narration / reference"
              value={status.reference}
              onCopy={copy}
              copied={copied}
            />
          )}
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">
          After paying, send a screenshot of the receipt to {CAMP.whatsapp.display} on WhatsApp.
          Your status will update to <span className="text-white">Paid</span> once we match the
          transfer.
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <RefreshCw className="h-3.5 w-3.5" />
        This page checks for confirmation automatically. You can also refresh later with the same
        link.
      </div>
    </div>
  );
}

function FailedState() {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-hairline bg-white/[0.03]">
        <XCircle className="h-7 w-7 text-destructive" />
      </span>
      <h2 className="mt-5 text-xl font-semibold text-white">We couldn't confirm this payment</h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        No charge was confirmed. You can try again, or switch to bank transfer. If money left your
        account, message us with the reference and we'll sort it out.
      </p>
      <Link
        to="/camp"
        hash="register"
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-[filter] hover:brightness-110"
        style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
      >
        Try again
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy?: (v: string) => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-2 font-medium text-white">
        {value}
        {onCopy && (
          <button
            type="button"
            onClick={() => onCopy(value)}
            className="inline-flex items-center gap-1 rounded-md border border-hairline bg-white/[0.03] px-2 py-1 text-[11px] text-muted-foreground hover:text-white transition-colors"
            aria-label={`Copy ${label}`}
          >
            <Copy className="h-3 w-3" />
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </dd>
    </div>
  );
}
