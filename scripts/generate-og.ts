import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getPublishedRecords } from "../src/lib/readiness/store";
import { renderOgPng, type OgCard } from "../src/lib/readiness/og-image";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "../public/og");

await mkdir(outDir, { recursive: true });

const records = getPublishedRecords();
for (const record of records) {
  const card: OgCard = {
    eyebrow: "School Tech Readiness Index",
    title: record.school.name,
    subtitle: `${record.school.lga} LGA · ${record.school.level} · ${record.school.type}`,
    score: record.assessment.totalScore != null ? Math.round(record.assessment.totalScore) : null,
    tier: record.assessment.tier ?? null,
    footer: "nextwave.com.ng/readiness",
  };
  const png = await renderOgPng(card);
  const file = resolve(outDir, `${record.school.slug}.png`);
  await writeFile(file, png);
  console.log(`og image: ${record.school.slug}.png (${png.byteLength} bytes)`);
}

console.log(`Generated ${records.length} readiness OG images into public/og/`);
