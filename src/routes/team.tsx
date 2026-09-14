import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TiltCard } from "@/components/TiltCard";
import { Aurora } from "@/components/Aurora";
import { Linkedin, Github, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team & Leadership — Nextwave" },
      {
        name: "description",
        content:
          "Meet the strategic minds directing Nextwave's developmental programs, tech advocacy, and operational framework.",
      },
      { property: "og:title", content: "Executive Leadership & Operations — Nextwave" },
      { property: "og:description", content: "The leadership team behind Nextwave." },
      { property: "og:url", content: "/team" },
    ],
    links: [{ rel: "canonical", href: "/team" }],
  }),
  component: TeamPage,
});

const LEADERS = [
  { name: "Muhammad Khalifa", title: "Co-Founder and Chief Executive Officer (CEO)" },
  { name: "Ahmad Sani", title: "Founder and Chief Operating Officer (COO)" },
  { name: "Muhsin Haruna", title: "Co-Founder and Head of Operations" },
  { name: "Asiya Halilu", title: "Head of Programs" },
  { name: "Amina Samari", title: "Head of Marketing" },
  { name: "Ahmad Salisu", title: "Communications Manager" },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
}

function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-28 pb-16 lg:pt-36 overflow-hidden">
        <Aurora className="opacity-30" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <SectionEyebrow>Leadership</SectionEyebrow>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl">
              Executive Leadership <span className="gradient-text">& Operations.</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Meet the strategic minds directing Nextwave's developmental programs, tech advocacy,
              and operational framework. The movement is built and governed from the ground up — in
              Northern Nigeria.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERS.map((p, i) => (
              <Reveal key={p.name} delay={(i % 3) * 80}>
                <TiltCard maxTilt={6} className="h-full">
                  <SpotlightCard className="group rounded-2xl glass gradient-border p-7 h-full overflow-hidden">
                    <div className="relative aspect-[4/3] rounded-xl border border-hairline bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden">
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="text-5xl font-bold text-white/10 tracking-tight group-hover:text-brand-purple/40 transition-colors duration-300">
                          {initials(p.name)}
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-white">{p.name}</h3>
                      <p className="mt-1.5 text-sm text-brand-glow/90">{p.title}</p>
                    </div>
                    <div className="mt-6 pt-5 border-t border-hairline flex items-center justify-between">
                      <span className="text-[10px] tracking-widest uppercase text-muted-foreground">
                        Nextwave Infotech
                      </span>
                      <div className="flex items-center gap-2">
                        <SocialIcon icon={Linkedin} label={`${p.name} on LinkedIn`} />
                        <SocialIcon icon={Github} label={`${p.name} on GitHub`} />
                      </div>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-3xl glass-strong p-8 sm:p-10 overflow-hidden relative">
              <div className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-brand-blue/20 blur-[110px]" />
              <div className="relative">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  Building the movement <span className="gradient-text">takes a team.</span>
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">
                  We're always looking for operators, engineers, and advocates who want to help
                  close Africa's deep-tech gap.
                </p>
              </div>
              <a
                href="/contact"
                className="relative group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-all hover:scale-[1.03]"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
              >
                Get involved
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SocialIcon({ icon: Icon, label }: { icon: typeof Linkedin; label: string }) {
  return (
    <button
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-md border border-hairline bg-white/[0.02] text-muted-foreground hover:text-white hover:border-brand-purple/60 transition-colors"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.7} />
    </button>
  );
}
