import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TiltCard } from "@/components/TiltCard";
import { Aurora } from "@/components/Aurora";
import { KineticText } from "@/components/KineticText";
import { BrainCircuit, Building2, Compass, MapPin, Scale } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Nextwave Movement" },
      {
        name: "description",
        content:
          "A passionate collective positioning Africa at the forefront of emerging technologies, rooted in Northern Nigeria.",
      },
      { property: "og:title", content: "About — The Nextwave Movement" },
      {
        property: "og:description",
        content: "Bridging the gap between formal education and cutting-edge industry demands.",
      },
      { property: "og:url", content: "https://nextwave.com.ng/about" },
      { property: "og:image", content: "https://nextwave.com.ng/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About — The Nextwave Movement" },
      {
        name: "twitter:description",
        content: "Bridging the gap between formal education and cutting-edge industry demands.",
      },
      { name: "twitter:image", content: "https://nextwave.com.ng/og.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nextwave.com.ng/about" }],
  }),
  component: AboutPage,
});

const DRIVES = [
  {
    icon: BrainCircuit,
    title: "Identify exceptional minds",
    body: "We find rare analytical talent early and route it through a rigorous, transparent pipeline.",
  },
  {
    icon: Building2,
    title: "Engineer real infrastructure",
    body: "From AI systems to digital-health frameworks, we build the stack — not just the people for it.",
  },
  {
    icon: Scale,
    title: "Shape policy from the ground",
    body: "We advocate policy that bends toward the continent, blocking for African architects of tech.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-28 pb-16 lg:pt-36 overflow-hidden">
        <Aurora className="opacity-35" />
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="absolute inset-0 radial-glow" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionEyebrow>The Movement</SectionEyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl">
              <KineticText text="About the Nextwave Movement." className="gradient-text" />{" "}
            </h1>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-12 max-w-3xl">
              <SectionEyebrow>Who We Are</SectionEyebrow>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                A passionate collective positioning Africa at the forefront of{" "}
                <span className="gradient-text">emerging technologies.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground">
                Nextwave is structured to ensure the African continent is an active architect —
                rather than a passive consumer — of the global deep-tech revolution. By building
                grassroots infrastructure, training exceptional analytical minds, and influencing
                digital health and AI policies, we are shifting the paradigm of tech literacy
                starting from Northern Nigeria.
              </p>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <blockquote className="relative mt-10 max-w-3xl rounded-2xl border border-hairline bg-white/[0.02] px-6 py-7 sm:px-9 sm:py-9 overflow-hidden">
              <p className="relative text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-snug">
                "Africa must architect the deep-tech century — not merely consume it."
              </p>
              <footer className="relative mt-5 text-xs tracking-widest uppercase text-muted-foreground">
                The Nextwave Thesis
              </footer>
            </blockquote>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <Reveal>
              <SpotlightCard className="relative overflow-hidden rounded-2xl border border-hairline bg-white/[0.02] p-8 sm:p-10 min-h-[340px]">
                <div className="relative flex flex-col h-full">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.04]">
                    <MapPin className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                  </div>
                  <div className="mt-auto pt-20">
                    <h3 className="text-2xl font-semibold text-white">
                      Founded &amp; Rooted in Northern Nigeria
                    </h3>
                    <p className="mt-3 text-muted-foreground leading-relaxed">
                      Driving systemic change from regional technology hubs — building outward from
                      Kaduna State to the continent.
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </Reveal>

            <Reveal delay={120}>
              <SpotlightCard className="relative overflow-hidden rounded-2xl border border-hairline bg-white/[0.02] p-8 sm:p-10 min-h-[340px]">
                <div className="relative flex flex-col h-full">
                  <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.04]">
                    <Compass className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-7 text-2xl font-semibold text-white">Our Genesis Story</h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Born from the urgent recognition that Africa must not be left behind in the
                    global technological transformation, Nextwave began with a precise mission: to
                    bridge the stark gap between formal education and cutting-edge industry demands.
                  </p>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    We operate on the ground where intervention is needed most, transforming
                    potential into execution.
                  </p>
                </div>
              </SpotlightCard>
            </Reveal>
          </div>

          <Reveal>
            <div className="mt-16 max-w-3xl">
              <SectionEyebrow>What Drives Us</SectionEyebrow>
              <h2 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                Three drives <span className="gradient-text">powering the mission.</span>
              </h2>
              <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                Identifying exceptional minds, engineering real infrastructure, and shaping policy
                from the ground.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {DRIVES.map((d, i) => (
              <Reveal key={d.title} delay={i * 90}>
                <TiltCard maxTilt={7} className="h-full">
                  <div className="group h-full">
                    <SpotlightCard className="glass gradient-border rounded-2xl p-7 h-full overflow-hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.03] group-hover:border-brand-purple/40 transition-colors duration-300">
                          <d.icon className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                        </div>
                        <span className="text-[11px] font-semibold tabular-nums tracking-[0.2em] text-muted-foreground group-hover:text-white transition-colors duration-300">
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-white">{d.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
                    </SpotlightCard>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
