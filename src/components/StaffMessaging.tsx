import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStaffSession } from "@/integrations/supabase/staffAuth";

type Props = { staffRole: "ceo" | "coo" | "member" | null; userEmail: string };

export default function StaffMessaging({ staffRole, userEmail }: Props) {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [newRecipient, setNewRecipient] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");

  useEffect(() => {
    const s = getStaffSession();
    if (s?.user) {
      setUser({ id: s.user.id ?? null, email: s.user.email, name: s.user.user_metadata.name, staffRole: s.user.user_metadata.staffRole });
    } else {
      supabase.auth.getUser().then(({ data }) => {
        setUser({ id: data.user?.id, email: data.user?.email, name: data.user?.user_metadata?.name, staffRole: data.user?.user_metadata?.staffRole });
      });
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchConversations();
    fetchAllStaff();
  }, [user]);

  async function fetchConversations() {
    const { data: parts } = await supabase
      .from("staff_conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    const convIds = (parts ?? []).map((p: any) => p.conversation_id);
    if (convIds.length === 0) {
      setConversations([]);
      return;
    }
    const { data } = await supabase.from("staff_conversations").select("*").in("id", convIds).order("updated_at", { ascending: false });
    setConversations(data ?? []);
  }

  async function fetchMessages(conversationId: string) {
    const { data } = await supabase
      .from("staff_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  }

  async function fetchAllStaff() {
    try {
      const { data } = await supabase.rpc("get_all_staff");
      setAllStaff(data ?? []);
    } catch (e) {
      // ignore
    }
  }

  async function startConversationWith(recipientId: string) {
    if (!user) return;
    const { data: conv } = await supabase
      .from("staff_conversations")
      .insert({ created_by: user.id, subject: null })
      .select("*")
      .single();
    if (!conv) return;
    const me = {
      conversation_id: conv.id,
      user_id: user.id,
      user_email: user.email,
      user_name: user.name ?? user.email,
      user_role: user.staffRole ?? "",
    };
    const rec = allStaff.find((s: any) => s.id === recipientId);
    const other = {
      conversation_id: conv.id,
      user_id: rec.id,
      user_email: rec.email,
      user_name: rec.name ?? rec.email,
      user_role: rec.role ?? "",
    };
    await supabase.from("staff_conversation_participants").insert([me, other]);
    setNewRecipient("");
    await fetchConversations();
    setSelected(conv);
    fetchMessages(conv.id);
  }

  async function sendMessage() {
    if (!selected || !user || !newMessage.trim()) return;
    await supabase.from("staff_messages").insert({
      conversation_id: selected.id,
      content: newMessage.trim(),
      sender_id: user.id,
      sender_email: user.email,
      sender_name: user.name ?? user.email,
      sender_role: user.staffRole ?? "",
    });
    setNewMessage("");
    fetchMessages(selected.id);
    // touch conversation updated_at
    await supabase.from("staff_conversations").update({}).eq("id", selected.id);
    fetchConversations();
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 rounded-2xl glass-strong p-4">
        <h3 className="text-sm font-semibold">Conversations</h3>
        <div className="mt-3 space-y-3">
          {conversations.length === 0 && <div className="text-xs text-muted-foreground">No conversations yet.</div>}
          {conversations.map((c) => (
            <button key={c.id} onClick={() => { setSelected(c); fetchMessages(c.id); }} className={`w-full text-left rounded-md px-3 py-2 ${selected?.id === c.id ? "bg-primary/5" : "hover:bg-foreground/5"}`}>
              <div className="text-sm font-medium">{c.subject ?? `Conversation ${c.id.slice(0, 8)}`}</div>
              <div className="text-xs text-muted-foreground">Updated {new Date(c.updated_at).toLocaleString()}</div>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <h4 className="text-xs text-muted-foreground">Start a new conversation</h4>
          <select value={newRecipient} onChange={(e) => setNewRecipient(e.target.value)} className="mt-2 w-full rounded-full border border-hairline px-3 py-2 text-sm">
            <option value="">Select a staff member…</option>
            {allStaff.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name ?? s.email} — {s.role}</option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <button disabled={!newRecipient} onClick={() => startConversationWith(newRecipient)} className="rounded-full bg-primary text-primary-foreground px-3 py-2 text-xs disabled:opacity-50">Start</button>
            <button onClick={() => { setNewRecipient(""); }} className="rounded-full border border-hairline px-3 py-2 text-xs">Cancel</button>
          </div>

          {staffRole === "ceo" && (
            <p className="mt-3 text-xs text-muted-foreground">As CEO you can start group conversations by selecting multiple participants from the staff list (future enhancement).</p>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-2xl glass-strong p-4">
        <h3 className="text-sm font-semibold">{selected ? (selected.subject ?? `Conversation ${selected.id.slice(0,8)}`) : "Select a conversation"}</h3>
        <div className="mt-4 h-96 overflow-auto rounded-md border border-hairline bg-surface p-4">
          {selected ? (
            messages.map((m) => (
              <div key={m.id} className={`mb-3 ${m.sender_email === user?.email ? "text-right" : "text-left"}`}>
                <div className="text-[11px] text-muted-foreground">{m.sender_name} · {new Date(m.created_at).toLocaleString()}</div>
                <div className={`inline-block mt-1 px-3 py-2 rounded-md ${m.sender_email === user?.email ? "bg-primary/80 text-primary-foreground" : "bg-foreground/5"}`}>{m.content}</div>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">Choose or start a conversation to view messages.</div>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Write a message…" className="flex-1 rounded-full border border-hairline px-4 py-2 text-sm" />
          <button onClick={sendMessage} className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm">Send</button>
        </div>
      </div>
    </div>
  );
}
