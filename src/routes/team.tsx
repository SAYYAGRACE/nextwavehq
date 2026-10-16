import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Reveal } from "@/components/Reveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { TiltCard } from "@/components/TiltCard";
import { Aurora } from "@/components/Aurora";
import { Instagram, ArrowRight } from "lucide-react";
import { SITE } from "@/lib/site";

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
      { property: "og:url", content: "https://nextwave.com.ng/team" },
      { property: "og:image", content: "https://nextwave.com.ng/og.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Executive Leadership & Operations — Nextwave" },
      { name: "twitter:description", content: "The leadership team behind Nextwave." },
      { name: "twitter:image", content: "https://nextwave.com.ng/og.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://nextwave.com.ng/team" }],
  }),
  component: TeamPage,
});

const LEADERS = [
  { name: "Muhammad Khalifa", title: "Co-Founder and Chief Executive Officer (CEO)" },
  { name: "Ahmad Sani", title: "Founder and Chief Operating Officer (COO)" },
  { name: "Muhsin Haruna", title: "Co-Founder and Head of Operations" },
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
                    <div className="relative aspect-[4/3] rounded-xl border border-hairline bg-white/[0.03] overflow-hidden">
                      <span className="absolute left-3 top-3 text-[10px] font-semibold tabular-nums tracking-[0.2em] text-muted-foreground group-hover:text-brand-purple/70 transition-colors duration-300">
                        0{i + 1}
                      </span>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="text-5xl font-bold text-white/10 tracking-tight group-hover:text-brand-purple/40 transition-colors duration-300">
                          {initials(p.name)}
                        </div>
                      </div>
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
                        <SocialIcon href={SITE.socials.x.url} label={`${SITE.name} on X`}>
                          <XLogo className="h-3.5 w-3.5" />
                        </SocialIcon>
                        <SocialIcon
                          href={SITE.socials.instagram.url}
                          label={`${SITE.name} on Instagram`}
                        >
                          <Instagram className="h-3.5 w-3.5" strokeWidth={1.7} />
                        </SocialIcon>
                      </div>
                    </div>
                  </SpotlightCard>
                </TiltCard>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-5 rounded-3xl border border-hairline bg-white/[0.02] p-8 sm:p-10 overflow-hidden relative">
              <div className="relative">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  Building the movement takes a team.
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-lg">
                  We're always looking for operators, engineers, and advocates who want to help
                  close Africa's deep-tech gap.
                </p>
              </div>
              <Link
                to="/contact"
                className="relative group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium text-white transition-[filter] hover:brightness-110"
                style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
              >
                Get involved
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-md border border-hairline bg-white/[0.02] text-muted-foreground hover:text-white hover:border-brand-purple/60 transition-colors"
    >
      {children}
    </a>
  );
}

function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
