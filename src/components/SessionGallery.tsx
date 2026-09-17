import session01 from "../assets/bootcamp/session-01.jpeg";
import session02 from "../assets/bootcamp/session-02-portrait.jpeg";
import session03 from "../assets/bootcamp/session-03.jpeg";
import session04 from "../assets/bootcamp/session-04-portrait.jpeg";
import session05 from "../assets/bootcamp/session-05-portrait.jpeg";
import { SpotlightCard } from "./SpotlightCard";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";

const PHOTOS = [
  {
    src: session01,
    alt: "Nextwave Bootcamp session in motion — Kaduna",
    w: 1280,
    h: 960,
    span: "",
  },
  {
    src: session02,
    alt: "Nextwave Bootcamp — students at work, Kaduna",
    w: 960,
    h: 1280,
    span: "",
  },
  {
    src: session03,
    alt: "Nextwave Bootcamp classroom — Kaduna",
    w: 1280,
    h: 864,
    span: "sm:col-span-2 lg:col-span-1",
  },
  {
    src: session04,
    alt: "Nextwave Bootcamp live session in motion — Kaduna",
    w: 698,
    h: 1080,
    span: "",
  },
  {
    src: session05,
    alt: "Nextwave Bootcamp students fully engaged — Kaduna",
    w: 726,
    h: 1080,
    span: "sm:col-span-2 lg:col-span-1",
  },
];

export function SessionGallery() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-5">
        Inside the movement <span className="gradient-text">— right now.</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PHOTOS.map((p, i) => (
          <Reveal key={p.src} delay={i * 80} className={p.span || ""}>
            <TiltCard maxTilt={5} className="h-full">
              <SpotlightCard className="group relative overflow-hidden rounded-2xl border border-hairline h-full hover-border-brand-purple/40">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 pointer-events-none">
                  <span className="text-xs font-medium text-white/90 tracking-widest uppercase">
                    Live session
                  </span>
                </div>
                <img
                  src={p.src}
                  alt={p.alt}
                  loading="lazy"
                  decoding="async"
                  width={p.w}
                  height={p.h}
                  className="h-56 sm:h-64 w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              </SpotlightCard>
            </TiltCard>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs tracking-widest uppercase text-muted-foreground">
        Live session · Kaduna · 2026
      </p>
    </div>
  );
}
