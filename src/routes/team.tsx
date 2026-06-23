import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SectionEyebrow } from "@/components/SectionEyebrow";
import { Linkedin, Github } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team & Leadership — Nextwave" },
      { name: "description", content: "Meet the strategic minds directing Nextwave's developmental programs, tech advocacy, and operational framework." },
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
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("");
}

function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative pt-32 pb-20 lg:pt-44">
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <SectionEyebrow>Leadership</SectionEyebrow>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-4xl">
            Executive Leadership <span className="gradient-text">& Operations.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Meet the strategic minds directing Nextwave's developmental programs, tech advocacy, and
            operational framework.
          </p>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {LEADERS.map((p) => (
              <article
                key={p.name}
                className="group relative rounded-2xl glass gradient-border p-7 transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] rounded-xl border border-hairline bg-gradient-to-br from-white/[0.04] to-white/[0.01] overflow-hidden">
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-5xl font-bold text-white/10 tracking-tight">
                      {initials(p.name)}
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
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
              </article>
            ))}
          </div>
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
