import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { jsPDF } from "jspdf";
import type { NewsArticle } from "../src/lib/cms";
import { LOCAL_ARTICLES, ARTICLE_CONTENT, ARTICLE_BYLINE, type Item } from "../src/lib/news-local";

const PURPLE: [number, number, number] = [124, 92, 240];
const INK: [number, number, number] = [28, 28, 38];
const MUTED: [number, number, number] = [112, 112, 130];

// jspdf standard fonts are WinAnsi — normalize typographic glyphs to ASCII.
function ascii(s: string): string {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u2010-\u2015]/g, "-");
}

/** Turn **bold** and [text](url) into displayable plain text. */
function strip(t: string): string {
  return ascii(t.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)"));
}

function buildPdf(article: NewsArticle, content: Item[]): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 56;
  const maxW = pageW - M * 2;
  let y = M;
  let pageNo = 1;

  const addChrome = () => {
    // Top brand rule
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, pageW, 6, "F");
    // Header label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("NEXTWAVE INFOTECH  ·  NEWS & UPDATES", M, 40);
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text("nextwave.com.ng", M, pageH - 30);
    doc.text(`Page ${pageNo}`, pageW - M, pageH - 30, { align: "right" });
  };

  const newPage = () => {
    addChrome();
    doc.addPage();
    pageNo += 1;
    y = M + 20;
  };

  const ensure = (space: number) => {
    if (y + space > pageH - M - 10) newPage();
  };

  // ---- Title block ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(...INK);
  const titleLines = doc.splitTextToSize(strip(article.title), maxW);
  const titleH = titleLines.length * 24;
  ensure(titleH + 40);
  doc.text(titleLines, M, y + 14);
  y += titleH + 6;

  // Byline + date
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  const dateStr = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
  doc.text(`${ARTICLE_BYLINE}  ·  ${dateStr}`, M, y + 10);
  y += 30;

  // Divider
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(1);
  doc.line(M, y, pageW - M, y);
  y += 24;

  // ---- Body ----
  const writePara = (
    text: string,
    opts?: { bold?: boolean; indent?: number; size?: number; color?: [number, number, number] },
  ) => {
    const size = opts?.size ?? 11;
    const indent = opts?.indent ?? 0;
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...(opts?.color ?? INK));
    const lines = doc.splitTextToSize(strip(text), maxW - indent);
    const lineH = size * 1.5;
    ensure(lines.length * lineH + 8);
    doc.text(lines, M + indent, y + size);
    y += lines.length * lineH + 6;
  };

  for (const item of content) {
    if (item.k === "h2") {
      ensure(46);
      y += 10;
      writePara(item.t, { bold: true, size: 14, color: PURPLE });
      y += 2;
    } else if (item.k === "h3") {
      ensure(34);
      y += 6;
      writePara(item.t, { bold: true, size: 12, color: INK });
      y += 2;
    } else if (item.k === "p") {
      writePara(item.t);
    } else if (item.k === "quote") {
      writePara(item.t, { indent: 14, size: 11, color: MUTED });
      y += 4;
    } else if (item.k === "ul" || item.k === "ol") {
      item.items.forEach((txt, i) => {
        const bullet = item.k === "ol" ? `${i + 1}. ` : "\u2022 ";
        writePara(bullet + txt, { indent: 14 });
      });
      y += 4;
    } else if (item.k === "stat") {
      item.rows.forEach(([label, value]) => {
        writePara(`\u2022 ${label}: ${value}`, { indent: 14 });
      });
      y += 4;
    } else if (item.k === "code") {
      const size = 7;
      for (const ln of item.t.split("\n")) {
        ensure(size * 1.35 + 4);
        doc.setFont("courier", "normal");
        doc.setFontSize(size);
        doc.setTextColor(...MUTED);
        doc.text(ln, M, y + size);
        y += size * 1.35;
      }
      y += 10;
    }
  }

  addChrome();
  return doc;
}

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "..", "public", "downloads");
mkdirSync(outDir, { recursive: true });

for (const article of LOCAL_ARTICLES) {
  const content = ARTICLE_CONTENT[article.slug];
  if (!content) {
    console.warn(`Skipping ${article.slug} (no content)`);
    continue;
  }
  const buf = Buffer.from(buildPdf(article, content).output("arraybuffer"));
  const dest = join(outDir, `${article.slug}.pdf`);
  writeFileSync(dest, buf);
  console.log(`Wrote ${dest} (${buf.length} bytes)`);
}
