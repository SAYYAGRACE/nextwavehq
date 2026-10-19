import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Aurora } from "@/components/Aurora";
import {
  EVIDENCE_TYPES,
  LEVEL_DESCRIPTORS,
  PILLARS,
  RUBRIC_EFFECTIVE_DATE,
  RUBRIC_VERSION,
  TIERS,
} from "@/lib/readiness/rubric";

export const Route = createFileRoute("/readiness/methodology")({
  head: () => ({
    meta: [
      { title: "NTRI Methodology — How We Score Schools | Nextwave" },
      {
        name: "description",
        content:
          "The full NTRI method: six pillars, indicator weights, the 0-4 scale, evidence types and caps, tier thresholds, the two-assessor process, review windows and data privacy.",
      },
      { property: "og:title", content: "NTRI Methodology — How We Score Schools" },
      {
        property: "og:description",
        content: "The full, transparent method behind the Nextwave School Tech Readiness Index.",
      },
      { property: "og:url", content: "https://nextwave.com.ng/readiness/methodology" },
      { property: "og:image", content: "https://nextwave.com.ng/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NTRI Methodology — How We Score Schools" },
      {
        name: "twitter:description",
        content: "The full, transparent method behind the Nextwave School Tech Readiness Index.",
      },
      { name: "twitter:image", content: "https://nextwave.com.ng/og.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nextwave.com.ng/readiness/methodology" }],
  }),
  component: MethodologyPage,
});

