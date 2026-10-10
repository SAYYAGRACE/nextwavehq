import { ADMIN_URL, REPLY_TO, SITE_URL } from "./config";
import type { EmailType, RenderedEmail, TemplateData } from "./types";

const SCHOOL_FALLBACK = "your school";

function school(data: TemplateData): string {
  return data.schoolName?.trim() || SCHOOL_FALLBACK;
}

function greeting(data: TemplateData): string {
  return data.contactName?.trim() ? `Hello ${data.contactName.trim()},` : "Hello,";
}

function button(label: string, url: string): string {
  return `<p style="margin:24px 0"><a href="${url}" style="background:#7c3aed;color:#ffffff;padding:12px 22px;border-radius:9999px;text-decoration:none;display:inline-block;font-weight:600">${label}</a></p>`;
}

function fallback(url: string): string {
  return `<p style="font-size:12px;color:#666666;margin-top:8px">If the button does not work, copy and paste this link into your browser:<br><a href="${url}" style="color:#7c3aed">${url}</a></p>`;
}

function wrap(paragraphs: string[], ctaLabel: string | null, url: string | null): string {
  const cta = ctaLabel && url ? `${button(ctaLabel, url)}${fallback(url)}` : "";
  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111111;max-width:560px;margin:0 auto;padding:24px;line-height:1.6">
${paragraphs.join("\n")}
${cta}
<hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0" />
<p style="font-size:12px;color:#666666">Nextwave Infotech &middot; Kaduna, Nigeria<br />
Reply to this email or write to <a href="mailto:${REPLY_TO}" style="color:#7c3aed">${REPLY_TO}</a> and a person will respond.</p>
</body></html>`;
}

function p(text: string): string {
  return `<p>${text}</p>`;
}

type Renderer = (data: TemplateData) => RenderedEmail;

const REVIEW_URL_FALLBACK = `${SITE_URL}/readiness`;

const renderers: Record<EmailType, Renderer> = {
  consent_request: (data) => {
    const name = school(data);
    const url = data.reviewUrl || REVIEW_URL_FALLBACK;
    const text = [
      greeting(data),
      "",
      `Nextwave Infotech is compiling the Nextwave School Tech Readiness Index (NTRI) — an independent picture of technology readiness across schools in Northern Nigeria. We would like to include ${name}.`,
      "",
      "We look at power, devices and labs, connectivity, curriculum and teachers, student capability, and leadership. We never collect student names or individual student results, and no school is ranked or publicly shamed.",
      "",
      `We are asking for your permission to assess ${name} and, if you choose, to publish its readiness profile. Consent is optional and you can withdraw at any time.`,
      "",
      "Review the details and give consent here:",
      url,
      "",
      "With thanks,",
      "The Nextwave Readiness team",
    ].join("\n");
    return {
      subject: `Consent to assess ${name} for the School Tech Readiness Index`,
      text,
      html: wrap(
        [
          p(greeting(data)),
          p(
            `Nextwave Infotech is compiling the <strong>Nextwave School Tech Readiness Index (NTRI)</strong> — an independent picture of technology readiness across schools in Northern Nigeria. We would like to include ${name}.`,
          ),
          p(
            "We look at power, devices and labs, connectivity, curriculum and teachers, student capability, and leadership. We never collect student names or individual student results, and no school is ranked or publicly shamed.",
          ),
          p(
            `We are asking for your permission to assess ${name} and, if you choose, to publish its readiness profile. Consent is optional and you can withdraw at any time.`,
          ),
        ],
        "Review and give consent",
        url,
      ),
    };
  },

  review_link_invitation: (data) => {
    const name = school(data);
    const url = data.reviewUrl || REVIEW_URL_FALLBACK;
    const deadline = data.deadline
      ? `Please do this by ${data.deadline}.`
      : "Please review it at your earliest convenience.";
    const text = [
      greeting(data),
      "",
      `${name}'s tech readiness assessment is complete and ready for your review before anything is published.`,
      "",
      "The link below is unique to your school, works only once, and needs no password. You can confirm the findings, add context, or ask us to correct something.",
      "",
      deadline,
      "",
      "Open your review link:",
      url,
      "",
      "Kind regards,",
      "The Nextwave Readiness team",
    ].join("\n");
    return {
      subject: `Please review ${name}'s readiness assessment`,
      text,
      html: wrap(
        [
          p(greeting(data)),
          p(
            `${name}'s tech readiness assessment is complete and ready for your review before anything is published.`,
          ),
          p(
            "The link below is unique to your school, works only once, and needs no password. You can confirm the findings, add context, or ask us to correct something.",
          ),
          p(deadline),
        ],
        "Open the review link",
        url,
      ),
    };
  },

  reminder_day7: (data) => {
    const name = school(data);
    const url = data.reviewUrl || REVIEW_URL_FALLBACK;
    const text = [
      greeting(data),
      "",
      `A friendly reminder that ${name}'s readiness review window is still open. Nothing is published until you have had the chance to respond.`,
      "",
      data.deadline ? `The review closes on ${data.deadline}.` : "The review closes soon.",
      "",
      "Open your review link:",
      url,
      "",
      "Kind regards,",
      "The Nextwave Readiness team",
    ].join("\n");
    return {
      subject: `Reminder: ${name}'s review window is open`,
      text,
      html: wrap(
        [
          p(greeting(data)),
          p(
            `A friendly reminder that ${name}'s readiness review window is still open. Nothing is published until you have had the chance to respond.`,
          ),
          p(data.deadline ? `The review closes on ${data.deadline}.` : "The review closes soon."),
        ],
        "Open the review link",
        url,
      ),
    };
  },

  reminder_day12: (data) => {
    const name = school(data);
    const url = data.reviewUrl || REVIEW_URL_FALLBACK;
    const remaining = typeof data.daysRemaining === "number" ? data.daysRemaining : 2;
    const text = [
      greeting(data),
      "",
      `This is a final reminder: ${name}'s readiness review closes in about ${remaining} day${remaining === 1 ? "" : "s"}.`,
      "",
      "If we do not hear from you by the deadline, we will hold the profile back from publication until you are ready.",
      "",
      data.deadline ? `The review closes on ${data.deadline}.` : "",
      "",
      "Open your review link:",
      url,
      "",
      "Kind regards,",
      "The Nextwave Readiness team",
    ]
      .filter((line) => line !== "")
      .join("\n");
    return {
      subject: `Final reminder: ${name}'s review closes in ${remaining} day${remaining === 1 ? "" : "s"}`,
      text,
      html: wrap(
        [
          p(greeting(data)),
          p(
            `This is a final reminder: ${name}'s readiness review closes in about ${remaining} day${remaining === 1 ? "" : "s"}.`,
          ),
          p(
            "If we do not hear from you by the deadline, we will hold the profile back from publication until you are ready.",
          ),
          data.deadline ? p(`The review closes on ${data.deadline}.`) : "",
        ].filter(Boolean),
        "Open the review link",
        url,
      ),
    };
  },

  published_notice: (data) => {
    const name = school(data);
    const url = data.profileUrl || REVIEW_URL_FALLBACK;
    const text = [
      greeting(data),
      "",
      `Thank you — ${name}'s tech readiness profile is now published on the Nextwave School Tech Readiness Index.`,
      "",
      "You can view it here at any time, and you can ask us to correct or update it whenever something changes:",
      url,
      "",
      "With thanks,",
      "The Nextwave Readiness team",
    ].join("\n");
    return {
      subject: `${name}'s readiness profile is now published`,
      text,
      html: wrap(
        [
          p(greeting(data)),
          p(
            `Thank you — ${name}'s tech readiness profile is now published on the Nextwave School Tech Readiness Index.`,
          ),
          p(
            "You can view it here at any time, and you can ask us to correct or update it whenever something changes.",
          ),
        ],
        "View the profile",
        url,
      ),
    };
  },

  correction_received_admin: (data) => {
    const name = school(data);
    const url = data.adminUrl || ADMIN_URL;
    const who = data.senderEmail?.trim() || "a school contact";
    const text = [
      "A correction was submitted through the readiness review link.",
      "",
      `School: ${name}`,
      `From: ${who}`,
      data.correctionMessage ? `Message: ${data.correctionMessage}` : "",
      "",
      "Open the correction queue:",
      url,
    ]
      .filter((line) => line !== "")
      .join("\n");
    return {
      subject: `[NTRI] Correction received from ${who}`,
      text,
      html: wrap(
        [
          p("A correction was submitted through the readiness review link."),
          p(`<strong>School:</strong> ${name}`),
          p(`<strong>From:</strong> ${who}`),
          data.correctionMessage ? p(`<strong>Message:</strong> ${data.correctionMessage}`) : "",
        ].filter(Boolean),
        "Open the correction queue",
        url,
      ),
    };
  },

  correction_received_sender: (data) => {
    const name = school(data);
    const url = data.profileUrl || REVIEW_URL_FALLBACK;
    const text = [
      greeting(data),
      "",
      `Thank you for getting in touch about ${name}'s readiness profile. We have received your correction and a person on our team will look at it.`,
      "",
      data.correctionMessage ? `What you told us: "${data.correctionMessage}"` : "",
      "",
      "We will let you know once it has been reviewed. In the meantime you can revisit the profile here:",
      url,
      "",
      "Kind regards,",
      "The Nextwave Readiness team",
    ]
      .filter((line) => line !== "")
      .join("\n");
    return {
      subject: `We received your correction about ${name}`,
      text,
      html: wrap(
        [
          p(greeting(data)),
          p(
            `Thank you for getting in touch about ${name}'s readiness profile. We have received your correction and a person on our team will look at it.`,
          ),
          data.correctionMessage
            ? p(`<strong>What you told us:</strong> ${data.correctionMessage}`)
            : "",
          p("We will let you know once it has been reviewed."),
        ].filter(Boolean),
        "Revisit the profile",
        url,
      ),
    };
  },

  assessor_invite: (data) => {
    const url = data.adminUrl || ADMIN_URL;
    const who = data.assessorName?.trim();
    const text = [
      who ? `Hello ${who},` : "Hello,",
      "",
      "You have been invited to act as an assessor for the Nextwave School Tech Readiness Index (NTRI).",
      "",
      "Assessors visit schools, record evidence for each indicator, and submit assessments for review. Training and the rubric are provided. Every assessment is reviewed by a second assessor before anything is published.",
      "",
      "Accept your invitation by signing in here:",
      url,
      "",
      "Kind regards,",
      "The Nextwave Readiness team",
    ].join("\n");
    return {
      subject: "You're invited to assess schools for the NTRI",
      text,
      html: wrap(
        [
          p(who ? `Hello ${who},` : "Hello,"),
          p(
            "You have been invited to act as an assessor for the Nextwave School Tech Readiness Index (NTRI).",
          ),
          p(
            "Assessors visit schools, record evidence for each indicator, and submit assessments for review. Training and the rubric are provided. Every assessment is reviewed by a second assessor before anything is published.",
          ),
        ],
        "Accept your invitation",
        url,
      ),
    };
  },

  admin_assessment_submitted: (data) => {
    const url = data.adminUrl || ADMIN_URL;
    const title = data.assessmentTitle?.trim() || school(data);
    const by = data.submittedBy?.trim() || "an assessor";
    const text = [
      "An assessment has just been submitted for review.",
      "",
      `Assessment: ${title}`,
      `Submitted by: ${by}`,
      data.lga ? `LGA: ${data.lga}` : "",
      "",
      "Review it in the admin console:",
      url,
    ]
      .filter((line) => line !== "")
      .join("\n");
    return {
      subject: `[NTRI] Assessment submitted: ${title}`,
      text,
      html: wrap(
        [
          p("An assessment has just been submitted for review."),
          p(`<strong>Assessment:</strong> ${title}`),
          p(`<strong>Submitted by:</strong> ${by}`),
          data.lga ? p(`<strong>LGA:</strong> ${data.lga}`) : "",
        ].filter(Boolean),
        "Open the admin console",
        url,
      ),
    };
  },

  admin_deadline_approaching: (data) => {
    const url = data.adminUrl || ADMIN_URL;
    const title = data.assessmentTitle?.trim() || school(data);
    const days = typeof data.daysRemaining === "number" ? data.daysRemaining : 2;
    const text = [
      "A school review deadline is approaching.",
      "",
      `Assessment: ${title}`,
      data.deadline
        ? `Review deadline: ${data.deadline}`
        : `Time remaining: about ${days} day${days === 1 ? "" : "s"}`,
      "",
      "Follow up in the admin console:",
      url,
    ].join("\n");
    return {
      subject: `[NTRI] Review deadline approaching: ${title}`,
      text,
      html: wrap(
        [
          p("A school review deadline is approaching."),
          p(`<strong>Assessment:</strong> ${title}`),
          p(
            data.deadline
              ? `Review deadline: ${data.deadline}`
              : `Time remaining: about ${days} day${days === 1 ? "" : "s"}`,
          ),
        ],
        "Open the admin console",
        url,
      ),
    };
  },
};

export const EMAIL_TYPES = Object.keys(renderers) as EmailType[];

export function renderTemplate(type: EmailType, data: TemplateData = {}): RenderedEmail {
  const renderer = renderers[type];
  if (!renderer) throw new Error(`Unknown email type: ${type}`);
  return renderer(data);
}
