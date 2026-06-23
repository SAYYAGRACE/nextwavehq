import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { MapPin, Compass } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Nextwave Movement" },
      { name: "description", content: "A passionate collective positioning Africa at the forefront of emerging technologies, rooted in Northern Nigeria." },
      { property: "og:title", content: "About — The Nextwave Movement" },
      { property: "og:description", content: "Bridging the gap between formal education and cutting-edge industry demands." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-32 pb-20 lg:pt-44">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="absolute inset-0 radial-glow" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <SectionEyebrow>The Movement</SectionEyebrow>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl">
            About the <span className="gradient-text">Nextwave Movement.</span>
          </h1>

          <div className="mt-16 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-white leading-tight">
              A passionate collective positioning Africa at the forefront of emerging technologies.
            </h2>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-muted-foreground">
              Nextwave is structured to ensure the African continent is an active architect — rather
              than a passive consumer — of the global deep-tech revolution. By building grassroots
              infrastructure, training exceptional analytical minds, and influencing digital health
              and AI policies, we are shifting the paradigm of tech literacy starting from Northern
              Nigeria.
            </p>
          </div>

          <div className="mt-20 grid gap-6 lg:grid-cols-2">
            {/* Geo card */}
            <article className="relative overflow-hidden rounded-2xl glass-strong p-8 sm:p-10 min-h-[340px]">
              <div className="absolute inset-0 grid-bg opacity-50 [mask-image:radial-gradient(circle_at_30%_30%,black,transparent_70%)]" />
              <svg className="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
                <defs>
                  <radialGradient id="node" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="oklch(0.7 0.22 280)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="oklch(0.7 0.22 280)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {[
                  [90, 80], [240, 60], [330, 140], [180, 180], [80, 220], [280, 260], [380, 200],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r="14" fill="url(#node)" />
                    <circle cx={x} cy={y} r="2" fill="white" />
                  </g>
                ))}
                <line x1="90" y1="80" x2="240" y2="60" stroke="oklch(0.7 0.22 280 / 0.4)" strokeWidth="1" />
                <line x1="240" y1="60" x2="330" y2="140" stroke="oklch(0.7 0.22 280 / 0.4)" strokeWidth="1" />
                <line x1="180" y1="180" x2="240" y2="60" stroke="oklch(0.7 0.22 280 / 0.3)" strokeWidth="1" />
                <line x1="180" y1="180" x2="80" y2="220" stroke="oklch(0.7 0.22 280 / 0.3)" strokeWidth="1" />
                <line x1="180" y1="180" x2="280" y2="260" stroke="oklch(0.7 0.22 280 / 0.3)" strokeWidth="1" />
                <line x1="330" y1="140" x2="380" y2="200" stroke="oklch(0.7 0.22 280 / 0.3)" strokeWidth="1" />
              </svg>
              <div className="relative flex flex-col h-full">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.04]">
                  <MapPin className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                </div>
                <div className="mt-auto pt-20">
                  <h3 className="text-2xl font-semibold text-white">Founded & Rooted in Northern Nigeria</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Driving systemic change from regional technology hubs — building outward from Kaduna State to the continent.
                  </p>
                </div>
              </div>
            </article>

            {/* Genesis card */}
            <article className="relative overflow-hidden rounded-2xl glass-strong p-8 sm:p-10 min-h-[340px]">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand-purple/20 blur-[100px]" />
              <div className="relative flex flex-col h-full">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-white/[0.04]">
                  <Compass className="h-5 w-5 text-brand-glow" strokeWidth={1.5} />
                </div>
                <h3 className="mt-7 text-2xl font-semibold text-white">Our Genesis Story</h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Born from the urgent recognition that Africa must not be left behind in the global
                  technological transformation, Nextwave began with a precise mission: to bridge the
                  stark gap between formal education and cutting-edge industry demands.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We operate on the ground where intervention is needed most, transforming potential
                  into execution.
                </p>
              </div>
            </article>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
