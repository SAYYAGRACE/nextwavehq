import { createElement as h, type ReactNode } from "react";

const FONT_400 =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff";
const FONT_700 =
  "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff";

const fontCache = new Map<string, ArrayBuffer>();

async function loadFont(url: string): Promise<ArrayBuffer> {
  const cached = fontCache.get(url);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch failed: ${res.status}`);
  const buffer = await res.arrayBuffer();
  fontCache.set(url, buffer);
  return buffer;
}

export type OgCard = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  score?: number | null;
  tier?: string | null;
  footer?: string;
};

const BRAND = {
  bg: "#0b0b12",
  panel: "#15151f",
  accent: "#8b5cf6",
  blue: "#38bdf8",
  text: "#f5f5fa",
  muted: "#a1a1b5",
};

function row(children: ReactNode[], style: Record<string, unknown> = {}) {
  return h("div", { style: { display: "flex", ...style } }, ...children);
}

function buildCard(card: OgCard) {
  const hasScore = typeof card.score === "number";
  return h(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "1200px",
        height: "630px",
        padding: "64px",
        background: `linear-gradient(135deg, ${BRAND.bg} 0%, #16121f 55%, #1c1330 100%)`,
        color: BRAND.text,
        fontFamily: "Inter",
      },
    },
    row(
      [
        h(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: hasScore ? "760px" : "1000px",
            },
          },
          h(
            "div",
            {
              style: {
                display: "flex",
                fontSize: "24px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: BRAND.accent,
                fontWeight: 700,
              },
            },
            card.eyebrow ?? "School Tech Readiness Index",
          ),
          h(
            "div",
            { style: { display: "flex", fontSize: "64px", lineHeight: 1.05, fontWeight: 700 } },
            card.title,
          ),
          card.subtitle
            ? h(
                "div",
                { style: { display: "flex", fontSize: "30px", color: BRAND.muted } },
                card.subtitle,
              )
            : null,
        ),
        hasScore
          ? h(
              "div",
              {
                style: {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "300px",
                  height: "300px",
                  borderRadius: "28px",
                  background: BRAND.panel,
                  border: `2px solid ${BRAND.accent}`,
                },
              },
              h(
                "div",
                { style: { display: "flex", fontSize: "96px", fontWeight: 700 } },
                String(card.score),
              ),
              h(
                "div",
                {
                  style: {
                    display: "flex",
                    fontSize: "22px",
                    letterSpacing: "3px",
                    color: BRAND.muted,
                  },
                },
                "OF 100",
              ),
            )
          : null,
      ],
      { flex: 1, justifyContent: "space-between", alignItems: "center" },
    ),
    row(
      [
        h(
          "div",
          { style: { display: "flex", fontSize: "26px", color: BRAND.muted } },
          card.footer ?? "nextwave.com.ng/readiness",
        ),
        card.tier
          ? h(
              "div",
              {
                style: {
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: "9999px",
                  background: BRAND.accent,
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: 700,
                  textTransform: "capitalize",
                },
              },
              card.tier,
            )
          : null,
      ],
      { alignItems: "center", justifyContent: "space-between" },
    ),
  );
}

export async function renderOgPng(card: OgCard): Promise<Uint8Array> {
  const [{ default: satori }, { Resvg }] = await Promise.all([
    import("satori"),
    import("@resvg/resvg-js"),
  ]);

  const [regular, bold] = await Promise.all([loadFont(FONT_400), loadFont(FONT_700)]);

  const svg = await satori(buildCard(card), {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Inter", data: regular, weight: 400, style: "normal" },
      { name: "Inter", data: bold, weight: 700, style: "normal" },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return png;
}
