import { MAX_ATTEMPTS } from "./config";
import { nextAttemptAt, shouldRetry } from "./retry";
import { renderTemplate } from "./templates";
import type { EmailType, RenderedEmail, TemplateData } from "./types";

export type EmailJob = {
  id: string;
  type: EmailType;
  recipient: string;
  schoolId: string | null;
  assessmentId: string | null;
  attempts: number;
  templateData: TemplateData;
};

export type SendResult = { ok: true; providerMessageId: string } | { ok: false; error: string };

export type QueueDeps = {
  listDue: (now: Date) => Promise<EmailJob[]>;
  send: (job: EmailJob, rendered: RenderedEmail) => Promise<SendResult>;
  markSent: (job: EmailJob, providerMessageId: string) => Promise<void>;
  scheduleRetry: (job: EmailJob, nextAt: Date, error: string) => Promise<void>;
  markFailed: (job: EmailJob, error: string) => Promise<void>;
  /** Called after the final failure is recorded: admin alert + mark contact undeliverable. */
  onFinalFailure: (job: EmailJob, error: string) => Promise<void>;
  now?: () => Date;
};

export type ProcessReport = {
  processed: number;
  sent: number;
  retried: number;
  failed: number;
};

export async function processQueue(deps: QueueDeps): Promise<ProcessReport> {
  const now = (deps.now ?? (() => new Date()))();
  const report: ProcessReport = { processed: 0, sent: 0, retried: 0, failed: 0 };

  const jobs = await deps.listDue(now);
  for (const job of jobs) {
    report.processed += 1;
    const rendered = renderTemplate(job.type, job.templateData);

    let result: SendResult;
    try {
      result = await deps.send(job, rendered);
    } catch (error) {
      result = { ok: false, error: error instanceof Error ? error.message : String(error) };
    }

    if (result.ok) {
      await deps.markSent(job, result.providerMessageId);
      report.sent += 1;
      continue;
    }

    const attempts = job.attempts + 1;
    if (shouldRetry(attempts, MAX_ATTEMPTS)) {
      await deps.scheduleRetry(job, nextAttemptAt(now, attempts), result.error);
      report.retried += 1;
    } else {
      await deps.markFailed(job, result.error);
      await deps.onFinalFailure(job, result.error);
      report.failed += 1;
    }
  }

  return report;
}

export async function dispatchEmail(job: EmailJob, send: QueueDeps["send"]): Promise<SendResult> {
  const rendered = renderTemplate(job.type, job.templateData);
  try {
    return await send(job, rendered);
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}
