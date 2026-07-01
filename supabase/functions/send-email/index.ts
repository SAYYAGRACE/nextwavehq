import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";

interface Payload {
  type: "contact" | "approved" | "rejected";
  to: string;
  name?: string;
  email?: string;
  message?: string;
  intent?: string;
}

async function sendViaResend(payload: Payload) {
  const isContact = payload.type === "contact";
  const subject = isContact
    ? `[Nextwave] New Contact — ${payload.intent ?? "General"}`
    : `Welcome to NerdHaven — You're In!`;
  const html = isContact
    ? `
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Intent:</strong> ${payload.intent}</p>
      <p><strong>Message:</strong></p>
      <blockquote>${payload.message}</blockquote>
    `
    : `
      <h2>Welcome to NerdHaven!</h2>
      <p>Hi ${payload.name || "there"},</p>
      <p>Great news — you've been accepted into the <strong>NerdHaven Digital Academy</strong>!</p>
      <p>You now have full access to our platform. Sign in to get started:</p>
      <p><a href="${Deno.env.get("SITE_URL") ?? "https://nextwavehq.vercel.app"}/auth" style="display:inline-block;padding:12px 24px;background:#6d28d9;color:white;border-radius:9999px;text-decoration:none;">Access NerdHaven →</a></p>
      <p>We're excited to have you on board.</p>
      <p>— The Nextwave Team</p>
    `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Nextwave <nextwavehq@outlook.com>",
      to: isContact ? "nextwavehq@outlook.com" : payload.to,
      reply_to: isContact ? payload.email : undefined,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return new Response(JSON.stringify({ error: err }), { status: 500 });
  }

  const data = await res.json();
  console.log("Email sent:", data);
  return new Response(JSON.stringify({ ok: true, id: data.id }), { status: 200 });
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const payload: Payload = await req.json();
    return await sendViaResend(payload);
  } catch (e) {
    console.error("send-email error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
