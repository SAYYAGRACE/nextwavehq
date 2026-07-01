import { serve } from "https://deno.land/std@0.170.0/http/server.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY") ?? "";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://nextwavehq.vercel.app";

interface Payload {
  type: "contact" | "approved" | "rejected";
  to: string;
  name?: string;
  email?: string;
  message?: string;
  intent?: string;
}

interface SendGridBody {
  personalizations: Array<{ to: Array<{ email: string }> }>;
  from: { email: string; name: string };
  reply_to?: { email: string };
  subject: string;
  content: Array<{ type: string; value: string }>;
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const payload: Payload = await req.json();
    const isContact = payload.type === "contact";

    const subject = isContact
      ? `[Nextwave] New Contact \u2014 ${payload.intent ?? "General"}`
      : `Welcome to NerdHaven \u2014 You're In!`;

    const html = isContact
      ? `<h2>New Contact Submission</h2><p><strong>Name:</strong> ${payload.name}</p><p><strong>Email:</strong> ${payload.email}</p><p><strong>Intent:</strong> ${payload.intent}</p><p><strong>Message:</strong></p><blockquote>${payload.message}</blockquote>`
      : `<h2>Welcome to NerdHaven!</h2><p>Hi ${payload.name || "there"},</p><p>Great news \u2014 you've been accepted into the <strong>NerdHaven Digital Academy</strong>!</p><p>You now have full access to our platform. Sign in to get started:</p><p><a href="${SITE_URL}/auth" style="display:inline-block;padding:12px 24px;background:#6d28d9;color:white;border-radius:9999px;text-decoration:none;">Access NerdHaven \u2192</a></p><p>We're excited to have you on board.</p><p>\u2014 The Nextwave Team</p>`;

    const body: SendGridBody = {
      personalizations: [{
        to: [{ email: isContact ? "nextwavehq@outlook.com" : payload.to }],
      }],
      from: { email: "nextwavehq@outlook.com", name: "Nextwave" },
      subject,
      content: [{ type: "text/html", value: html }],
    };

    if (isContact && payload.email) {
      body.reply_to = { email: payload.email };
    }

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("SendGrid error:", err);
      return new Response(JSON.stringify({ error: err }), { status: 500 });
    }

    console.log("Email sent via SendGrid");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error("send-email error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
