import session01 from "../assets/bootcamp/session-01.jpeg";
import session02 from "../assets/bootcamp/session-02-portrait.jpeg";
import session03 from "../assets/bootcamp/session-03.jpeg";
import { SpotlightCard } from "./SpotlightCard";
import { Reveal } from "./Reveal";

const PHOTOS = [
  {
    src: session01,
    alt: "Nextwave Bootcamp session in motion — Kawo, Kaduna",
    w: 1280,
    h: 960,
    span: "",
  },
  {
    src: session02,
    alt: "Nextwave Bootcamp — students at work, Kawo, Kaduna",
    w: 960,
    h: 1280,
    span: "",
  },
  {
    src: session03,
    alt: "Nextwave Bootcamp classroom — Kawo, Kaduna",
    w: 1280,
    h: 864,
    span: "sm:col-span-2 lg:col-span-1",
  },
];

export function SessionGallery() {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white mb-5">Inside the movement — right now.</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PHOTOS.map((p, i) => (
          <Reveal key={p.src} delay={i * 80} className={p.span || ""}>
            <SpotlightCard className="overflow-hidden rounded-2xl border border-hairline h-full">
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                decoding="async"
                width={p.w}
                height={p.h}
                className="h-56 sm:h-64 w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs tracking-widest uppercase text-muted-foreground">
        Live session · Kawo, Kaduna · 2026
      </p>
    </div>
  );
}
