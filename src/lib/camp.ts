/**
 * Coding Camp configuration — every camp constant lives here so the pages,
 * server endpoints, emails and legal copy all stay in sync.
 *
 * IMPORTANT: this file must never contain secrets (no Paystack keys, no
 * service-role keys). It is imported by client code.
 */

export type AgeGroupKey = "explorer" | "builder";

export type RefundPolicy = {
  /** Refund is available if requested at least this many days before start. */
  minDaysBeforeStart: number;
  /** Refunds are paid to the original payer within this many days. */
  payoutDays: number;
  fullRefundIfCancelled: boolean;
  summary: string;
  body: string[];
};

export const CAMP = {
  name: "Nextwave Online Coding Camp",
  tagline: "Live online coding classes for kids and teens.",
  mode: "Online",
  format: "Live online",
  audience: "For kids and teens",
  location: "Live online",
  startDate: "2026-11-27",
  endDate: "2027-01-08",
  startDateLabel: "27 November 2026",
  endDateLabel: "8 January 2027",
  dateRangeLabel: "27 November 2026 – 8 January 2027",

  currency: "NGN",
  feeNaira: 12_000,
  /** 1,200,000 kobo — the value Paystack expects. */
  feeKobo: 1_200_000,
  feeLabel: "₦12,000",

  /** Promo wording for the registration fee. */
  feeNote: "Promo registration fee",

  /** Class schedule is not finalised — this exact sentence is shown instead of times. */
  classScheduleNote: "Class days and times are confirmed after registration.",

  /** Seat cap. Set to a number to start showing "N seats left"; null hides it. */
  seatCap: null as number | null,

  /** Cohort WhatsApp group. null = button hidden until set. */
  cohortWhatsappUrl: null as string | null,

  whatsapp: {
    display: "0813 324 6660",
    label: "Coding Camp WhatsApp",
    e164: "+2348133246660",
    digits: "2348133246660",
    link: "https://wa.me/2348133246660",
  },

  /** Prefilled text for the floating "Chat on WhatsApp" button. */
  chatPrefillText: "Hello, I'd like to know about the Nextwave Coding Camp",

  bank: {
    bank: "Moniepoint",
    accountName: "NEXTWAVE INFOTECH",
    accountNumber: "3005239612",
  },

  refundPolicy: {
    minDaysBeforeStart: 7,
    payoutDays: 14,
    fullRefundIfCancelled: true,
    summary:
      "Full refund if you request it at least 7 days before 27 November 2026. No refund once the camp starts, except when Nextwave cancels a camp or cohort.",
    body: [
      "If you cancel a registration at least 7 days before the camp start date (27 November 2026), you are entitled to a full refund of the registration fee.",
      "Once the camp has started, registration fees are non-refundable — with one exception: if Nextwave cancels the camp or a specific cohort, every affected family is refunded in full.",
      "Refunds are paid to the account or method that originally paid, within 14 days of the refund being agreed.",
    ],
  } satisfies RefundPolicy,

  /**
   * Age groups. Ages are inclusive. `ageGroupForAge` derives the group from a
   * child's age so the form never has to ask twice.
   */
  ageGroups: [
    { key: "explorer" as AgeGroupKey, label: "Explorers (7–11)", min: 7, max: 11 },
    { key: "builder" as AgeGroupKey, label: "Builders (12–17)", min: 12, max: 17 },
  ],

  /** Sponsorship seat options shown as chips (plus a custom input). */
  sponsorSeatOptions: [1, 2, 5] as const,
} as const;

export type CampAgeGroup = (typeof CAMP.ageGroups)[number];

export function ageGroupForAge(age: number): CampAgeGroup | null {
  return CAMP.ageGroups.find((g) => age >= g.min && age <= g.max) ?? null;
}

/** Human-readable WhatsApp deep link with a prefilled message. */
export function whatsappLink(text?: string): string {
  const base = CAMP.whatsapp.link;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function naira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export const CAMP_PATH = "/camp";
export const CAMP_URL = "https://nextwave.com.ng/camp";
export const CAMP_OG_IMAGE = "https://nextwave.com.ng/og/camp.png";
