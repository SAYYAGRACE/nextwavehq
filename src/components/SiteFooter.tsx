import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-hairline">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo variant="square" className="h-8 w-8" />
              <span className="text-lg font-semibold text-white">
                Next<span className="text-brand-glow">Wave</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              A youth-led deep-tech movement bridging Africa's technological gap in AI,
              biotechnology, and digital health — originating from Northern Nigeria.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-purple/40 bg-brand-purple/10 px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-glow opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-glow" />
              </span>
              <span className="text-[11px] font-medium tracking-widest uppercase text-brand-glow">
                Now enrolling · Cohort 02
              </span>
            </div>
          </div>

          <FooterCol
            title="Ecosystem"
            links={[
              { to: "/about", label: "About" },
              { to: "/projects", label: "Projects" },
              { to: "/team", label: "Team" },
            ]}
          />
          <FooterCol
            title="Engage"
            links={[
              { to: "/contact", label: "Contact" },
              { to: "/", hash: "bootcamp", label: "Bootcamp" },
              { to: "/", hash: "nerdhaven", label: "NerdHaven" },
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { to: "/about", label: "Manifesto" },
              { to: "/team", label: "Leadership" },
              { to: "/contact", label: "Partnerships" },
            ]}
          />
        </div>

        <div className="mt-14 pt-8 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Nextwave Infotech. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Engineered in Northern Nigeria · Built for the continent.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string; hash?: string }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest uppercase text-white/90">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l, i) => (
          <li key={i}>
            <Link
              to={l.to}
              hash={l.hash}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
