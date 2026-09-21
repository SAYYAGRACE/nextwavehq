import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { postSubmission } from "@/lib/submit";

type State = "idle" | "loading" | "ok" | "dup" | "err";

export function NewsletterSignup({
  title = "Get Nextwave updates.",
  description = "Program updates, bootcamp results, NerdHaven launches and partnership news — straight to your inbox. No noise.",
  source = "newsletter",
  className = "",
}: {
  title?: string;
  description?: string;
  source?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) return setState("err");
    setState("loading");
    const result = await postSubmission({
      kind: "newsletter",
      email: email.trim().toLowerCase(),
      source,
    });
    if (result === "err") {
      return setState("err");
    }
    setState("ok");
    setEmail("");
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12 ${className}`}>
      <div className="absolute -top-32 -right-16 h-72 w-72 rounded-full bg-brand-purple/20 blur-[120px]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-brand-glow">
            <Mail className="h-3 w-3" /> Stay Connected
          </span>
          <h3 className="mt-4 text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h3>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
            {description}
          </p>
        </div>
        <form onSubmit={submit} className="w-full">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state !== "idle") setState("idle");
              }}
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 rounded-full bg-surface-elevated border border-hairline px-5 py-3.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30 transition-all"
            />
            <button
              type="submit"
              disabled={state === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03] disabled:opacity-60 whitespace-nowrap"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
            </button>
          </div>
          {state === "ok" && (
            <p className="mt-3 text-sm text-brand-glow inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> You're subscribed. Welcome to the wave.
            </p>
          )}
          {state === "dup" && (
            <p className="mt-3 text-sm text-brand-glow">You're already subscribed.</p>
          )}
          {state === "err" && (
            <p className="mt-3 text-sm text-destructive">Please enter a valid email address.</p>
          )}
        </form>
      </div>
    </div>
  );
}
