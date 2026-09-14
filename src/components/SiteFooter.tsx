import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { SITE } from "@/lib/site";
import { ExternalLink, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 border-t border-hairline">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
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
            <div className="mt-6 flex flex-wrap gap-3">
              {SITE.phone.whatsapp && (
                <a
                  href={`https://wa.me/${SITE.phone.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground hover:text-white hover:border-brand-purple/50 transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              )}
              <a
                href={SITE.socials.x.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground hover:text-white hover:border-brand-purple/50 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {SITE.socials.x.handle}
              </a>
              <a
                href={SITE.socials.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white/[0.04] px-4 py-2 text-xs text-muted-foreground hover:text-white hover:border-brand-purple/50 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {SITE.socials.instagram.handle}
              </a>
            </div>
          </div>

          <FooterCol
            title="Ecosystem"
            links={[
              { to: "/about", label: "About" },
              { to: "/projects", label: "Projects" },
              { to: "/team", label: "Team" },
              { to: "/news", label: "Updates" },
            ]}
          />
          <FooterCol
            title="Engage"
            links={[
              { to: "/contact", label: "Contact" },
              { to: "/contact", label: "Partner With Us" },
              { to: "/contact", label: "Volunteer" },
            ]}
          />
          <FooterCol
            title="Location"
            links={[
              { to: "/contact", label: `${SITE.location.area}, ${SITE.location.city}` },
              { to: "/contact", label: SITE.email },
            ]}
            suffix={
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                {SITE.location.full}
                <br />
                {SITE.name}
              </p>
            }
          />
        </div>

        <div className="mt-14 pt-8 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2024–2026 {SITE.legalName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Engineered in {SITE.location.area} · Built for the continent.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  suffix,
}: {
  title: string;
  links: { to: string; label: string }[];
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold tracking-widest uppercase text-white/90">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l, i) => (
          <li key={i}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      {suffix}
    </div>
  );
}
