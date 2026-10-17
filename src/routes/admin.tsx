import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Download, KeyRound, Loader2, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { CAMP } from "@/lib/camp";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Camp admin — Nextwave" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

type AdminRow = {
  id: string;
  reference: string;
  status: string;
  paymentMethod: string;
  amountKobo: number;
  createdAt: string;
  paidAt: string | null;
  parentName?: string;
  parentWhatsapp?: string;
  parentEmail?: string;
  childFirstName?: string;
  childAge?: number;
  ageGroup?: string;
  cityState?: string;
  device?: string;
  donorName?: string;
  donorEmail?: string;
  donorWhatsapp?: string;
  seats?: number;
  kind: "registration" | "sponsorship";
};

type Totals = { count: number; paid: number; paidKobo: number };

const KEY_STORAGE = "nwc-admin-key";

function AdminPage() {
  const [key, setKey] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [type, setType] = useState<"registration" | "sponsorship">("registration");
  const [status, setStatus] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [method, setMethod] = useState("");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [totals, setTotals] = useState<Totals>({ count: 0, paid: 0, paidKobo: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(KEY_STORAGE);
    if (saved) {
      setKey(saved);
      setUnlocked(true);
    }
  }, []);

  const load = useCallback(
    async (overrideKey?: string) => {
      const useKey = overrideKey ?? key;
      if (!useKey) return;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type });
        if (status) params.set("status", status);
        if (ageGroup && type === "registration") params.set("ageGroup", ageGroup);
        if (method) params.set("paymentMethod", method);
        if (q.trim()) params.set("q", q.trim());
        const res = await fetch(`/api/camp/admin/list?${params.toString()}`, {
          headers: { "x-camp-admin": useKey },
        });
        if (res.status === 401) {
          setUnlocked(false);
          sessionStorage.removeItem(KEY_STORAGE);
          setError("That admin key was rejected.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.ok) {
          setError("Couldn't load registrations.");
          setLoading(false);
          return;
        }
        setRows(data.rows as AdminRow[]);
        setTotals(data.totals as Totals);
        setUnlocked(true);
      } catch {
        setError("Network error.");
      }
      setLoading(false);
    },
    [key, type, status, ageGroup, method, q],
  );

  useEffect(() => {
    if (unlocked && key) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, type, status, ageGroup, method]);

  async function mark(row: AdminRow, action: string) {
    if (action === "paid" && !confirm(`Mark ${row.reference} as paid?`)) return;
    if (action === "refunded" && !confirm(`Mark ${row.reference} as refunded?`)) return;
    const res = await fetch("/api/camp/admin/mark", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-camp-admin": key },
      body: JSON.stringify({ id: row.id, action, type }),
    });
    if (res.ok) void load();
  }

  async function exportCsv() {
    const res = await fetch(`/api/camp/admin/export?type=${type}`, {
      headers: { "x-camp-admin": key },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `camp-${type === "sponsorship" ? "sponsorships" : "registrations"}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-10 lg:pt-36">
        <SectionEyebrow>Internal</SectionEyebrow>
        <h1 className="mt-5 text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {CAMP.name} — registrations
        </h1>

        {!unlocked ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sessionStorage.setItem(KEY_STORAGE, key);
              void load(key);
            }}
            className="mt-8 max-w-md rounded-2xl border border-hairline bg-white/[0.02] p-6"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <KeyRound className="h-4 w-4 text-brand-glow" /> Enter the camp admin key.
            </div>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Admin key"
              autoComplete="off"
              className="mt-4 w-full rounded-lg border border-hairline bg-surface-elevated px-4 py-3 text-sm text-white placeholder:text-muted-foreground/70 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              className="mt-5 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <ShieldCheck className="h-4 w-4" /> Unlock
            </button>
          </form>
        ) : (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Stat label="Records" value={String(totals.count)} />
              <Stat label="Paid" value={String(totals.paid)} />
              <Stat
                label="Collected"
                value={`₦${(totals.paidKobo / 100).toLocaleString("en-NG")}`}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full border border-hairline bg-white/[0.02] p-1">
                {(["registration", "sponsorship"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${
                      type === t
                        ? "bg-white/[0.08] text-white"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    {t === "registration" ? "Registrations" : "Sponsorships"}
                  </button>
                ))}
              </div>

              <Select
                value={status}
                onChange={setStatus}
                options={["", "pending", "paid", "failed", "refunded", "cancelled"]}
                label="Status"
              />
              {type === "registration" && (
                <Select
                  value={ageGroup}
                  onChange={setAgeGroup}
                  options={["", "explorer", "builder"]}
                  label="Age group"
                />
              )}
              <Select
                value={method}
                onChange={setMethod}
                options={["", "card", "transfer"]}
                label="Method"
              />

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && load()}
                  placeholder="Search name, email, reference"
                  className="w-64 rounded-full border border-hairline bg-surface-elevated py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground/70 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
                />
              </div>

              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-white hover:bg-white/[0.06]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </button>
              <button
                type="button"
                onClick={() => void exportCsv()}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-2.5 text-xs font-medium text-white hover:bg-white/[0.06]"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <div className="mt-6 overflow-x-auto rounded-2xl border border-hairline bg-white/[0.02]">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-hairline text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    {type === "registration" ? (
                      <>
                        <Th>Child</Th>
                        <Th>Age group</Th>
                        <Th>Parent</Th>
                        <Th>Contact</Th>
                        <Th>Method</Th>
                        <Th>Status</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </>
                    ) : (
                      <>
                        <Th>Donor</Th>
                        <Th>Seats</Th>
                        <Th>Email</Th>
                        <Th>Method</Th>
                        <Th>Status</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                        No records match these filters.
                      </td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-hairline/60 align-top">
                      {type === "registration" ? (
                        <>
                          <Td>
                            <div className="font-medium text-white">{row.childFirstName}</div>
                            <div className="font-mono text-[11px] text-muted-foreground">
                              {row.reference}
                            </div>
                          </Td>
                          <Td className="capitalize">{row.ageGroup}</Td>
                          <Td>{row.parentName}</Td>
                          <Td>
                            <div>{row.parentEmail}</div>
                            <div className="text-muted-foreground">{row.parentWhatsapp}</div>
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td>{row.donorName || "—"}</Td>
                          <Td>{row.seats}</Td>
                          <Td>{row.donorEmail}</Td>
                        </>
                      )}
                      <Td className="capitalize">{row.paymentMethod}</Td>
                      <Td>
                        <StatusBadge status={row.status} />
                      </Td>
                      <Td className="whitespace-nowrap text-muted-foreground">
                        {new Date(row.createdAt).toLocaleDateString("en-NG", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap gap-1.5">
                          {row.status !== "paid" && (
                            <Mini onClick={() => mark(row, "paid")}>Mark paid</Mini>
                          )}
                          {row.status === "paid" && (
                            <Mini onClick={() => mark(row, "refunded")}>Refund</Mini>
                          )}
                          {row.status === "pending" && (
                            <Mini onClick={() => mark(row, "cancelled")}>Cancel</Mini>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loading && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
            )}
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white/[0.02] p-5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded-full border border-hairline bg-surface-elevated px-4 py-2.5 text-xs text-white capitalize focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o === "" ? `All ${label.toLowerCase()}` : o}
        </option>
      ))}
    </select>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    paid: "border-brand-glow/40 bg-brand-glow/10 text-brand-glow",
    pending: "border-hairline bg-white/[0.03] text-muted-foreground",
    failed: "border-destructive/40 bg-destructive/10 text-destructive",
    refunded: "border-hairline bg-white/[0.03] text-muted-foreground",
    cancelled: "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] capitalize ${tone[status] ?? tone.pending}`}
    >
      {status}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-white ${className}`}>{children}</td>;
}
function Mini({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-hairline bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground hover:text-white transition-colors"
    >
      {children}
    </button>
  );
}
