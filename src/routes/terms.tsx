import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Aurora } from "@/components/Aurora";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nextwave Infotech" },
      {
        name: "description",
        content:
          "The terms that govern your use of the Nextwave Infotech website and participation in our programs.",
      },
      { property: "og:title", content: "Terms of Service — Nextwave Infotech" },
      {
        property: "og:description",
        content: "The terms that govern your use of nextwave.com.ng.",
      },
      { property: "og:url", content: "https://nextwave.com.ng/terms" },
      { property: "og:image", content: "https://nextwave.com.ng/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Terms of Service — Nextwave Infotech" },
      {
        name: "twitter:description",
        content: "The terms that govern your use of nextwave.com.ng.",
      },
      { name: "twitter:image", content: "https://nextwave.com.ng/og.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nextwave.com.ng/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-28 pb-16 lg:pt-36 overflow-hidden">
        <Aurora className="opacity-30" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <SectionEyebrow>Legal</SectionEyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-white">
              Terms of <span className="gradient-text">Service.</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: 10 October 2026</p>
          </Reveal>

          <Reveal delay={40}>
            <nav className="toc mt-10" aria-label="On this page">
              <p className="toc-title">On this page</p>
              <ol>
                <li>
                  <a href="#use-of-the-site">Use of the site</a>
                </li>
                <li>
                  <a href="#programs-and-applications">Programs and applications</a>
                </li>
                <li>
                  <a href="#intellectual-property">Intellectual property</a>
                </li>
                <li>
                  <a href="#third-party-links">Third-party links</a>
                </li>
                <li>
                  <a href="#limitation-of-liability">Limitation of liability</a>
                </li>
                <li>
                  <a href="#governing-law">Governing law</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ol>
            </nav>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-10 space-y-8 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                These terms govern your use of the website at {SITE.domain}, operated by{" "}
                {SITE.legalName} ("Nextwave", "we", "us"). By using the site you agree to these
                terms. If you do not agree, please do not use the site.
              </p>

              <div className="section-divider" />

              <section id="use-of-the-site">
                <h2 className="text-lg font-semibold text-white">Use of the site</h2>
                <p className="mt-3">
                  You agree to use the site lawfully and not to interfere with its operation or
                  security. Content on the site is provided for general information and may change
                  without notice.
                </p>
              </section>

              <div className="section-divider" />

              <section id="programs-and-applications">
                <h2 className="text-lg font-semibold text-white">Programs and applications</h2>
                <p className="mt-3">
                  Information about programs, waitlists and opportunities is indicative and may be
                  updated. Registering interest or joining a waitlist does not guarantee admission.
                  Where a learner is under 18, a parent or guardian must consent to participation.
                </p>
              </section>

              <div className="section-divider" />

              <section id="intellectual-property">
                <h2 className="text-lg font-semibold text-white">Intellectual property</h2>
                <p className="mt-3">
                  Unless stated otherwise, the content, branding and materials on this site belong
                  to Nextwave or its partners and may not be copied or reused without permission.
                </p>
              </section>

              <div className="section-divider" />

              <section id="third-party-links">
                <h2 className="text-lg font-semibold text-white">Third-party links</h2>
                <p className="mt-3">
                  The site may link to third-party websites. We are not responsible for their
                  content or practices.
                </p>
              </section>

              <div className="section-divider" />

              <section id="limitation-of-liability">
                <h2 className="text-lg font-semibold text-white">Limitation of liability</h2>
                <p className="mt-3">
                  The site is provided "as is". To the fullest extent permitted by law, Nextwave is
                  not liable for any loss arising from reliance on the site or its content.
                </p>
              </section>

              <div className="section-divider" />

              <section id="governing-law">
                <h2 className="text-lg font-semibold text-white">Governing law</h2>
                <p className="mt-3">
                  These terms are governed by the laws of the Federal Republic of Nigeria.
                </p>
              </section>

              <div className="section-divider" />

              <section id="contact">
                <h2 className="text-lg font-semibold text-white">Contact</h2>
                <p className="mt-3">
                  Questions about these terms? Contact us at{" "}
                  <a href={`mailto:${SITE.email}`} className="text-brand-glow hover:underline">
                    {SITE.email}
                  </a>
                  .
                </p>
              </section>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
