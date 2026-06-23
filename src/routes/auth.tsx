import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isStaffCredentials, setStaffSession } from "@/integrations/supabase/staffAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Nextwave" },
      { name: "description", content: "Administrative access to the Nextwave operations console." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  function getFriendlyError(error: any) {
    const message = error?.message ?? String(error ?? "Authentication failed");
    const normalized = message.toLowerCase();

    if (normalized.includes("invalid login credentials") || normalized.includes("invalid email or password") || normalized.includes("invalid password")) {
      return "Invalid email or password. Please double-check your credentials and try again.";
    }

    if (normalized.includes("user not confirmed") || normalized.includes("email not confirmed") || normalized.includes("confirmation")) {
      return "Your email address must be confirmed first. Check your inbox or spam folder for the verification email.";
    }

    if (normalized.includes("user not found") || normalized.includes("email not found") || normalized.includes("no user found")) {
      return "No account exists for that email. Please sign up first or use a different email.";
    }

    if (normalized.includes("network error") || normalized.includes("fetch failed")) {
      return "Network error. Please check your connection and try again.";
    }

    return message;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        if (isStaffCredentials(email, password)) {
          setStaffSession(email);
          navigate({ to: "/admin" });
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        setSuccess(
          "Account created. Check your inbox or spam folder for a confirmation email before signing in. If you don’t receive an email, contact nextwavehq@outlook.com."
        );
        setMode("signin");
        setPassword("");
      }
    } catch (e: any) {
      setErr(getFriendlyError(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-32 pb-20 lg:pt-44">
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-md px-6">
          <div className="text-center">
            <SectionEyebrow>Operations Console</SectionEyebrow>
            <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight text-white">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Admin access only. Submissions and signups dashboard.
            </p>
          </div>

          <form onSubmit={submit} className="mt-10 glass-strong rounded-2xl p-6 sm:p-8 space-y-5">
            {err && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {err}
              </div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {success}
              </div>
            )}
            {mode === "signup" && (
              <p className="text-xs text-muted-foreground leading-5">
                Supabase handles confirmation email delivery. If you do not receive an email, check your spam folder or contact nextwavehq@outlook.com.
              </p>
            )}
            {mode === "signin" && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-white">Staff access</p>
                <p>Enter your staff email and password to sign in.</p>
              </div>
            )}
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg bg-surface-elevated border border-hairline px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
              />
            </label>
            <label className="block">
              <span className="text-xs tracking-widest uppercase text-muted-foreground">Password</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg bg-surface-elevated border border-hairline px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/30"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
            >
              {mode === "signin" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="block w-full text-center text-xs text-muted-foreground hover:text-white transition"
            >
              {mode === "signin" ? "Need an account? Create one" : "Have an account? Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground inline-flex items-center gap-2 w-full justify-center">
            <ShieldCheck className="h-3 w-3" /> New accounts must be granted admin role to view data.
          </p>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-white">← Back to site</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
