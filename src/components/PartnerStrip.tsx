import hutsoftLogo from "../assets/partners/hutsoft.png";
import specterverseLogo from "../assets/partners/specterverse.png";

export function PartnerStrip() {
  return (
    <section className="relative py-16 lg:py-20 border-t border-hairline overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 text-center">
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-8">
          Approved and Partnered With
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
          <img
            src={hutsoftLogo}
            alt="Hutsoft Technologies"
            loading="lazy"
            decoding="async"
            className="h-12 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300"
          />
          <img
            src={specterverseLogo}
            alt="Specterverse Gaming"
            loading="lazy"
            decoding="async"
            className="h-12 sm:h-14 object-contain opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300"
          />
          <span className="text-sm sm:text-base font-semibold tracking-wide text-white/80 hover:text-white transition-colors duration-300 cursor-default">
            Muda International School
          </span>
        </div>
        <p className="mt-8 text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Nextwave operates from Kaduna — with the approval of schools and active participation of
          industry partners across Northern Nigeria.
        </p>
      </div>
    </section>
  );
}
