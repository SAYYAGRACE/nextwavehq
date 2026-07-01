import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStaffSession, clearStaffSession } from "@/integrations/supabase/staffAuth";
import { getErpModuleAccess, getRoleLabel, getRoleDescription } from "@/integrations/supabase/staffAuth";
import type { ErpRole } from "@/integrations/supabase/staffAuth";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import StaffMessaging from "@/components/StaffMessaging";
import {
  LayoutDashboard, Users, Banknote, Briefcase, Settings, LogOut,
  BarChart3, ScrollText, Inbox, Mail, CheckSquare, TrendingUp,
  Activity, UserCircle, Target, Clock, DollarSign, Calendar,
  FileText, AlertTriangle, RefreshCw, Download, Search, Filter, X,
  CheckCircle2, Building2, Globe, Lightbulb, Layers, ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Nextwave" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ErpDashboard,
});

type ErpModule = "overview" | "analytics" | "hr" | "finance" | "operations" | "projects" | "tasks" | "messages" | "settings" | "audit" | "contact" | "waitlist" | "marketing";

type Contact = {
  id: string; name: string; organization: string; email: string; intent: string; message: string; created_at: string;
};
type Waitlist = { id: string; email: string; source: string; created_at: string };
type AuditEntry = {
  id: string; admin_email: string | null; action: string; target_table: string; target_id: string | null; metadata: Record<string, unknown>; created_at: string;
};

