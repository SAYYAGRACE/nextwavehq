import { useCallback, useEffect, useState } from "react";
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
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setActive((cur) => (cur === null ? cur : (cur + dir + PHOTOS.length) % PHOTOS.length)),
    [],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, step]);

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
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View full image: ${p.alt}`}
                  className="absolute inset-0 z-20 cursor-zoom-in"
                />
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
        Click any photo to view it in full
      </p>

      {active !== null && PHOTOS[active] && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={PHOTOS[active].alt}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close full image"
            className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-hairline bg-white/5 text-white/90 hover:bg-white/15 transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5"
            >
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>

          {PHOTOS.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                aria-label="Previous photo"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 grid h-11 w-11 place-items-center rounded-full border border-hairline bg-black/40 text-white/90 hover:bg-white/15 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-5 w-5"
                >
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                aria-label="Next photo"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 grid h-11 w-11 place-items-center rounded-full border border-hairline bg-black/40 text-white/90 hover:bg-white/15 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className="h-5 w-5"
                >
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}

          <figure
            className="max-w-full max-h-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={PHOTOS[active].src}
              alt={PHOTOS[active].alt}
              className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
            />
            <figcaption className="mt-4 text-center text-sm text-white/80">
              {PHOTOS[active].alt}
              {PHOTOS.length > 1 && (
                <span className="ml-2 text-white/40">
                  {active + 1} / {PHOTOS.length}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
