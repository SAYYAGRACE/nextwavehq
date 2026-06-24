import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStaffSession, clearStaffSession } from "@/integrations/supabase/staffAuth";
import StaffMessaging from "@/components/StaffMessaging";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LogOut, Inbox, Mail, Trash2, RefreshCw, ShieldCheck, AlertTriangle,
  Download, Search, Filter, BarChart3, ScrollText, X, TrendingUp,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Nextwave" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Contact = {
  id: string;
  name: string;
  organization: string;
  email: string;
  intent: string;
  message: string;
  created_at: string;
};
type Waitlist = { id: string; email: string; source: string; created_at: string };
type AuditEntry = {
  id: string;
  admin_email: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

type Tab = "overview" | "messages" | "contact" | "waitlist" | "audit";
type DateRange = "all" | "7d" | "30d" | "90d";

type DeleteTarget =
  | { kind: "contact"; row: Contact }
  | { kind: "waitlist"; row: Waitlist };

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [staffRole, setStaffRole] = useState<"ceo" | "coo" | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [waitlist, setWaitlist] = useState<Waitlist[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [toDelete, setToDelete] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // filters
  const [search, setSearch] = useState("");
  const [intent, setIntent] = useState<string>("all");
  const [range, setRange] = useState<DateRange>("all");

  async function checkRole() {
    const staff = getStaffSession();
    if (staff?.user) {
      setUserEmail(staff.user.email);
      setUserName(staff.user.user_metadata.name ?? "");
      setStaffRole(staff.user.user_metadata.staffRole ?? "ceo");
      return setIsAdmin(true);
    }

    const { data: u } = await supabase.auth.getUser();
    setUserEmail(u.user?.email ?? "");
    setUserName(u.user?.user_metadata?.name ?? "");
    if (!u.user) return setIsAdmin(false);
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", u.user.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!error && !!data);
  }

  async function loadAll() {
    setLoading(true);
    const [{ data: c }, { data: w }, { data: a }] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist_signups").select("*").order("created_at", { ascending: false }),
      supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setContacts(c ?? []);
    setWaitlist(w ?? []);
    setAudit((a as AuditEntry[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => { checkRole(); }, []);
  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }

  async function signOut() {
    clearStaffSession();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const rpc = toDelete.kind === "contact" ? "admin_delete_contact" : "admin_delete_waitlist";
    const { error } = await supabase.rpc(rpc, { _id: toDelete.row.id });
    setDeleting(false);
    if (error) {
      flash(`Delete failed: ${error.message}`);
      return;
    }
    if (toDelete.kind === "contact") {
      setContacts((x) => x.filter((c) => c.id !== toDelete.row.id));
      if (selected?.id === toDelete.row.id) setSelected(null);
    } else {
      setWaitlist((x) => x.filter((c) => c.id !== toDelete.row.id));
    }
    setToDelete(null);
    flash("Deleted · audit log updated");
    // refresh audit silently
    supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setAudit((data as AuditEntry[] | null) ?? []));
  }

  // derived
  const cutoff = useMemo(() => {
    if (range === "all") return 0;
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return Date.now() - days * 86400_000;
  }, [range]);

  const intents = useMemo(
    () => Array.from(new Set(contacts.map((c) => c.intent))).sort(),
    [contacts],
  );

  const filteredContacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (cutoff && new Date(c.created_at).getTime() < cutoff) return false;
      if (intent !== "all" && c.intent !== intent) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.organization.toLowerCase().includes(q) ||
        c.message.toLowerCase().includes(q)
      );
    });
  }, [contacts, search, intent, cutoff]);

  const filteredWaitlist = useMemo(() => {
    const q = search.trim().toLowerCase();
    return waitlist.filter((w) => {
      if (cutoff && new Date(w.created_at).getTime() < cutoff) return false;
      if (!q) return true;
      return w.email.toLowerCase().includes(q) || w.source.toLowerCase().includes(q);
    });
  }, [waitlist, search, cutoff]);

  function exportCSV() {
    let rows: string[][] = [];
    let label = tab;
    if (tab === "contact" || tab === "overview") {
      rows = [
        ["created_at", "name", "organization", "email", "intent", "message"],
        ...filteredContacts.map((c) => [c.created_at, c.name, c.organization, c.email, c.intent, c.message]),
      ];
      label = "contact";
    } else if (tab === "waitlist") {
      rows = [
        ["created_at", "email", "source"],
        ...filteredWaitlist.map((w) => [w.created_at, w.email, w.source]),
      ];
    } else {
      rows = [
        ["created_at", "admin_email", "action", "target_table", "target_id", "metadata"],
        ...audit.map((a) => [a.created_at, a.admin_email ?? "", a.action, a.target_table, a.target_id ?? "", JSON.stringify(a.metadata)]),
      ];
    }
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nextwave-${label}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isAdmin === null) {
    return <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6">
        <div className="max-w-md w-full glass-strong rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-brand-glow" />
          <h1 className="mt-4 text-xl font-semibold text-foreground">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account ({userEmail}) is signed in but has not been granted the <code className="text-brand-glow">admin</code> role.
          </p>
          <button
            onClick={signOut}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2 text-sm text-foreground hover:bg-foreground/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-hairline bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variant="square" className="h-8 w-8" />
            <div>
              <div className="text-sm font-semibold">Nextwave Operations</div>
              <div className="text-[10px] tracking-widest uppercase text-muted-foreground inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-brand-glow" /> Admin Console
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right text-xs text-muted-foreground">
              <span className="text-white">{userName || "Staff"}</span>
              <span>{userEmail}</span>
            </div>
            <ThemeToggle />
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-xs hover:bg-foreground/5"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-10 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-hairline">
          <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={<BarChart3 className="h-3.5 w-3.5" />} label="Overview" />
          <TabBtn active={tab === "messages"} onClick={() => setTab("messages")} icon={<Mail className="h-3.5 w-3.5" />} label={`Messages`} />
          {(staffRole === "ceo" || staffRole === "coo") && (
            <>
              <TabBtn active={tab === "contact"} onClick={() => setTab("contact")} icon={<Inbox className="h-3.5 w-3.5" />} label={`Contact (${contacts.length})`} />
              <TabBtn active={tab === "waitlist"} onClick={() => setTab("waitlist")} icon={<Mail className="h-3.5 w-3.5" />} label={`Waitlist (${waitlist.length})`} />
            </>
          )}
          {staffRole === "ceo" && (
            <TabBtn active={tab === "audit"} onClick={() => setTab("audit")} icon={<ScrollText className="h-3.5 w-3.5" />} label={`Audit (${audit.length})`} />
          )}
          <div className="ml-auto flex items-center gap-2 py-2">
            <button onClick={loadAll} className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-xs hover:bg-foreground/5">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            {tab !== "overview" && (
              <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-xs hover:bg-foreground/5">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Filters bar (hide on overview/audit) */}
        {(tab === "contact" || tab === "waitlist") && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === "contact" ? "Search name, email, org, message…" : "Search email or source…"}
                className="w-full rounded-full border border-hairline bg-surface pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            {tab === "contact" && intents.length > 0 && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  className="appearance-none rounded-full border border-hairline bg-surface pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="all">All intents</option>
                  {intents.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            )}
            <div className="flex rounded-full border border-hairline overflow-hidden">
              {(["all","7d","30d","90d"] as DateRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-2 text-xs uppercase tracking-wider transition ${range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {r === "all" ? "All time" : r}
                </button>
              ))}
            </div>
            {(search || intent !== "all" || range !== "all") && (
              <button
                onClick={() => { setSearch(""); setIntent("all"); setRange("all"); }}
                className="inline-flex items-center gap-1 rounded-full border border-hairline px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
        )}

        {/* OVERVIEW */}
        {tab === "overview" && (
          <Overview contacts={contacts} waitlist={waitlist} audit={audit} />
        )}

        {/* MESSAGES */}
        {tab === "messages" && (
          <StaffMessaging staffRole={staffRole} userEmail={userEmail} />
        )}

        {/* CONTACT */}
        {tab === "contact" && (staffRole === "ceo" || staffRole === "coo") && (
          <DataCard count={filteredContacts.length} total={contacts.length} label="contact message">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Org</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Intent</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No submissions match.</td></tr>
                )}
                {filteredContacts.map((c) => (
                  <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-hairline last:border-0 hover:bg-foreground/[0.03] cursor-pointer transition">
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{fmtDate(c.created_at)}</td>
                    <td className="px-5 py-4">{c.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{c.organization}</td>
                    <td className="px-5 py-4 text-brand-glow">{c.email}</td>
                    <td className="px-5 py-4 text-muted-foreground">{c.intent}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setToDelete({ kind: "contact", row: c }); }} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>
        )}

        {/* WAITLIST */}
        {tab === "waitlist" && (
          <DataCard count={filteredWaitlist.length} total={waitlist.length} label="waitlist signup">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Source</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filteredWaitlist.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">No signups match.</td></tr>
                )}
                {filteredWaitlist.map((w) => (
                  <tr key={w.id} className="border-b border-hairline last:border-0 hover:bg-foreground/[0.03] transition">
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{fmtDate(w.created_at)}</td>
                    <td className="px-5 py-4 text-brand-glow">{w.email}</td>
                    <td className="px-5 py-4 text-muted-foreground">{w.source}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setToDelete({ kind: "waitlist", row: w })} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataCard>
        )}

        {/* AUDIT */}
        {tab === "audit" && staffRole === "ceo" && (
          <div className="mt-6 overflow-hidden rounded-2xl glass-strong">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
                    <th className="px-5 py-3 font-medium">When</th>
                    <th className="px-5 py-3 font-medium">Admin</th>
                    <th className="px-5 py-3 font-medium">Action</th>
                    <th className="px-5 py-3 font-medium">Target</th>
                    <th className="px-5 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No admin actions recorded yet.</td></tr>
                  )}
                  {audit.map((a) => (
                    <tr key={a.id} className="border-b border-hairline last:border-0">
                      <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{fmtDate(a.created_at)}</td>
                      <td className="px-5 py-4">{a.admin_email ?? "—"}</td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-destructive/10 text-destructive text-[10px] tracking-widest uppercase px-2.5 py-1">{a.action}</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{a.target_table}</td>
                      <td className="px-5 py-4 text-muted-foreground text-xs">
                        {Object.entries(a.metadata).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="mr-3"><span className="text-foreground/60">{k}:</span> {String(v)}</span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Submission detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur grid place-items-center p-6" onClick={() => setSelected(null)}>
          <div className="max-w-2xl w-full glass-strong rounded-2xl p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{fmtDate(selected.created_at)}</div>
                <h2 className="mt-1 text-xl font-semibold">{selected.name}</h2>
                <div className="mt-1 text-sm text-muted-foreground">{selected.organization} · <a className="text-brand-glow" href={`mailto:${selected.email}`}>{selected.email}</a></div>
              </div>
              <span className="text-[10px] tracking-widest uppercase text-brand-glow border border-brand-purple/40 bg-brand-purple/10 rounded-full px-3 py-1">{selected.intent}</span>
            </div>
            <div className="mt-6 rounded-xl bg-surface-elevated border border-hairline p-5 text-sm whitespace-pre-wrap leading-relaxed">{selected.message}</div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setToDelete({ kind: "contact", row: selected })} className="inline-flex items-center gap-2 rounded-full border border-destructive/40 text-destructive px-4 py-2 text-xs hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <button onClick={() => setSelected(null)} className="rounded-full border border-hairline px-4 py-2 text-xs hover:bg-foreground/5">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Hardened delete confirmation */}
      {toDelete && (
        <ConfirmDelete
          target={toDelete}
          deleting={deleting}
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm shadow-lg">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function DataCard({ count, total, label, children }: { count: number; total: number; label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mt-4 text-xs text-muted-foreground">
        Showing <span className="text-foreground">{count}</span> of {total} {label}{count === 1 ? "" : "s"}
      </div>
      <div className="mt-3 overflow-hidden rounded-2xl glass-strong">
        <div className="overflow-x-auto">{children}</div>
      </div>
    </>
  );
}

function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-3 text-xs tracking-widest uppercase border-b-2 -mb-px transition ${
        active ? "text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function Overview({ contacts, waitlist, audit }: { contacts: Contact[]; waitlist: Waitlist[]; audit: AuditEntry[] }) {
  const now = Date.now();
  const since7 = now - 7 * 86400_000;
  const since30 = now - 30 * 86400_000;
  const contacts7 = contacts.filter((c) => new Date(c.created_at).getTime() >= since7).length;
  const contacts30 = contacts.filter((c) => new Date(c.created_at).getTime() >= since30).length;
  const waitlist7 = waitlist.filter((w) => new Date(w.created_at).getTime() >= since7).length;
  const waitlist30 = waitlist.filter((w) => new Date(w.created_at).getTime() >= since30).length;

  // intent breakdown
  const intentCounts = contacts.reduce<Record<string, number>>((acc, c) => {
    acc[c.intent] = (acc[c.intent] ?? 0) + 1;
    return acc;
  }, {});
  const intentRows = Object.entries(intentCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxIntent = Math.max(1, ...intentRows.map(([, n]) => n));

  // 30-day daily chart
  const days: { label: string; date: string; contacts: number; waitlist: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400_000);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: d.toLocaleDateString(undefined, { day: "numeric" }),
      date: key,
      contacts: contacts.filter((c) => c.created_at.slice(0, 10) === key).length,
      waitlist: waitlist.filter((w) => w.created_at.slice(0, 10) === key).length,
    });
  }
  const maxDay = Math.max(1, ...days.map((d) => d.contacts + d.waitlist));

  return (
    <div className="mt-8 grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPI label="Contact (total)" value={contacts.length} delta={`+${contacts7} last 7d`} />
        <KPI label="Contact (30d)" value={contacts30} delta={`${contacts.length ? Math.round(contacts30 / contacts.length * 100) : 0}% of all-time`} />
        <KPI label="Waitlist (total)" value={waitlist.length} delta={`+${waitlist7} last 7d`} />
        <KPI label="Waitlist (30d)" value={waitlist30} delta={`${waitlist.length ? Math.round(waitlist30 / waitlist.length * 100) : 0}% of all-time`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl glass-strong p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-brand-glow" /> Submissions · last 30 days</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Stacked: contact (purple) + waitlist (blue)</p>
            </div>
          </div>
          <div className="mt-6 flex items-end gap-1 h-40">
            {days.map((d) => {
              const total = d.contacts + d.waitlist;
              const hContact = (d.contacts / maxDay) * 100;
              const hWait = (d.waitlist / maxDay) * 100;
              return (
                <div key={d.date} className="group relative flex-1 flex flex-col-reverse h-full" title={`${d.date}: ${d.contacts} contact · ${d.waitlist} waitlist`}>
                  <div className="bg-primary/80 rounded-b-sm" style={{ height: `${hContact}%`, minHeight: d.contacts ? 2 : 0 }} />
                  <div className="bg-brand-blue/70 rounded-t-sm" style={{ height: `${hWait}%`, minHeight: d.waitlist ? 2 : 0 }} />
                  {total > 0 && (
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">{total}</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{days[0].label}</span>
            <span>{days[Math.floor(days.length / 2)].label}</span>
            <span>{days[days.length - 1].label} (today)</span>
          </div>
        </div>

        <div className="rounded-2xl glass-strong p-6">
          <h3 className="text-sm font-semibold">Top contact intents</h3>
          <div className="mt-5 space-y-3">
            {intentRows.length === 0 && <p className="text-xs text-muted-foreground">No data yet.</p>}
            {intentRows.map(([k, n]) => (
              <div key={k}>
                <div className="flex justify-between text-xs">
                  <span>{k}</span>
                  <span className="text-muted-foreground">{n}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-foreground/5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(n / maxIntent) * 100}%`, background: "var(--gradient-brand)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass-strong p-6">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2"><ScrollText className="h-4 w-4 text-brand-glow" /> Recent admin activity</h3>
        <ul className="mt-4 divide-y divide-hairline">
          {audit.slice(0, 5).map((a) => (
            <li key={a.id} className="py-2.5 flex items-center justify-between text-xs">
              <span><span className="text-foreground">{a.admin_email ?? "admin"}</span> {a.action} <span className="font-mono text-muted-foreground">{a.target_table}</span></span>
              <span className="text-muted-foreground">{fmtDate(a.created_at)}</span>
            </li>
          ))}
          {audit.length === 0 && <li className="py-2.5 text-xs text-muted-foreground">No admin actions yet.</li>}
        </ul>
      </div>
    </div>
  );
}

function KPI({ label, value, delta }: { label: string; value: number; delta: string }) {
  return (
    <div className="rounded-2xl glass-strong p-5">
      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{delta}</div>
    </div>
  );
}

function ConfirmDelete({
  target, deleting, onCancel, onConfirm,
}: {
  target: DeleteTarget;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const expected = target.kind === "contact" ? target.row.email : target.row.email;
  const [typed, setTyped] = useState("");
  const ok = typed.trim().toLowerCase() === expected.toLowerCase();

  return (
    <div className="fixed inset-0 z-[60] bg-black/65 backdrop-blur grid place-items-center p-6" onClick={onCancel}>
      <div className="max-w-md w-full glass-strong rounded-2xl p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold">Permanently delete entry</h3>
            <p className="text-xs text-muted-foreground">This action is logged to the audit trail.</p>
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-hairline bg-surface p-4 text-xs">
          {target.kind === "contact" ? (
            <>
              <div><span className="text-muted-foreground">Name:</span> {target.row.name}</div>
              <div><span className="text-muted-foreground">Email:</span> {target.row.email}</div>
              <div><span className="text-muted-foreground">Intent:</span> {target.row.intent}</div>
            </>
          ) : (
            <>
              <div><span className="text-muted-foreground">Email:</span> {target.row.email}</div>
              <div><span className="text-muted-foreground">Source:</span> {target.row.source}</div>
            </>
          )}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Type <code className="text-foreground bg-foreground/5 px-1.5 py-0.5 rounded">{expected}</code> to confirm.
        </p>
        <input
          autoFocus
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          className="mt-2 w-full rounded-lg border border-hairline bg-surface px-3 py-2 text-sm focus:outline-none focus:border-destructive"
          placeholder={expected}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} disabled={deleting} className="rounded-full border border-hairline px-4 py-2 text-xs hover:bg-foreground/5 disabled:opacity-50">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={!ok || deleting}
            className="inline-flex items-center gap-2 rounded-full bg-destructive text-destructive-foreground px-4 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
          >
            {deleting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}