interface ModuleConfig {
  id: ErpModule;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const MODULE_CONFIGS: Record<ErpModule, ModuleConfig> = {
  overview: { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" />, description: "Key metrics and summary" },
  analytics: { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" />, description: "Company-wide analytics" },
  hr: { id: "hr", label: "HR", icon: <Users className="h-4 w-4" />, description: "Employee management" },
  finance: { id: "finance", label: "Finance", icon: <Banknote className="h-4 w-4" />, description: "Financial overview" },
  operations: { id: "operations", label: "Operations", icon: <Activity className="h-4 w-4" />, description: "Operational metrics" },
  projects: { id: "projects", label: "Projects", icon: <Briefcase className="h-4 w-4" />, description: "Project tracking" },
  tasks: { id: "tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" />, description: "My tasks" },
  messages: { id: "messages", label: "Messages", icon: <Mail className="h-4 w-4" />, description: "Staff messaging" },
  settings: { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" />, description: "Account settings" },
  audit: { id: "audit", label: "Audit", icon: <ScrollText className="h-4 w-4" />, description: "Activity log" },
  contact: { id: "contact", label: "Contact", icon: <Inbox className="h-4 w-4" />, description: "Contact submissions" },
  waitlist: { id: "waitlist", label: "Waitlist", icon: <Mail className="h-4 w-4" />, description: "Waitlist signups" },
  marketing: { id: "marketing", label: "Marketing", icon: <Globe className="h-4 w-4" />, description: "Brand and outreach" },
};

function ErpDashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [erpRole, setErpRole] = useState<ErpRole>("member");
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [activeModule, setActiveModule] = useState<ErpModule>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [waitlist, setWaitlist] = useState<Waitlist[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const allowedModules = useMemo(() => getErpModuleAccess(erpRole), [erpRole]);
  const roleLabel = useMemo(() => getRoleLabel(erpRole), [erpRole]);
  const roleDescription = useMemo(() => getRoleDescription(erpRole), [erpRole]);

  // Only show modules the user has access to
  const visibleModules = useMemo(
    () => allowedModules.map((m) => MODULE_CONFIGS[m as ErpModule]).filter(Boolean),
    [allowedModules],
  );

  useEffect(() => {
    const staff = getStaffSession();
    if (staff?.user) {
      const meta = staff.user.user_metadata;
      setUserEmail(staff.user.email);
      setUserName(meta.name ?? "");
      setErpRole(meta.erpRole ?? "member");
      setDepartment(meta.department ?? "");
      setTitle(meta.title ?? "");
    } else {
      supabase.auth.getUser().then(({ data }) => {
        setUserEmail(data.user?.email ?? "");
        setUserName(data.user?.user_metadata?.name ?? "");
      });
    }
  }, []);

  async function loadData() {
    setLoading(true);
    const [c, w, a] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist_signups").select("*").order("created_at", { ascending: false }),
      supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setContacts(c.data ?? []);
    setWaitlist(w.data ?? []);
    setAudit((a.data as AuditEntry[] | null) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (allowedModules.includes("contact") || allowedModules.includes("waitlist") || allowedModules.includes("audit") || allowedModules.includes("marketing")) {
      loadData();
    }
  }, [allowedModules]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  async function signOut() {
    clearStaffSession();
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-hairline bg-background/95 backdrop-blur-lg flex flex-col transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-hairline flex items-center gap-3">
          <Logo variant="square" className="h-8 w-8 shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">Nextwave</div>
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground truncate">{roleLabel}</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => { setActiveModule(mod.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activeModule === mod.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {mod.icon}
              <span>{mod.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-hairline space-y-2">
          <div className="px-3 py-2 rounded-lg bg-foreground/5">
            <div className="text-xs font-medium truncate">{userName}</div>
            <div className="text-[10px] text-muted-foreground truncate">{title}</div>
            <div className="text-[10px] text-muted-foreground truncate">{department}</div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-hairline bg-background/85 backdrop-blur">
          <div className="flex items-center justify-between px-4 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-foreground/5"
              >
                <Layers className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-sm font-semibold">{MODULE_CONFIGS[activeModule].label}</h2>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground">{roleDescription}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {/* Module views */}
          {activeModule === "overview" && (
            <OverviewView erpRole={erpRole} userName={userName} contacts={contacts} waitlist={waitlist} audit={audit} />
          )}
          {activeModule === "analytics" && <AnalyticsView />}
          {activeModule === "hr" && <HRView erpRole={erpRole} />}
          {activeModule === "finance" && <FinanceView />}
          {activeModule === "operations" && <OperationsView />}
          {activeModule === "projects" && <ProjectsView erpRole={erpRole} />}
          {activeModule === "tasks" && <TasksView userName={userName} />}
          {activeModule === "messages" && <MessagesView userEmail={userEmail} erpRole={erpRole} />}
          {activeModule === "settings" && (
            <SettingsView userName={userName} userEmail={userEmail} erpRole={erpRole} department={department} title={title} onFlash={flash} />
          )}
          {activeModule === "audit" && <AuditView audit={audit} />}
          {activeModule === "contact" && <ContactView contacts={contacts} onFlash={flash} />}
          {activeModule === "waitlist" && <WaitlistView waitlist={waitlist} erpRole={erpRole} userEmail={userEmail} onFlash={flash} onRefresh={loadData} />}
          {activeModule === "marketing" && <MarketingView />}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm shadow-lg">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}
    </div>
  );
}

/* ─── OVERVIEW ─── */

function OverviewView({ erpRole, userName, contacts, waitlist, audit }: { erpRole: ErpRole; userName: string; contacts: Contact[]; waitlist: Waitlist[]; audit: AuditEntry[] }) {
  const now = Date.now();
  const since7 = now - 7 * 86400_000;
  const since30 = now - 30 * 86400_000;
  const contacts7 = contacts.filter((c) => new Date(c.created_at).getTime() >= since7).length;
  const contacts30 = contacts.filter((c) => new Date(c.created_at).getTime() >= since30).length;
  const waitlist7 = waitlist.filter((w) => new Date(w.created_at).getTime() >= since7).length;
  const waitlist30 = waitlist.filter((w) => new Date(w.created_at).getTime() >= since30).length;

  const kpis = [
    { label: "Contact Submissions", value: contacts.length, delta: `+${contacts7} this week` },
    { label: "Waitlist Signups", value: waitlist.length, delta: `+${waitlist7} this week` },
    { label: "Active Staff", value: 10, delta: "Across 6 departments" },
    { label: "Projects", value: 12, delta: "4 in progress" },
  ];

  const roleGreetings: Record<string, string> = {
    ceo: "Welcome back — here's your company-wide snapshot.",
    coo: "Operations summary at a glance.",
    hr: "Your HR dashboard — people and culture metrics.",
    finance: "Financial summary for the period.",
    "project-manager": "Project portfolio overview.",
    member: "Your personal workspace.",
    "head-of-operations": "Operations overview — keep things running smoothly.",
    "head-of-programs": "Program milestones and impact at a glance.",
    "head-of-marketing": "Marketing performance and outreach metrics.",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good to see you, {userName.split(" ")[0]}!</h1>
        <p className="text-sm text-muted-foreground mt-1">{roleGreetings[erpRole] ?? "Your dashboard."}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl glass-strong p-5">
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{kpi.label}</div>
            <div className="mt-2 text-3xl font-bold">{kpi.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{kpi.delta}</div>
          </div>
        ))}
      </div>

      {/* 30-day chart */}
      <div className="rounded-2xl glass-strong p-6">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2"><TrendingUp className="h-4 w-4 text-brand-glow" /> 30-Day Activity</h3>
        <div className="mt-4 flex items-end gap-1 h-32">
          {Array.from({ length: 30 }, (_, i) => {
            const d = new Date(now - (29 - i) * 86400_000);
            const key = d.toISOString().slice(0, 10);
            const c = contacts.filter((x) => x.created_at.slice(0, 10) === key).length;
            const w = waitlist.filter((x) => x.created_at.slice(0, 10) === key).length;
            const total = c + w;
            const max = Math.max(1, ...Array.from({ length: 30 }, (_, j) => {
              const d2 = new Date(now - (29 - j) * 86400_000);
              const k2 = d2.toISOString().slice(0, 10);
              return contacts.filter((x) => x.created_at.slice(0, 10) === k2).length + waitlist.filter((x) => x.created_at.slice(0, 10) === k2).length;
            }));
            return (
              <div key={key} className="group relative flex-1 flex flex-col-reverse h-full" title={`${key}: ${total}`}>
                <div className="bg-primary/60 rounded-t-sm transition-all hover:bg-primary/80" style={{ height: `${(total / max) * 100}%`, minHeight: total ? 2 : 0 }} />
                {total > 0 && (
                  <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100">{total}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl glass-strong p-6">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2"><Activity className="h-4 w-4 text-brand-glow" /> Recent activity</h3>
        <ul className="mt-4 divide-y divide-hairline">
          {audit.slice(0, 5).map((a) => (
            <li key={a.id} className="py-2.5 flex items-center justify-between text-xs">
              <span><span className="text-foreground">{a.admin_email ?? "admin"}</span> {a.action} <span className="font-mono text-muted-foreground">{a.target_table}</span></span>
              <span className="text-muted-foreground">{fmtDate(a.created_at)}</span>
            </li>
          ))}
          {audit.length === 0 && <li className="py-2.5 text-xs text-muted-foreground">No recent activity.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ─── ANALYTICS ─── */

function AnalyticsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
      <p className="text-sm text-muted-foreground">Company-wide analytics and performance metrics.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Revenue MTD", value: "$--", icon: <DollarSign className="h-4 w-4" /> },
          { label: "Active Users", value: "--", icon: <Users className="h-4 w-4" /> },
          { label: "Project Completion", value: "--%", icon: <Target className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass-strong p-5">
            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground">
              {s.icon} {s.label}
            </div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl glass-strong p-6 text-center text-sm text-muted-foreground">
        <BarChart3 className="mx-auto h-8 w-8 mb-3 opacity-40" />
        Analytics dashboard — connect your data sources to populate charts and metrics.
      </div>
    </div>
  );
}

/* ─── HR ─── */

const EMPLOYEES = [
  { name: "Khalifa", email: "ceo@nextwave.com", role: "CEO", department: "Executive", status: "active" },
  { name: "Ahmad Sani", email: "coo@nextwave.com", role: "COO", department: "Operations", status: "active" },
  { name: "Musa Ibrahim", email: "operations@nextwave.com", role: "Head of Operations", department: "Operations", status: "active" },
  { name: "Sarah Okafor", email: "programs@nextwave.com", role: "Head of Programs", department: "Programs", status: "active" },
  { name: "Chidi Eze", email: "marketing@nextwave.com", role: "Head of Marketing", department: "Marketing", status: "active" },
  { name: "Aisha Mohammed", email: "hr@nextwave.com", role: "HR Manager", department: "Human Resources", status: "active" },
  { name: "Ibrahim Musa", email: "finance@nextwave.com", role: "Finance Manager", department: "Finance", status: "active" },
  { name: "Fatima Usman", email: "pm@nextwave.com", role: "Project Manager", department: "Projects", status: "active" },
  { name: "Ahmad Salisu", email: "ahmadsalisu@nextwave.com", role: "Software Engineer", department: "Engineering", status: "active" },
  { name: "Zainab Abdullah", email: "member@nextwave.com", role: "Junior Developer", department: "Engineering", status: "active" },
];

function HRView({ erpRole }: { erpRole: ErpRole }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Human Resources</h1>
          <p className="text-sm text-muted-foreground mt-1">Employee directory and management.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Employees", value: EMPLOYEES.length, icon: <Users className="h-4 w-4" /> },
          { label: "Departments", value: 6, icon: <Building2 className="h-4 w-4" /> },
          { label: "Active", value: EMPLOYEES.filter((e) => e.status === "active").length, icon: <CheckCircle2 className="h-4 w-4" /> },
          { label: "New This Month", value: 0, icon: <UserCircle className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass-strong p-5">
            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground">{s.icon} {s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl glass-strong overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {EMPLOYEES.map((emp) => (
              <tr key={emp.email} className="border-b border-hairline last:border-0 hover:bg-foreground/[0.03] transition">
                <td className="px-5 py-4 font-medium">{emp.name}</td>
                <td className="px-5 py-4 text-brand-glow">{emp.email}</td>
                <td className="px-5 py-4 text-muted-foreground">{emp.role}</td>
                <td className="px-5 py-4 text-muted-foreground">{emp.department}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] tracking-widest uppercase px-2.5 py-1">
                    <CheckCircle2 className="h-3 w-3" /> {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── FINANCE ─── */

function FinanceView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Finance</h1>
      <p className="text-sm text-muted-foreground">Financial overview and reporting.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Monthly Budget", value: "$--", format: true },
          { label: "Expenses MTD", value: "$--", format: true },
          { label: "Revenue", value: "$--", format: true },
          { label: "Burn Rate", value: "--%", format: false },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass-strong p-5">
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl glass-strong p-6 text-center text-sm text-muted-foreground">
        <Banknote className="mx-auto h-8 w-8 mb-3 opacity-40" />
        Connect your accounting software to view financial data.
      </div>
    </div>
  );
}

/* ─── OPERATIONS ─── */

function OperationsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
      <p className="text-sm text-muted-foreground">Operational metrics and resource management.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Active Projects", value: 4, icon: <Briefcase className="h-4 w-4" /> },
          { label: "Team Members", value: 7, icon: <Users className="h-4 w-4" /> },
          { label: "Pending Tasks", value: 12, icon: <Clock className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass-strong p-5">
            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground">{s.icon} {s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl glass-strong p-6">
        <h3 className="text-sm font-semibold mb-4">Upcoming Milestones</h3>
        <div className="space-y-3">
          {[
            { title: "Q3 Bootcamp Launch", date: "Aug 1, 2026", status: "on-track" },
            { title: "NerdHaven Platform v2", date: "Sep 15, 2026", status: "at-risk" },
            { title: "Annual Report", date: "Dec 31, 2026", status: "planning" },
          ].map((m) => (
            <div key={m.title} className="flex items-center justify-between border-b border-hairline pb-3 last:border-0 last:pb-0">
              <div>
                <div className="text-sm font-medium">{m.title}</div>
                <div className="text-xs text-muted-foreground">{m.date}</div>
              </div>
              <span className={`text-[10px] tracking-widest uppercase rounded-full px-2.5 py-1 ${
                m.status === "on-track" ? "bg-emerald-500/10 text-emerald-400" :
                m.status === "at-risk" ? "bg-amber-500/10 text-amber-400" :
                "bg-blue-500/10 text-blue-400"
              }`}>{m.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── PROJECTS ─── */

const PROJECTS_LIST = [
  {
    id: "1", name: "AI Bootcamp Q3", lead: "Fatima Usman", status: "in-progress",
    progress: 65, deadline: "Aug 15, 2026", priority: "high",
  },
  {
    id: "2", name: "NerdHaven Platform", lead: "Ahmad Sani", status: "in-progress",
    progress: 40, deadline: "Sep 30, 2026", priority: "high",
  },
  {
    id: "3", name: "Community Outreach", lead: "Aisha Mohammed", status: "planning",
    progress: 15, deadline: "Oct 1, 2026", priority: "medium",
  },
  {
    id: "4", name: "Digital Health Initiative", lead: "Khalifa", status: "planning",
    progress: 10, deadline: "Dec 31, 2026", priority: "medium",
  },
];

function ProjectsView({ erpRole }: { erpRole: ErpRole }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
      <p className="text-sm text-muted-foreground">Project portfolio and tracking.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Projects", value: PROJECTS_LIST.length },
          { label: "In Progress", value: PROJECTS_LIST.filter((p) => p.status === "in-progress").length },
          { label: "Planning", value: PROJECTS_LIST.filter((p) => p.status === "planning").length },
          { label: "Completed", value: PROJECTS_LIST.filter((p) => p.status === "completed").length },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass-strong p-5">
            <div className="text-[10px] tracking-widest uppercase text-muted-foreground">{s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl glass-strong overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Lead</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Progress</th>
              <th className="px-5 py-3 font-medium">Deadline</th>
              <th className="px-5 py-3 font-medium">Priority</th>
            </tr>
          </thead>
          <tbody>
            {PROJECTS_LIST.map((p) => (
              <tr key={p.id} className="border-b border-hairline last:border-0 hover:bg-foreground/[0.03] transition">
                <td className="px-5 py-4 font-medium">{p.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.lead}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full text-[10px] tracking-widest uppercase px-2.5 py-1 ${
                    p.status === "in-progress" ? "bg-brand-purple/10 text-brand-glow" :
                    p.status === "planning" ? "bg-blue-500/10 text-blue-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  }`}>{p.status}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-foreground/5 overflow-hidden w-24">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{p.deadline}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full text-[10px] tracking-widest uppercase px-2.5 py-1 ${
                    p.priority === "high" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-400"
                  }`}>{p.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── TASKS ─── */

function TasksView({ userName }: { userName: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
      <p className="text-sm text-muted-foreground">Personal task management for {userName}.</p>
      <div className="rounded-2xl glass-strong p-6 text-center text-sm text-muted-foreground">
        <CheckSquare className="mx-auto h-8 w-8 mb-3 opacity-40" />
        Task management — your assigned tasks will appear here.
      </div>
    </div>
  );
}

/* ─── SETTINGS ─── */

function SettingsView({ userName, userEmail, erpRole, department, title, onFlash }: {
  userName: string; userEmail: string; erpRole: ErpRole; department: string; title: string; onFlash: (msg: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground">Account and profile settings.</p>
      <div className="max-w-2xl rounded-2xl glass-strong p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground">Name</label>
            <p className="mt-1 text-sm font-medium">{userName}</p>
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground">Email</label>
            <p className="mt-1 text-sm text-brand-glow">{userEmail}</p>
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground">Role</label>
            <p className="mt-1 text-sm font-medium capitalize">{erpRole.replace("-", " ")}</p>
          </div>
          <div>
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground">Department</label>
            <p className="mt-1 text-sm capitalize">{department.replace("-", " ")}</p>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] tracking-widest uppercase text-muted-foreground">Title</label>
            <p className="mt-1 text-sm">{title}</p>
          </div>
        </div>
        <button
          onClick={() => onFlash("Settings saved (demo)")}
          className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-xs font-medium hover:opacity-90"
        >
          Save changes
        </button>
      </div>
    </div>
  );
}

/* ─── AUDIT ─── */

function AuditView({ audit }: { audit: AuditEntry[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin activity and system changes.</p>
        </div>
        <button
          onClick={() => {
            const csv = [
              ["created_at", "admin_email", "action", "target_table", "target_id", "metadata"],
              ...audit.map((a) => [a.created_at, a.admin_email ?? "", a.action, a.target_table, a.target_id ?? "", JSON.stringify(a.metadata)]),
            ].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `nextwave-audit-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-xs hover:bg-foreground/5"
        >
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>
      <div className="rounded-2xl glass-strong overflow-hidden">
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
  );
}

/* ─── CONTACT ─── */

function ContactView({ contacts, onFlash }: { contacts: Contact[]; onFlash: (msg: string) => void }) {
  const [search, setSearch] = useState("");
  const [intent, setIntent] = useState<string>("all");
  const [selected, setSelected] = useState<Contact | null>(null);

  const intents = useMemo(() => Array.from(new Set(contacts.map((c) => c.intent))).sort(), [contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (intent !== "all" && c.intent !== intent) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.organization.toLowerCase().includes(q) || c.message.toLowerCase().includes(q);
    });
  }, [contacts, search, intent]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Contact Submissions</h1>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, org…" className="w-full rounded-full border border-hairline bg-surface pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>
        {intents.length > 0 && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select value={intent} onChange={(e) => setIntent(e.target.value)} className="appearance-none rounded-full border border-hairline bg-surface pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="all">All intents</option>
              {intents.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="rounded-2xl glass-strong overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Org</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Intent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No submissions match.</td></tr>}
            {filtered.map((c) => (
              <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-hairline last:border-0 hover:bg-foreground/[0.03] cursor-pointer transition">
                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{fmtDate(c.created_at)}</td>
                <td className="px-5 py-4">{c.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{c.organization}</td>
                <td className="px-5 py-4 text-brand-glow">{c.email}</td>
                <td className="px-5 py-4 text-muted-foreground">{c.intent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
              <button onClick={() => setSelected(null)} className="rounded-full border border-hairline px-4 py-2 text-xs hover:bg-foreground/5">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── WAITLIST ─── */

function WaitlistView({ waitlist, erpRole, userEmail, onFlash, onRefresh }: {
  waitlist: Waitlist[]; erpRole: ErpRole; userEmail: string; onFlash: (msg: string) => void; onRefresh: () => void;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const isHoo = erpRole === "head-of-operations";

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return waitlist.filter((w: any) => {
      if (tab !== "all" && (w as any).status !== tab && !(tab === "pending" && !(w as any).status)) return false;
      if (!q) return true;
      return w.email.toLowerCase().includes(q) || w.source.toLowerCase().includes(q);
    });
  }, [waitlist, search, tab]);

  async function approve(signup: Waitlist) {
    const { error } = await (supabase.rpc as any)("approve_waitlist_signup", {
      _id: signup.id,
      _admin_email: userEmail,
    });
    if (error) {
      onFlash(`Error: ${error.message}`);
      return;
    }
    onFlash(`Approved — ${signup.email}`);
    onRefresh();
  }

  async function reject(signup: Waitlist) {
    const { error } = await (supabase.rpc as any)("reject_waitlist_signup", {
      _id: signup.id,
    });
    if (error) {
      onFlash(`Error: ${error.message}`);
      return;
    }
    onFlash(`Rejected — ${signup.email}`);
    onRefresh();
  }

  const pending = waitlist.filter((w: any) => !(w as any).status || (w as any).status === "pending");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">NerdHaven Waitlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pending.length} pending signup{pending.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email or source…" className="w-full rounded-full border border-hairline bg-surface pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary" />
        </div>
        <div className="flex rounded-full border border-hairline overflow-hidden">
          {(["pending", "approved", "rejected", "all"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs uppercase tracking-wider transition ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl glass-strong overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Status</th>
              {isHoo && <th className="px-5 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={isHoo ? 5 : 4} className="px-5 py-10 text-center text-muted-foreground">No signups match.</td></tr>
            )}
            {filtered.map((w: any) => (
              <tr key={w.id} className="border-b border-hairline last:border-0 hover:bg-foreground/[0.03] transition">
                <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">{fmtDate(w.created_at)}</td>
                <td className="px-5 py-4 text-brand-glow">{w.email}</td>
                <td className="px-5 py-4 text-muted-foreground">{w.source}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full text-[10px] tracking-widest uppercase px-2.5 py-1 ${
                    w.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    w.status === "rejected" ? "bg-destructive/10 text-destructive" :
                    "bg-amber-500/10 text-amber-400"
                  }`}>
                    {w.status ?? "pending"}
                  </span>
                </td>
                {isHoo && (
                  <td className="px-5 py-4">
                    {(!w.status || w.status === "pending") ? (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => approve(w)} className="rounded-full bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs hover:bg-emerald-500/20">Approve</button>
                        <button onClick={() => reject(w)} className="rounded-full bg-destructive/10 text-destructive px-3 py-1 text-xs hover:bg-destructive/20">Reject</button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── MESSAGES ─── */

function MessagesView({ userEmail, erpRole }: { userEmail: string; erpRole: ErpRole }) {
  return <StaffMessaging staffRole={erpRole === "ceo" || erpRole === "coo" ? erpRole : "member"} userEmail={userEmail} />;
}

/* ─── MARKETING ─── */

function MarketingView() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Marketing</h1>
      <p className="text-sm text-muted-foreground">Brand strategy, outreach campaigns, and growth metrics.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Campaigns", value: 3, icon: <Globe className="h-4 w-4" /> },
          { label: "Contact Leads", value: "--", icon: <Inbox className="h-4 w-4" /> },
          { label: "Waitlist Signups", value: "--", icon: <Mail className="h-4 w-4" /> },
          { label: "Social Reach", value: "--", icon: <TrendingUp className="h-4 w-4" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl glass-strong p-5">
            <div className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-muted-foreground">{s.icon} {s.label}</div>
            <div className="mt-2 text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl glass-strong p-6 text-center text-sm text-muted-foreground">
        <Globe className="mx-auto h-8 w-8 mb-3 opacity-40" />
        Connect your marketing channels to view campaign analytics and outreach metrics.
      </div>
    </div>
  );
}

/* ─── UTILITIES ─── */

function fmtDate(d: string) {
  return new Date(d).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
