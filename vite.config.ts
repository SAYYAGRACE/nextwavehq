import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

async function generateReadinessOg(): Promise<void> {
  const root = process.cwd();
  const { getPublishedRecords } = await import(resolve(root, "src/lib/readiness/store.ts"));
  const { renderOgPng } = await import(resolve(root, "src/lib/readiness/og-image.ts"));
  const outDir = resolve(root, "public/og");
  await mkdir(outDir, { recursive: true });
  const records = getPublishedRecords() as Array<{
    school: { slug: string; name: string; lga: string; level: string; type: string };
    assessment: { totalScore: number | null; tier: string | null };
  }>;
  await Promise.all(
    records.map(async (record) => {
      const png = await renderOgPng({
        eyebrow: "School Tech Readiness Index",
        title: record.school.name,
        subtitle: `${record.school.lga} LGA · ${record.school.level} · ${record.school.type}`,
        score:
          record.assessment.totalScore != null ? Math.round(record.assessment.totalScore) : null,
        tier: record.assessment.tier ?? null,
        footer: "nextwave.com.ng/readiness",
      });
      await writeFile(resolve(outDir, `${record.school.slug}.png`), png);
    }),
  );
}

function readinessOgPlugin() {
  return {
    name: "nextwave-readiness-og",
    apply: "build" as const,
    async buildStart(this: { warn: (msg: string) => void }) {
      try {
        await generateReadinessOg();
      } catch (error) {
        this.warn(
          `Readiness OG generation skipped (committed images will be used): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    },
  };
}

export default defineConfig({
  // Force-enable Nitro so the Lovable plugin applies the server build
  nitro: true,
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
  plugins: [readinessOgPlugin()],
});
