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

async function generateCampOg(): Promise<void> {
  const root = process.cwd();
  const { renderOgPng } = await import(resolve(root, "src/lib/readiness/og-image.ts"));
  const { CAMP } = await import(resolve(root, "src/lib/camp.ts"));
  const outDir = resolve(root, "public/og");
  await mkdir(outDir, { recursive: true });
  const png = await renderOgPng({
    eyebrow: "Online Coding Camp",
    title: "Nextwave Coding Camp",
    subtitle: `${CAMP.dateRangeLabel} · Ages 7–17 · ${CAMP.feeLabel}`,
    footer: "nextwave.com.ng/camp",
  });
  await writeFile(resolve(outDir, "camp.png"), png);
}

const SITE_ORIGIN = "https://nextwave.com.ng";

const STATIC_SITEMAP_ROUTES: Array<{ path: string; priority: string }> = [
  { path: "/", priority: "1.0" },
  { path: "/camp", priority: "0.95" },
  { path: "/about", priority: "0.9" },
  { path: "/projects", priority: "0.9" },
  { path: "/team", priority: "0.8" },
  { path: "/news", priority: "0.7" },
  { path: "/readiness", priority: "0.9" },
  { path: "/readiness/methodology", priority: "0.6" },
  { path: "/contact", priority: "0.8" },
  { path: "/privacy", priority: "0.3" },
  { path: "/terms", priority: "0.3" },
];

function sitemapUrl(loc: string, lastmod: string, priority: string): string {
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`;
}

async function generateSitemap(): Promise<void> {
  const root = process.cwd();
  const today = new Date().toISOString().slice(0, 10);

  const { getPublishedRecords } = await import(resolve(root, "src/lib/readiness/store.ts"));
  const records = getPublishedRecords() as Array<{
    school: { slug: string };
    assessment: { assessmentDate: string };
  }>;

  let newsUrls: Array<{ loc: string; lastmod: string }> = [];
  try {
    const { fetchArticles } = await import(resolve(root, "src/lib/cms.ts"));
    const articles = await fetchArticles();
    newsUrls = articles
      .filter((a) => a.slug)
      .map((a) => ({
        loc: `${SITE_ORIGIN}/news/${a.slug}`,
        lastmod: (a.publishedAt ?? "").slice(0, 10) || today,
      }));
  } catch {
    const { LOCAL_ARTICLES } = await import(resolve(root, "src/lib/news-local.ts"));
    newsUrls = LOCAL_ARTICLES.map((a) => ({
      loc: `${SITE_ORIGIN}/news/${a.slug}`,
      lastmod: (a.publishedAt ?? "").slice(0, 10) || today,
    }));
  }

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...STATIC_SITEMAP_ROUTES.map((r) => sitemapUrl(`${SITE_ORIGIN}${r.path}`, today, r.priority)),
    ...records.map((r) =>
      sitemapUrl(
        `${SITE_ORIGIN}/readiness/${r.school.slug}`,
        (r.assessment.assessmentDate ?? "").slice(0, 10) || today,
        "0.5",
      ),
    ),
    ...newsUrls.map((n) => sitemapUrl(n.loc, n.lastmod, "0.6")),
    "</urlset>",
    "",
  ];

  await writeFile(resolve(root, "public/sitemap.xml"), lines.join("\n"));
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
      try {
        await generateCampOg();
      } catch (error) {
        this.warn(
          `Camp OG generation skipped (committed image will be used): ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      try {
        await generateSitemap();
      } catch (error) {
        this.warn(
          `Sitemap generation skipped (committed sitemap will be used): ${
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
