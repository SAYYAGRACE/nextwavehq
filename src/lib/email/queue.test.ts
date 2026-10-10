import { describe, expect, it, vi } from "vitest";
import { processQueue, type EmailJob, type ProcessReport, type SendResult } from "./queue";

const NOW = new Date("2026-10-10T12:00:00.000Z");

function job(overrides: Partial<EmailJob> = {}): EmailJob {
  return {
    id: "job-1",
    type: "review_link_invitation",
    recipient: "head@school.example",
    schoolId: "school-1",
    assessmentId: "asmt-1",
    attempts: 0,
    templateData: { schoolName: "Sardauna Model Primary School", reviewUrl: "https://x/y" },
    ...overrides,
  };
}

function deps(overrides: Partial<Parameters<typeof processQueue>[0]> = {}) {
  const calls = {
    sent: [] as { id: string; providerMessageId: string }[],
    retried: [] as { id: string; nextAt: Date; error: string }[],
    failed: [] as { id: string; error: string }[],
    finalFailures: [] as { id: string; error: string }[],
    rendered: [] as string[],
  };
  const base = {
    listDue: async () => [job()],
    send: async (): Promise<SendResult> => ({ ok: true, providerMessageId: "msg_1" }),
    markSent: async (j: EmailJob, providerMessageId: string) => {
      calls.sent.push({ id: j.id, providerMessageId });
    },
    scheduleRetry: async (j: EmailJob, nextAt: Date, error: string) => {
      calls.retried.push({ id: j.id, nextAt, error });
    },
    markFailed: async (j: EmailJob, error: string) => {
      calls.failed.push({ id: j.id, error });
    },
    onFinalFailure: async (j: EmailJob, error: string) => {
      calls.finalFailures.push({ id: j.id, error });
    },
    now: () => NOW,
  };
  return { deps: { ...base, ...overrides }, calls };
}

describe("processQueue", () => {
  it("marks a successful send as sent", async () => {
    const { deps: d, calls } = deps();
    const report = await processQueue(d);
    expect(report).toEqual<ProcessReport>({ processed: 1, sent: 1, retried: 0, failed: 0 });
    expect(calls.sent).toEqual([{ id: "job-1", providerMessageId: "msg_1" }]);
    expect(calls.retried).toHaveLength(0);
    expect(calls.failed).toHaveLength(0);
  });

  it("renders the template before sending", async () => {
    let subject = "";
    const { deps: d } = deps({
      listDue: async () => [job({ type: "consent_request" })],
      send: async (_j, rendered) => {
        subject = rendered.subject;
        return { ok: true, providerMessageId: "m" };
      },
    });
    await processQueue(d);
    expect(subject).toContain("Sardauna Model Primary School");
  });

  it("schedules an exponential-backoff retry on failure", async () => {
    const { deps: d, calls } = deps({
      send: async () => ({ ok: false, error: "smtp timeout" }),
    });
    const report = await processQueue(d);
    expect(report).toEqual<ProcessReport>({ processed: 1, sent: 0, retried: 1, failed: 0 });
    expect(calls.retried).toHaveLength(1);
    expect(calls.retried[0].nextAt.getTime()).toBe(NOW.getTime() + 60_000);
    expect(calls.failed).toHaveLength(0);
  });

  it("treats a thrown send as a failure", async () => {
    const { deps: d, calls } = deps({
      send: async () => {
        throw new Error("network down");
      },
    });
    await processQueue(d);
    expect(calls.retried[0].error).toBe("network down");
  });

  it("retries with growing backoff across attempts", async () => {
    const { deps: d, calls } = deps({
      listDue: async () => [
        job({ id: "a", attempts: 0 }),
        job({ id: "b", attempts: 1 }),
        job({ id: "c", attempts: 2 }),
      ],
      send: async () => ({ ok: false, error: "boom" }),
    });
    await processQueue(d);
    const delays = calls.retried.map((r) => r.nextAt.getTime() - NOW.getTime());
    expect(delays).toEqual([60_000, 120_000, 240_000]);
  });

  it("gives up after the final attempt and raises a final-failure effect", async () => {
    const { deps: d, calls } = deps({
      listDue: async () => [job({ attempts: 4 })],
      send: async () => ({ ok: false, error: "mailbox unavailable" }),
    });
    const report = await processQueue(d);
    expect(report).toEqual<ProcessReport>({ processed: 1, sent: 0, retried: 0, failed: 1 });
    expect(calls.retried).toHaveLength(0);
    expect(calls.failed).toEqual([{ id: "job-1", error: "mailbox unavailable" }]);
    expect(calls.finalFailures).toEqual([{ id: "job-1", error: "mailbox unavailable" }]);
  });

  it("keeps processing other jobs when one final-fails", async () => {
    const sent = vi.fn();
    const { deps: d } = deps({
      listDue: async () => [job({ id: "bad", attempts: 4 }), job({ id: "good" })],
      send: async (j) =>
        j.id === "bad" ? { ok: false, error: "x" } : { ok: true, providerMessageId: "m" },
      markSent: async (j) => sent(j.id),
    });
    const report = await processQueue(d);
    expect(report).toEqual<ProcessReport>({ processed: 2, sent: 1, retried: 0, failed: 1 });
    expect(sent).toHaveBeenCalledWith("good");
  });
});
