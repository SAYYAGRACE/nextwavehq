import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { askNextwave, type ChatMessage } from "@/lib/ai";

const SUGGESTIONS = [
  "How do I join the Nextwave Bootcamp?",
  "What is NerdHaven?",
  "How can my school partner with Nextwave?",
];

type Entry = { id: number; role: "user" | "assistant"; content: string };

let nextId = 1;

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Hi, I'm the Nextwave Assistant. Ask me anything about the Bootcamp, NerdHaven, partnerships, or how to get involved.",
    },
  ]);
  const [busy, setBusy] = useState(false);

  async function send(message: string) {
    const text = message.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput("");
    const userMsg: Entry = { id: nextId++, role: "user", content: text };
    setEntries((p) => [...p, userMsg]);
    const history: ChatMessage[] = entries
      .slice(1)
      .map((e) => ({ role: e.role, content: e.content }));
    history.push({ role: "user", content: text });
    const reply = await askNextwave({ data: { history } });
    setEntries((p) => [...p, { id: nextId++, role: "assistant", content: reply }]);
    setBusy(false);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-28 left-5 sm:bottom-24 sm:left-6 z-[60] flex h-[520px] max-h-[calc(100dvh-8rem)] w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl glass-strong border border-hairline shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-9 w-9 place-items-center rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Nextwave Assistant</div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-glow">
                    AI · Fast answers
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    e.role === "user"
                      ? "ml-auto text-white"
                      : "mr-auto text-muted-foreground bg-surface-elevated border border-hairline"
                  }`}
                  style={e.role === "user" ? { background: "var(--gradient-brand)" } : undefined}
                >
                  {e.content}
                </div>
              ))}
              {busy && (
                <div className="mr-auto inline-flex items-center gap-1.5 rounded-2xl bg-surface-elevated border border-hairline px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-glow" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-glow [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-glow [animation-delay:240ms]" />
                </div>
              )}
            </div>

            {entries.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-5 pb-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => void send(s)}
                    className="rounded-full border border-hairline bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-white hover:border-brand-purple/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2 border-t border-hairline px-4 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the Bootcamp, NerdHaven…"
                aria-label="Chat message"
                className="flex-1 rounded-full bg-surface-elevated border border-hairline px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-purple"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={busy || !input.trim()}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white disabled:opacity-40 transition-all"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Nextwave assistant"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="fixed bottom-5 left-5 sm:bottom-6 sm:left-6 z-[60] grid h-14 w-14 place-items-center rounded-full text-white shadow-[0_8px_30px_rgba(124,92,240,0.4)] transition-transform hover:scale-105"
        style={{ background: "var(--gradient-brand)" }}
      >
        {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </motion.button>
    </>
  );
}