const FAQS = [
  {
    q: "Why are schools graded?",
    a: "A grade turns a vague question — is a school ready for technology? — into something specific and comparable. It helps schools see their own gaps, helps partners target support, and tracks whether things are improving over time. It is a growth tool, not a verdict.",
  },
  {
    q: "Can a school opt out?",
    a: "Yes. We only publish a school's name and results if the school has given consent. A school can decline at any point, and can ask to be removed from the public directory at any time.",
  },
  {
    q: "How do corrections work?",
    a: "Every profile has a 'Report a correction' link. Send us what looks wrong and how you know. We check it against our records and the assessor notes, and update or explain the result. Corrections are logged.",
  },
  {
    q: "Is student data published?",
    a: "Never. Student capability is measured through sampled tests and reported only as an aggregate score per school. No student names, no individual results and no identifiable photos of minors are ever stored or published.",
  },
  {
    q: "How often is it updated?",
    a: "Each school is re-assessed annually. Where a school has been assessed more than once, its profile shows the change since the first assessment.",
  },
];

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-28 pb-16 lg:pt-36 overflow-hidden">
        <Aurora className="opacity-30" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <SectionEyebrow>Readiness · Methodology</SectionEyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-white">
              How we score <span className="gradient-text">schools.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
              The Nextwave School Tech Readiness Index (NTRI) scores each school out of 100 across
              six pillars. This page sets out the whole method, so anyone can check our work.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Rubric version {RUBRIC_VERSION} · effective {RUBRIC_EFFECTIVE_DATE}
            </p>
          </Reveal>

          <Reveal delay={60}>
            <nav className="toc mt-12 max-w-md" aria-label="On this page">
              <p className="toc-title">On this page</p>
              <ol>
                <li>
                  <a href="#six-pillars">The six pillars</a>
                </li>
                <li>
                  <a href="#scale">The 0-4 scale</a>
                </li>
                <li>
                  <a href="#evidence">Evidence &amp; caps</a>
                </li>
                <li>
                  <a href="#tiers">Tiers</a>
                </li>
                <li>
                  <a href="#process">The process</a>
                </li>
                <li>
                  <a href="#privacy">Data privacy</a>
                </li>
                <li>
                  <a href="#disclosure">Independence &amp; disclosure</a>
                </li>
                <li>
                  <a href="#rubric-history">Rubric version history</a>
                </li>
                <li>
                  <a href="#changelog">Changelog</a>
                </li>
                <li>
                  <a href="#questions">Questions</a>
                </li>
              </ol>
            </nav>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section id="six-pillars" className="mt-8">
              <h2 className="text-2xl font-bold text-white">The six pillars</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Each pillar is worth a fixed number of points. The weights add up to 100.
              </p>
              <div className="mt-6 space-y-5">
                {PILLARS.map((p, idx) => (
                  <div key={p.key} className="glass rounded-2xl border border-hairline p-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="flex items-baseline gap-3">
                        <span className="text-xs font-semibold tabular-nums text-brand-purple/70">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-semibold text-white">{p.label}</h3>
                      </div>
                      <span className="text-sm tabular-nums text-brand-glow">{p.weight} pts</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{p.summary}</p>
                    <table className="mt-4 w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="pb-2 font-medium">Indicator</th>
                          <th className="pb-2 text-right font-medium">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.indicators.map((i) => (
                          <tr key={i.key} className="border-t border-hairline/60">
                            <td className="py-2 pr-4 text-muted-foreground">{i.label}</td>
                            <td className="py-2 text-right tabular-nums text-white">{i.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div id="scale" className="glass rounded-2xl border border-hairline p-6">
                <h2 className="text-lg font-semibold text-white">The 0-4 scale</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every indicator is scored against written descriptors, then converted: points =
                  (score ÷ 4) × weight.
                </p>
                <ul className="mt-4 space-y-2.5">
                  {LEVEL_DESCRIPTORS.map((d) => (
                    <li key={d.score} className="flex gap-3 text-sm">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/[0.06] text-xs font-semibold text-white">
                        {d.score}
                      </span>
                      <span className="text-muted-foreground">
                        <span className="text-white">{d.label}.</span> {d.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div id="evidence" className="glass rounded-2xl border border-hairline p-6">
                <h2 className="text-lg font-semibold text-white">Evidence &amp; caps</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Every indicator carries one evidence type. Weaker evidence is capped so scores
                  stay honest.
                </p>
                <ul className="mt-4 space-y-3">
                  {EVIDENCE_TYPES.map((e) => (
                    <li key={e.key} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{e.label}</span>
                        <span className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground">
                          max {e.maxScore}/4
                        </span>
                      </div>
                      <p className="mt-0.5 text-muted-foreground">{e.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section id="tiers" className="mt-8">
              <h2 className="text-2xl font-bold text-white">Tiers</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A school's total out of 100 places it in one of five tiers.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                {TIERS.map((t) => (
                  <div
                    key={t.key}
                    className="flex h-full flex-col rounded-xl border border-hairline p-4"
                  >
                    <span
                      aria-hidden
                      className="mb-3 h-1 w-8 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    <span
                      className="inline-block self-start rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ backgroundColor: t.color, color: t.onColor }}
                    >
                      {t.label}
                    </span>
                    <div className="mt-3 text-2xl font-bold text-white">
                      {t.min}–{t.max}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{t.blurb}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section id="process" className="mt-8 glass rounded-2xl border border-hairline p-6">
              <h2 className="text-2xl font-bold text-white">The process</h2>
              <ol className="mt-5 space-y-4 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-white">Two assessors.</span> Each school is
                  scored independently by two Nextwave assessors during a visit.
                </li>
                <li>
                  <span className="font-medium text-white">Reconciliation.</span> Where the two
                  scores differ by more than one point, the assessors reconcile with a written note
                  before the assessment can be submitted.
                </li>
                <li>
                  <span className="font-medium text-white">School review.</span> Once submitted, the
                  school's contact receives a secure link with a 14-day window to review and request
                  corrections.
                </li>
                <li>
                  <span className="font-medium text-white">Publish or withhold.</span> Only an admin
                  can publish or withhold a result, after the review window.
                </li>
                <li>
                  <span className="font-medium text-white">Re-assessment.</span> Schools are
                  re-assessed annually so progress can be tracked fairly.
                </li>
              </ol>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section id="privacy" className="mt-8 glass rounded-2xl border border-hairline p-6">
              <h2 className="text-2xl font-bold text-white">Data privacy</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We publish only what is safe and fair. A school's name and results appear only with
                its consent. No student names, no individual results and no identifiable photos of
                minors are ever collected or published. Local-area and overall figures are shown
                only where at least five schools contribute, so no single school can be picked out
                of an average. See our{" "}
                <Link to="/privacy" className="text-brand-glow hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section id="disclosure" className="mt-8 glass rounded-2xl border border-hairline p-6">
              <h2 className="text-2xl font-bold text-white">Independence and disclosure</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Nextwave Infotech also offers paid services, including training programmes for
                schools and students. Assessments are carried out by assessors who are independent
                of sales and business development, and a school's NTRI score is never influenced by
                whether it buys any service. Every school is scored against the same published
                rubric, regardless of any commercial relationship with Nextwave.
              </p>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section
              id="rubric-history"
              className="mt-8 glass rounded-2xl border border-hairline p-6"
            >
              <h2 className="text-2xl font-bold text-white">Rubric version history</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex gap-4 border-l-2 border-brand-purple/50 pl-4">
                  <div>
                    <div className="font-medium text-white">
                      v{RUBRIC_VERSION} · {RUBRIC_EFFECTIVE_DATE}
                    </div>
                    <p className="text-muted-foreground">
                      Initial published rubric. Six pillars, 100 points.
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Rubrics are versioned. When the framework changes, previous assessments keep the
                version they were scored under — old scores are never rewritten.
              </p>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section id="changelog" className="mt-8 glass rounded-2xl border border-hairline p-6">
              <h2 className="text-2xl font-bold text-white">Changelog</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex gap-4 border-l-2 border-brand-purple/50 pl-4">
                  <div>
                    <div className="font-medium text-white">17 October 2026</div>
                    <p className="text-muted-foreground">
                      Clarified the headline metrics: "reliable power" and "working internet" now
                      explicitly mean a score of 3 or higher on the corresponding indicator. Added
                      an independence and disclosure statement.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-l-2 border-brand-purple/50 pl-4">
                  <div>
                    <div className="font-medium text-white">{RUBRIC_EFFECTIVE_DATE}</div>
                    <p className="text-muted-foreground">v{RUBRIC_VERSION} rubric published.</p>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>

          <div className="section-divider mt-12" />

          <Reveal delay={60}>
            <section id="questions" className="mt-8">
              <h2 className="text-2xl font-bold text-white">Questions</h2>
              <div className="mt-6 space-y-3">
                {FAQS.map((f) => (
                  <details
                    key={f.q}
                    className="group rounded-2xl border border-hairline bg-white/[0.02] p-5"
                  >
                    <summary className="cursor-pointer list-none text-sm font-semibold text-white marker:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {f.q}
                        <span className="text-brand-glow transition-transform group-open:rotate-45">
                          +
                        </span>
                      </span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
