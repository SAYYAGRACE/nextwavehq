import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Gift,
  GraduationCap,
  Laptop,
  MessageCircle,
  MonitorPlay,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { Aurora } from "@/components/Aurora";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TiltCard } from "@/components/TiltCard";
import { Magnetic } from "@/components/Magnetic";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CampRegistrationForm } from "@/components/camp/CampRegistrationForm";
import { CampSponsorSection } from "@/components/camp/CampSponsorSection";
import { CAMP, CAMP_OG_IMAGE, CAMP_URL, whatsappLink } from "@/lib/camp";

const TITLE = `${CAMP.name} — Live Online Coding Classes (27 Nov – 8 Jan)`;
const DESCRIPTION =
  "Register your child (ages 7–17) for the Nextwave Online Coding Camp — live online classes from 27 November 2026 to 8 January 2027. Nigerian-built, beginner-friendly.";

export const Route = createFileRoute("/camp/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: CAMP_URL },
      { property: "og:image", content: CAMP_OG_IMAGE },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: CAMP_OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: CAMP_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          name: CAMP.name,
          description: DESCRIPTION,
          provider: {
            "@type": "Organization",
            name: "Nextwave Infotech",
            sameAs: "https://nextwave.com.ng",
          },
          offers: {
            "@type": "Offer",
            price: CAMP.feeNaira,
            priceCurrency: "NGN",
            url: CAMP_URL,
            availability: "https://schema.org/InStock",
          },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            startDate: CAMP.startDate,
            endDate: CAMP.endDate,
          },
        }),
      },
    ],
  }),
  component: CampPage,
});

const FACTS = [
  { icon: CalendarDays, label: "Dates", value: CAMP.dateRangeLabel },
  { icon: MonitorPlay, label: "Format", value: "Live online classes" },
  { icon: Users, label: "Ages", value: "7–17 years" },
  { icon: Gift, label: "Fee", value: `${CAMP.feeLabel} (${CAMP.feeNote.toLowerCase()})` },
];

const AGE_TRACKS = [
  {
    key: "explorer",
    eyebrow: "Explorers · Ages 7–11",
    icon: Sparkles,
    title: "Playful first steps into code",
    body: "Designed to feel like play. Kids build real things from day one while learning how computers think.",
    points: [
      "Block-based coding (Scratch) and sequencing",
      "Games, animations and interactive stories",
      "Computational thinking and problem solving",
      "Show-and-tell of their own projects",
    ],
  },
  {
    key: "builder",
    eyebrow: "Builders · Ages 12–17",
    icon: Rocket,
    title: "Real tools, real projects",
    body: "Teens move to text-based code and modern tools, building projects they can show and keep.",
    points: [
      "Python and web fundamentals (HTML/CSS/JS)",
      "Debugging, logic and structured thinking",
      "A portfolio-ready final project",
      "Foundations for AI and data-science pathways",
    ],
  },
];

const INCLUDED = [
  {
    icon: MonitorPlay,
    title: "Live instructor-led classes",
    body: "Real teachers on every session — not pre-recorded videos.",
  },
  {
    icon: GraduationCap,
    title: "Age-appropriate curriculum",
    body: "Separate Explorers and Builders tracks, matched to how each age learns.",
  },
  {
    icon: Laptop,
    title: "Hands-on projects",
    body: "Every learner builds and keeps their own working projects.",
  },
  {
    icon: Users,
    title: "Small, guided cohorts",
    body: "Learners get attention and support through the sessions.",
  },
  {
    icon: ShieldCheck,
    title: "Safety-first, online",
    body: "No public photos or full child names. We collect the minimum we need.",
  },
  {
    icon: MessageCircle,
    title: "Parent updates on WhatsApp",
    body: "Schedule and progress updates sent straight to your phone.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Register your child",
    body: "Tell us your contact details, your child's first name and their age.",
  },
  {
    n: "02",
    title: "Pay the registration fee",
    body: `Pay ${CAMP.feeLabel} by card or bank transfer to confirm the place.`,
  },
  { n: "03", title: "Get your schedule", body: CAMP.classScheduleNote },
  {
    n: "04",
    title: "Start building",
    body: "Classes run live online from 27 November 2026 to 8 January 2027.",
  },
];

