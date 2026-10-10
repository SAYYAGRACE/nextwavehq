export type EmailType =
  | "consent_request"
  | "review_link_invitation"
  | "reminder_day7"
  | "reminder_day12"
  | "published_notice"
  | "correction_received_admin"
  | "correction_received_sender"
  | "assessor_invite"
  | "admin_assessment_submitted"
  | "admin_deadline_approaching";

export type EmailStatus = "queued" | "sent" | "delivered" | "bounced" | "complained" | "failed";

export type ReviewEventType =
  | "opened"
  | "consented"
  | "declined"
  | "correction_submitted"
  | "assessment_submitted";

export type TemplateData = {
  schoolName?: string;
  contactName?: string;
  lga?: string;
  reviewUrl?: string;
  profileUrl?: string;
  adminUrl?: string;
  deadline?: string;
  daysRemaining?: number;
  assessmentTitle?: string;
  assessorName?: string;
  submittedBy?: string;
  correctionMessage?: string;
  senderEmail?: string;
};

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

export type EmailLogRow = {
  id: string;
  type: EmailType;
  recipient: string;
  school_id: string | null;
  assessment_id: string | null;
  status: EmailStatus;
  provider_message_id: string | null;
  error: string | null;
  attempts: number;
  next_attempt_at: string | null;
  last_attempt_at: string | null;
  template_data: TemplateData;
  created_at: string;
};

export type SchoolContact = {
  id: string;
  school_id: string;
  name: string | null;
  email: string | null;
  whatsapp_e164: string | null;
  sms_e164: string | null;
  is_primary: boolean;
  created_at: string;
};
