import { describe, expect, it } from "vitest";
import { FROM, REPLY_TO, assertDeliverableAddress, isDeliverableAddress } from "./config";
import { EMAIL_TYPES, renderTemplate } from "./templates";

const DATA = {
  schoolName: "Sardauna Model Primary School",
  contactName: "Amina",
  reviewUrl: "https://nextwave.com.ng/review/tok_123",
  profileUrl: "https://nextwave.com.ng/readiness/sardauna-model-primary",
  adminUrl: "https://nextwave.com.ng/admin/emails",
  deadline: "20 October 2026",
  daysRemaining: 2,
  assessmentTitle: "Sardauna Model Primary School — 2026 assessment",
  assessorName: "Musa",
  submittedBy: "Musa (assessor)",
  correctionMessage: "We now have a second computer lab.",
  senderEmail: "head@sardauna.example",
  lga: "Zaria",
};

describe("renderTemplate", () => {
  it("renders every known email type", () => {
    for (const type of EMAIL_TYPES) {
      const email = renderTemplate(type, DATA);
      expect(email.subject.length).toBeGreaterThan(0);
      expect(email.text.length).toBeGreaterThan(0);
      expect(email.html).toContain("<!doctype html>");
    }
  });

  it("throws on an unknown type", () => {
    expect(() => renderTemplate("nope" as never, DATA)).toThrow();
  });

  it("includes a visible fallback link alongside the CTA button", () => {
    const email = renderTemplate("review_link_invitation", DATA);
    const url = DATA.reviewUrl;
    const occurrences = email.html.split(`href="${url}"`).length - 1;
    expect(occurrences).toBe(2);
    expect(email.html).toContain("If the button does not work");
    expect(email.text).toContain(url);
  });

  it("uses exactly one CTA button", () => {
    const email = renderTemplate("consent_request", DATA);
    const buttons = email.html.split("border-radius:9999px").length - 1;
    expect(buttons).toBe(1);
  });

  it("always offers a monitored reply-to and never a no-reply address", () => {
    for (const type of EMAIL_TYPES) {
      const email = renderTemplate(type, DATA);
      expect(email.html).toContain(`mailto:${REPLY_TO}`);
      expect(email.html.toLowerCase()).not.toContain("no-reply");
      expect(email.text.toLowerCase()).not.toContain("no-reply");
    }
  });

  it("addresses the contact by name when provided", () => {
    const email = renderTemplate("consent_request", DATA);
    expect(email.text).toContain("Hello Amina,");
    expect(email.subject).toContain(DATA.schoolName);
  });

  it("degrades gracefully when data is missing", () => {
    const email = renderTemplate("reminder_day12", {});
    expect(email.subject).toContain("your school");
    expect(email.text).not.toContain("undefined");
    expect(email.html).not.toContain("undefined");
  });
});

describe("address policy", () => {
  it("accepts monitored addresses", () => {
    expect(isDeliverableAddress(FROM)).toBe(true);
    expect(isDeliverableAddress(REPLY_TO)).toBe(true);
    expect(isDeliverableAddress("Nextwave <ntri@nextwave.com.ng>")).toBe(true);
  });

  it("rejects no-reply addresses", () => {
    expect(isDeliverableAddress("no-reply@nextwave.com.ng")).toBe(false);
    expect(isDeliverableAddress("noreply@nextwave.com.ng")).toBe(false);
    expect(() => assertDeliverableAddress("no-reply@nextwave.com.ng", "from")).toThrow();
  });

  it("rejects malformed addresses", () => {
    expect(isDeliverableAddress("not-an-email")).toBe(false);
  });
});
