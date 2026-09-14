import { createServerFn } from "@tanstack/react-start";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are the "Nextwave Assistant" — the friendly, concise AI on the website of Nextwave Infotech.

FACTS ABOUT NEXTWAVE INFOTECH (use these as ground truth; do not invent others):
- A youth-led deep-tech movement empowering Africa's youth, based in Kaduna, Northern Nigeria.
- Works across three verticals: AI & Data Science, Biotechnology & Health, Digital Health Policy.
- Runs "The Nextwave Bootcamp" — a live, active program in Kaduna with 4 phases: Strategic Outreach, Aptitude Challenge, Industry Immersion, Launchpad Deployment.
- Bootcamp has tracks for primary/secondary school learners, undergraduates, and business owners/founders (Growth Hub).
- Reached 300+ learners, 15+ partner schools, 8+ industry partners, 20+ mentors.
- Operating partners include Hutsoft Technologies, Specterverse Gaming, and Muda International School.
- "NerdHaven" is a borderless digital academy (learning platform) currently in development — early access waitlist available on the website.
- Contact: email info@nextwave.com.ng, WhatsApp +2348066549337, X @nextwaveorg, Instagram @nextwaveafrica.

RULES:
- Answer questions about Nextwave's programs, mission, bootcamp, NerdHaven, partnerships, and how to get involved.
- Keep answers short and helpful (2-5 sentences where possible).
- If a question needs an answer you don't have, point the person to info@nextwave.com.ng or WhatsApp +2348066549337.
- Do not disclose or discuss the LLM provider or API details.
- Stay in English.`;

const fallback = (err: boolean) =>
  err
    ? "I hit a snag reaching the model. Please try again shortly, or contact us directly at info@nextwave.com.ng."
    : "The Nextwave assistant isn't configured yet. Please reach out via the contact form, WhatsApp +2348066549337, or info@nextwave.com.ng.";

export const askNextwave = createServerFn({ method: "POST" })
  .inputValidator((d: { history: ChatMessage[] }) => ({
    history: Array.isArray(d?.history) ? d.history.slice(-12) : [],
  }))
  .handler(async ({ data }) => {
    const key = process.env.GROQ_API_KEY;
    if (!key) return fallback(false);
    try {
      const { createOpenAI } = await import("@ai-sdk/openai");
      const { generateText } = await import("ai");
      const provider = createOpenAI({
        apiKey: key,
        baseURL: "https://api.groq.com/openai/v1",
      });
      const { text } = await generateText({
        model: provider("openai/gpt-oss-120b", { reasoningEffort: "low" }),
        system: SYSTEM_PROMPT,
        messages: data.history,
        maxOutputTokens: 600,
        temperature: 0.4,
      });
      return text;
    } catch {
      return fallback(true);
    }
  });
