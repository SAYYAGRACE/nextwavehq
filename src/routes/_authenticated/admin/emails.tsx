import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStaffSession } from "@/integrations/supabase/staffAuth";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Copy,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/emails")({
  head: () => ({
    meta: [{ title: "Email Delivery — Nextwave" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminEmails,
});

type School = {
  id: string;
  name: string;
  lga: string;
  slug: string;
  contact_status: string | null;
};
type Assessment = { id: string; school_id: string; status: string; review_deadline: string | null };
type Contact = {
  id: string;
  school_id: string;
  name: string | null;
  email: string | null;
  whatsapp_e164: string | null;
  sms_e164: string | null;
  is_primary: boolean;
};
type EmailRow = {
  id: string;
  type: string;
  recipient: string;
  school_id: string | null;
  assessment_id: string | null;
  status: string;
  attempts: number;
  error: string | null;
  template_data: { reviewUrl?: string; deadline?: string } | null;
  created_at: string;
  last_attempt_at: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  queued: "bg-amber-500/10 text-amber-500",
  sent: "bg-blue-500/10 text-blue-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  bounced: "bg-destructive/10 text-destructive",
  complained: "bg-destructive/10 text-destructive",
  failed: "bg-destructive/10 text-destructive",
};

function AdminEmails() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const staff = getStaffSession();
    if (staff?.user) return setIsAdmin(true);
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setIsAdmin(false);
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: s }, { data: a }, { data: c }, { data: e }] = await Promise.all([
      supabase.from("schools").select("id, name, lga, slug, contact_status").order("name"),
      supabase.from("assessments").select("id, school_id, status, review_deadline"),
      supabase.from("school_contacts").select("*"),
      supabase.from("email_log").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    setSchools((s as School[] | null) ?? []);
    setAssessments((a as Assessment[] | null) ?? []);
    setContacts((c as Contact[] | null) ?? []);
    setEmails((e as EmailRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  async function adminToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function callApi(path: string, body: unknown) {
    const token = await adminToken();
    if (!token) {
      flash("Sign in with an admin account to take action");
      return null;
    }
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    return res.json().catch(() => null);
  }

  async function sendInvitation(row: Row) {
    if (!row.assessment) return flash("No assessment to link for this school");
    setBusy(row.school.id);
    const recipient = row.contact?.email ?? row.contact?.whatsapp_e164 ?? "";
    const result = await callApi("/api/emails/send", {
      type: "review_link_invitation",
      schoolId: row.school.id,
      assessmentId: row.assessment.id,
      recipient,
      templateData: { schoolName: row.school.name, lga: row.school.lga },
    });
    setBusy(null);
    if (result?.ok) {
      flash("Invitation queued");
      load();
    } else {
      flash(`Failed: ${result?.error ?? "unknown"}`);
    }
  }

  async function resend(row: Row) {
    if (!row.latestEmail) return;
    setBusy(row.school.id);
    const result = await callApi("/api/emails/requeue", { emailLogId: row.latestEmail.id });
    setBusy(null);
    if (result?.ok) {
      flash("Queued for resend");
      load();
    } else {
      flash(`Failed: ${result?.error ?? "unknown"}`);
    }
  }

  async function markOtherChannel(row: Row) {
    if (!row.assessment) return;
    setBusy(row.school.id);
    const { error } = await supabase.rpc("mark_contacted_other_channel", {
      _assessment_id: row.assessment.id,
    });
    setBusy(null);
    if (error) return flash(`Failed: ${error.message}`);
    flash("Marked as contacted by another channel");
    load();
  }

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link);
    flash("Review link copied");
  }

  const rows = useMemo(() => {
    const schoolById = new Map(schools.map((s) => [s.id, s]));
    const assessmentBySchool = new Map<string, Assessment>();
    for (const a of assessments) {
      const existing = assessmentBySchool.get(a.school_id);
      if (!existing || (a.status !== "draft" && existing.status === "draft")) {
        assessmentBySchool.set(a.school_id, a);
      }
    }
    const contactsBySchool = new Map<string, Contact>();
    for (const c of contacts) {
      if (c.is_primary || !contactsBySchool.has(c.school_id)) contactsBySchool.set(c.school_id, c);
    }
    const latestBySchool = new Map<string, EmailRow>();
    for (const e of emails) {
      if (!e.school_id) continue;
      if (!latestBySchool.has(e.school_id)) latestBySchool.set(e.school_id, e);
    }
    return schools
      .map((school) => {
        const contact = contactsBySchool.get(school.id) ?? null;
        const latestEmail = latestBySchool.get(school.id) ?? null;
        return {
          school: schoolById.get(school.id) as School,
          contact,
          latestEmail,
          assessment: assessmentBySchool.get(school.id) ?? null,
          link: latestEmail?.template_data?.reviewUrl ?? null,
        };
      })
      .sort((x, y) => x.school.name.localeCompare(y.school.name));
  }, [schools, assessments, contacts, emails]);

  type Row = (typeof rows)[number];

  if (isAdmin === null) {
    return (
      <div className="min-h-screen grid place-items-center bg-background text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-6">
        <div className="max-w-md w-full glass-strong rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-brand-glow" />
          <h1 className="mt-4 text-xl font-semibold">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            An admin role is required to view delivery status.
          </p>
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
              <div className="text-sm font-semibold">Email Delivery</div>
              <div className="text-[10px] tracking-widest uppercase text-muted-foreground inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-brand-glow" /> Admin Console
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-4 py-2 text-xs hover:bg-foreground/5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
            <ThemeToggle />
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-2 text-xs hover:bg-foreground/5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 lg:px-10 py-8">
        <p className="text-xs text-muted-foreground">
          Review invitations are sent from{" "}
          <span className="text-foreground">ntri@nextwave.com.ng</span> with replies to a monitored
          mailbox. The review clock only starts once delivery is confirmed, or an admin marks the
          school as contacted by another channel.
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl glass-strong">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] tracking-widest uppercase text-muted-foreground border-b border-hairline">
                  <th className="px-5 py-3 font-medium">School</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Delivery</th>
                  <th className="px-5 py-3 font-medium">Review link</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                      No schools loaded.
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr
                    key={row.school.id}
                    className="border-b border-hairline last:border-0 align-top"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium">{row.school.name}</div>
                      <div className="text-xs text-muted-foreground">{row.school.lga}</div>
                      {row.school.contact_status === "contact_undeliverable" && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-destructive">
                          <AlertTriangle className="h-3 w-3" /> contact undeliverable
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground">
                      <div>{row.contact?.name ?? "—"}</div>
                      <div className="text-brand-glow">{row.contact?.email ?? "—"}</div>
                      {row.contact?.whatsapp_e164 && (
                        <div className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {row.contact.whatsapp_e164}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {row.latestEmail ? (
                        <div className="space-y-1">
                          <span
                            className={`inline-block rounded-full px-2.5 py-1 text-[10px] uppercase tracking-widest ${
                              STATUS_STYLES[row.latestEmail.status] ??
                              "bg-foreground/10 text-muted-foreground"
                            }`}
                          >
                            {row.latestEmail.status}
                          </span>
                          <div className="text-[10px] text-muted-foreground">
                            {row.latestEmail.type.replace(/_/g, " ")} · {row.latestEmail.attempts}{" "}
                            attempt
                            {row.latestEmail.attempts === 1 ? "" : "s"}
                          </div>
                          {row.latestEmail.error && (
                            <div className="text-[10px] text-destructive">
                              {row.latestEmail.error}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not sent</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {row.link ? (
                        <code className="block max-w-[220px] truncate text-[10px] text-muted-foreground">
                          {row.link}
                        </code>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {!row.latestEmail && (
                          <ActionBtn
                            onClick={() => sendInvitation(row)}
                            busy={busy === row.school.id}
                            icon={<Send className="h-3.5 w-3.5" />}
                            label="Send"
                          />
                        )}
                        {row.latestEmail && (
                          <ActionBtn
                            onClick={() => resend(row)}
                            busy={busy === row.school.id}
                            icon={<RefreshCw className="h-3.5 w-3.5" />}
                            label="Resend"
                          />
                        )}
                        {row.link && (
                          <>
                            <ActionBtn
                              onClick={() => copyLink(row.link as string)}
                              icon={<Copy className="h-3.5 w-3.5" />}
                              label="Copy"
                            />
                            <ActionLink
                              href={`https://wa.me/${(row.contact?.whatsapp_e164 ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Review ${row.school.name}'s readiness profile: ${row.link}`)}`}
                              icon={<MessageCircle className="h-3.5 w-3.5" />}
                              label="WhatsApp"
                            />
                            <ActionLink
                              href={`sms:${row.contact?.sms_e164 ?? row.contact?.whatsapp_e164 ?? ""}?body=${encodeURIComponent(`Review ${row.school.name}: ${row.link}`)}`}
                              icon={<Phone className="h-3.5 w-3.5" />}
                              label="SMS"
                            />
                          </>
                        )}
                        {row.assessment && !row.assessment.review_deadline && (
                          <ActionBtn
                            onClick={() => markOtherChannel(row)}
                            busy={busy === row.school.id}
                            icon={<Check className="h-3.5 w-3.5" />}
                            label="Contacted"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" /> Statuses update automatically from provider (Resend)
          webhook events.
        </p>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm shadow-lg">
          <Check className="h-4 w-4" /> {toast}
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  onClick,
  busy,
  icon,
  label,
}: {
  onClick: () => void;
  busy?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[11px] hover:bg-foreground/5 disabled:opacity-50"
    >
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon} {label}
    </button>
  );
}

function ActionLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[11px] hover:bg-foreground/5"
    >
      {icon} {label}
    </a>
  );
}