const FAQS = [
  {
    q: "Who is the camp for?",
    a: `The camp is for children aged 7 to 17 across Nigeria. Explorers (7–11) start with block-based coding, while Builders (12–17) work with text-based code and real project tools.`,
  },
  {
    q: "How much does it cost, and what's included?",
    a: `The registration fee is ${CAMP.feeLabel} (${CAMP.feeNote.toLowerCase()}). It covers live instructor-led classes, an age-appropriate curriculum, hands-on projects and parent updates for the full camp from ${CAMP.dateRangeLabel}.`,
  },
  {
    q: "What dates and times are the classes?",
    a: `${CAMP.classScheduleNote} The camp runs ${CAMP.dateRangeLabel}, so we can confirm sessions with you ahead of the start date.`,
  },
  {
    q: "What does my child need?",
    a: "A device (a phone, tablet or laptop) and a working internet connection. If you're unsure what will work, message us on WhatsApp and we'll help you check before you register.",
  },
  {
    q: "How do I pay?",
    a: `You can pay securely by card, or by bank transfer to ${CAMP.bank.bank} (${CAMP.bank.accountName}, ${CAMP.bank.accountNumber}). For transfers, include your reference in the narration and send the receipt to the Camp WhatsApp line.`,
  },
  {
    q: "What is your refund policy?",
    a: CAMP.refundPolicy.summary,
  },
  {
    q: "Is my child's information safe?",
    a: "Yes. We collect only what's needed — your contact details and your child's first name and age. We never publish children's photos or full names, and details are handled under our Privacy Policy.",
  },
];

function CampPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-20">
          <Aurora className="opacity-50" />
          <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-center">
              <Reveal>
                <div className="max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-4 py-1.5 text-xs tracking-[0.14em] uppercase text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-brand-glow" />
                    Registrations open · Live online
                  </span>
                  <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.04] tracking-tight">
                    <span className="gradient-text block">Nextwave Online Coding Camp</span>
                    <span className="text-white block mt-1">for kids and teens.</span>
                  </h1>
                  <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {CAMP.tagline} A Nigerian-built, beginner-friendly camp for ages 7–17 — live
                    classes, real projects, and a schedule that works online.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Magnetic strength={0.3}>
                      <a
                        href="#register"
                        className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-medium text-white transition-[transform,filter] hover:-translate-y-px hover:brightness-110"
                        style={{
                          background: "var(--gradient-brand)",
                          boxShadow: "var(--shadow-glow)",
                        }}
                      >
                        Register your child
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Magnetic>
                    <a
                      href={whatsappLink(CAMP.chatPrefillText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white border border-hairline bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Ask on WhatsApp
                    </a>
                  </div>
                  <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
                    {FACTS.map((f) => (
                      <div key={f.label}>
                        <dt className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-muted-foreground">
                          <f.icon className="h-3.5 w-3.5 text-brand-glow" strokeWidth={1.75} />
                          {f.label}
                        </dt>
                        <dd className="mt-1.5 text-sm text-white">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>

              <Reveal delay={140}>
                <SpotlightCard className="glass gradient-border rounded-3xl p-7 sm:p-9">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                      <Gift className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                    </span>
                    <div>
                      <div className="text-[10px] tracking-widest uppercase text-muted-foreground">
                        {CAMP.feeNote}
                      </div>
                      <div className="text-3xl font-bold text-white">{CAMP.feeLabel}</div>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Live classes, 27 Nov 2026 – 8 Jan 2027",
                      "Separate Explorers (7–11) & Builders (12–17)",
                      "Beginner-friendly — no experience needed",
                      "Refund available before the start date",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#register"
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-7 py-3.5 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
                  >
                    Secure your place
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <p className="mt-4 text-xs text-muted-foreground">{CAMP.refundPolicy.summary}</p>
                </SpotlightCard>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Age tracks */}
        <section className="relative py-16 lg:py-20">
          <div className="section-divider absolute top-0 inset-x-0" />
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <div className="max-w-2xl">
                <SectionEyebrow>Two age groups</SectionEyebrow>
                <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                  A track for every <span className="gradient-text">stage.</span>
                </h2>
                <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                  We split learners by age so the pace, tools and projects actually fit them.
                </p>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {AGE_TRACKS.map((t, i) => (
                <Reveal key={t.key} delay={i * 100}>
                  <TiltCard maxTilt={6} className="h-full">
                    <SpotlightCard className="glass gradient-border rounded-2xl p-7 h-full hover-lift">
                      <div className="flex items-center justify-between">
                        <span className="text-xs tracking-widest uppercase text-muted-foreground">
                          {t.eyebrow}
                        </span>
                        <span className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                          <t.icon className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                        </span>
                      </div>
                      <h3 className="mt-6 text-xl font-semibold text-white">{t.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                      <ul className="mt-6 space-y-2.5 border-t border-hairline pt-6">
                        {t.points.map((p) => (
                          <li
                            key={p}
                            className="flex items-start gap-2.5 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-glow/80" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </SpotlightCard>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <div className="max-w-2xl">
                <SectionEyebrow>How it works</SectionEyebrow>
                <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                  From registration to first class.
                </h2>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-hairline border-l-2 border-l-brand-purple/40 bg-white/[0.02] p-6">
                    <span className="text-xs font-semibold tabular-nums text-brand-purple/70">
                      {s.n}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-white">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* What's included */}
        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <div className="max-w-2xl">
                <SectionEyebrow>What's included</SectionEyebrow>
                <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                  Everything needed to start coding.
                </h2>
              </div>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUDED.map((it, i) => (
                <Reveal key={it.title} delay={i * 60}>
                  <div className="h-full rounded-2xl border border-hairline bg-white/[0.02] p-6">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-hairline bg-white/[0.03] text-brand-glow">
                      <it.icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-5 text-base font-semibold text-white">{it.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={120}>
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-hairline bg-white/[0.02] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hairline bg-white/[0.03]">
                    <Wifi className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-white">What your child needs</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      A phone, tablet or laptop and a working internet connection. Unsure if your
                      setup is enough? Message us and we'll help.
                    </p>
                  </div>
                </div>
                <a
                  href={whatsappLink(
                    "Hello, I'd like to check if my child's device and internet are enough for the Coding Camp",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-hairline bg-white/[0.03] px-6 py-3 text-sm font-medium text-white hover:bg-white/[0.06] transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  Check my setup
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Registration */}
        <section className="relative py-16 lg:py-20">
          <div className="section-divider absolute top-0 inset-x-0" />
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <Reveal>
              <div className="text-center mb-10">
                <SectionEyebrow>Registration</SectionEyebrow>
                <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                  Reserve a <span className="gradient-text">place.</span>
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Takes two minutes. You'll get a confirmation email and the reference for your
                  payment.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <CampRegistrationForm />
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {CAMP.classScheduleNote}
                </span>
                <a href="/terms#refunds" className="text-brand-glow hover:underline">
                  Refund policy
                </a>
              </p>
            </Reveal>
          </div>
        </section>

        {/* Sponsor */}
        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <Reveal>
              <div className="text-center mb-10">
                <SectionEyebrow>Give a seat</SectionEyebrow>
                <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                  Fund a child's first line of code.
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Not everyone can afford the fee. Sponsoring a seat puts a motivated child into the
                  camp — no strings attached.
                </p>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <CampSponsorSection />
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <Reveal>
              <div className="text-center">
                <SectionEyebrow>Questions</SectionEyebrow>
                <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                  Before you <span className="gradient-text">register.</span>
                </h2>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <Accordion type="single" collapsible className="mt-12 w-full space-y-3">
                {FAQS.map((f, i) => (
                  <AccordionItem
                    key={f.q}
                    value={`item-${i}`}
                    className="glass gradient-border rounded-2xl border-0 px-6"
                  >
                    <AccordionTrigger className="flex-1 text-left text-base font-semibold text-white py-5 [&[data-state=open]>svg]:rotate-180 [&>svg]:transition-transform [&>svg]:text-brand-glow">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-hairline bg-white/[0.02] px-8 py-14 sm:px-14 text-center">
                <Aurora className="opacity-40" />
                <div className="relative">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-border glass">
                    <Rocket className="h-7 w-7 text-brand-glow" strokeWidth={1.5} />
                  </div>
                  <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                    Give them a head start.
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                    Classes fill as families register. Secure a place now, or reach out with any
                    question first.
                  </p>
                  <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="#register"
                      className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-[filter] hover:brightness-110"
                      style={{
                        background: "var(--gradient-brand)",
                        boxShadow: "var(--shadow-glow)",
                      }}
                    >
                      Register now
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                    <a
                      href={whatsappLink(CAMP.chatPrefillText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white border border-hairline bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat on WhatsApp
                    </a>
                  </div>
                  <p className="mt-6 text-xs text-muted-foreground">
                    Prefer a different route?{" "}
                    <Link to="/contact" className="text-brand-glow hover:underline">
                      Contact the team
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
