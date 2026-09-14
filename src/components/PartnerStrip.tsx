import { SITE } from "@/lib/site";
import hutsoftLogo from "../assets/partners/hutsoft.png";

export function PartnerStrip() {
  return (
    <section className="relative py-16 lg:py-20 border-t border-hairline">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 text-center">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-8">
          Approved and Partnered With
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80">
          {/* Hutsoft — real logo */}
          <img
            src={hutsoftLogo}
            alt="Hutsoft Technologies"
            loading="lazy"
            decoding="async"
            className="h-7 sm:h-8 object-contain"
          />
          {/* Specterverse — wordmark fallback */}
          <span className="text-sm sm:text-base font-semibold tracking-wide text-white/80">
            Specterverse Gaming
          </span>
          {/* Muda International School — wordmark fallback */}
          <span className="text-sm sm:text-base font-semibold tracking-wide text-white/80">
            Muda International School
          </span>
        </div>
        <p className="mt-8 text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Nextwave operates from Kawo, Kaduna — with the approval of schools and active
          participation of industry partners across Northern Nigeria.
        </p>
      </div>
    </section>
  );
}
