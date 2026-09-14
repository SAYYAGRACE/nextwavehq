/**
 * Email Configuration for Nextwave Form Submissions
 * All form submissions (contact, waitlist, newsletter) are sent to this email
 */

export const NEXTWAVE_EMAIL = "info@nextwave.com.ng";

export const emailConfig = {
  // Main operations email - receives all form submissions
  operations: NEXTWAVE_EMAIL,

  // Email templates/subjects for different forms
  templates: {
    contact: {
      subject: "[Nextwave] New Contact Form Submission",
      recipient: NEXTWAVE_EMAIL,
    },
    waitlist: {
      subject: "[Nextwave] New Waitlist Signup",
      recipient: NEXTWAVE_EMAIL,
    },
    newsletter: {
      subject: "[Nextwave] Newsletter Signup",
      recipient: NEXTWAVE_EMAIL,
    },
  },
};

/**
 * NOTE: Email sending is configured via Supabase:
 * - Set up a Supabase Edge Function or webhook to send emails when records are inserted
 * - Or configure an external email service (SendGrid, Mailgun, Resend, Postmark, etc.)
 * - Emails should be sent to: info@nextwave.com.ng
 *
 * Example: When a contact_submissions row is inserted, send an email to info@nextwave.com.ng
 * with the contact details (name, email, organization, message, intent)
 */
