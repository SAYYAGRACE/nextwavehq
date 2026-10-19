import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Aurora } from "@/components/Aurora";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nextwave Infotech" },
      {
        name: "description",
        content:
          "How Nextwave Infotech collects, uses, stores and protects personal data, including the data of learners under 18, under the Nigeria Data Protection Act.",
      },
      { property: "og:title", content: "Privacy Policy — Nextwave Infotech" },
      {
        property: "og:description",
        content: "How Nextwave collects, uses and protects your personal data.",
      },
      { property: "og:url", content: "https://nextwave.com.ng/privacy" },
      { property: "og:image", content: "https://nextwave.com.ng/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Privacy Policy — Nextwave Infotech" },
      {
        name: "twitter:description",
        content: "How Nextwave collects, uses and protects your personal data.",
      },
      { name: "twitter:image", content: "https://nextwave.com.ng/og.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nextwave.com.ng/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
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
              Privacy <span className="gradient-text">Policy.</span>
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">Last updated: 10 October 2026</p>
          </Reveal>

          <Reveal delay={40}>
            <nav className="toc mt-10" aria-label="On this page">
              <p className="toc-title">On this page</p>
              <ol>
                <li>
                  <a href="#information-we-collect">Information we collect</a>
                </li>
                <li>
                  <a href="#children-and-data-of-minors">Children and data of minors</a>
                </li>
                <li>
                  <a href="#how-we-use-your-information">How we use your information</a>
                </li>
                <li>
                  <a href="#storage-and-retention">Storage, service providers and retention</a>
                </li>
                <li>
                  <a href="#cookies">Cookies</a>
                </li>
                <li>
                  <a href="#your-rights">Your rights</a>
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
                {SITE.legalName} ("Nextwave", "we", "us") respects your privacy. This policy
                explains what personal data we collect through {SITE.domain}, why we collect it, and
                the choices you have. We process personal data in line with the Nigeria Data
                Protection Act (NDPA) and, where applicable, other relevant laws.
              </p>

              <div className="section-divider" />

              <section id="information-we-collect">
                <h2 className="text-lg font-semibold text-white">Information we collect</h2>
                <p className="mt-3">
                  We collect information you provide directly to us, including when you contact us,
                  join the NerdHaven waitlist, subscribe to updates, or register interest in our
                  programs. This may include your name, email address, organisation, school, and the
                  content of your message. We collect the minimum data needed for the purpose at
                  hand.
                </p>
              </section>

              <div className="section-divider" />

              <section id="children-and-data-of-minors">
                <h2 className="text-lg font-semibold text-white">Children and data of minors</h2>
                <p className="mt-3">
                  Some of our programs, including NerdHaven, are designed for primary and secondary
                  learners. Where we collect data about a person under 18, we do so with the consent
                  of a parent or guardian, and we limit collection to what is necessary. A parent or
                  guardian may contact us at any time to review, correct or delete a child's data.
                </p>
              </section>

              <div className="section-divider" />

              <section id="how-we-use-your-information">
                <h2 className="text-lg font-semibold text-white">How we use your information</h2>
                <p className="mt-3">
                  We use the information we collect to respond to enquiries, manage waitlists and
                  registrations, send updates you have asked for, operate and improve our programs,
                  and meet legal obligations. We do not sell your personal data.
                </p>
              </section>

              <div className="section-divider" />

              <section id="storage-and-retention">
                <h2 className="text-lg font-semibold text-white">
                  Storage, service providers and retention
                </h2>
                <p className="mt-3">
                  Submissions are stored in a content management database and email is delivered
                  through a third-party email provider acting on our behalf. We keep personal data
                  only for as long as necessary for the purpose it was collected, or as required by
                  law.
                </p>
              </section>

              <div className="section-divider" />

              <section id="cookies">
                <h2 className="text-lg font-semibold text-white">Cookies</h2>
                <p className="mt-3">
                  We use essential cookies and similar technologies needed to run the site, and
                  limited analytics to understand how it is used. You can control cookies through
                  your browser settings.
                </p>
              </section>

              <div className="section-divider" />

              <section id="your-rights">
                <h2 className="text-lg font-semibold text-white">Your rights</h2>
                <p className="mt-3">
                  Under the NDPA you have the right to access, correct, and request deletion of your
                  personal data, and to object to certain processing. To exercise any of these
                  rights, contact us at{" "}
                  <a href={`mailto:${SITE.email}`} className="text-brand-glow hover:underline">
                    {SITE.email}
                  </a>
                  .
                </p>
              </section>

              <div className="section-divider" />

              <section id="contact">
                <h2 className="text-lg font-semibold text-white">Contact</h2>
                <p className="mt-3">
                  Questions about this policy? Reach us at{" "}
                  <a href={`mailto:${SITE.email}`} className="text-brand-glow hover:underline">
                    {SITE.email}
                  </a>{" "}
                  or by post at {SITE.location.full}.
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
