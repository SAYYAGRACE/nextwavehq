"use client";

import { useRouterState } from "@tanstack/react-router";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import nextwaveLogo from "../assets/nextwave.png";

const DESTINATIONS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/projects": "Projects",
  "/readiness": "Readiness",
  "/readiness/methodology": "Methodology",
  "/team": "Team",
  "/news": "Updates",
  "/contact": "Contact",
  "/privacy": "Privacy",
  "/terms": "Terms",
};

function labelFor(pathname: string) {
  if (DESTINATIONS[pathname]) return DESTINATIONS[pathname];
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/readiness")) return "Readiness";
  if (pathname.startsWith("/news")) return "Updates";
  const seg = pathname.split("/").filter(Boolean)[0];
  if (!seg) return "Home";
  return seg.charAt(0).toUpperCase() + seg.slice(1);
}

const SHOW_DELAY = 150;
const MIN_VISIBLE = 1000;

const EASE = [0.22, 1, 0.36, 1] as const;

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: EASE, staggerChildren: 0.08, delayChildren: 0.04 },
  },
  exit: { opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 1, 1] } },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(12px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 200, damping: 26, mass: 0.9 },
  },
  exit: {
    opacity: 0,
    scale: 1.06,
    filter: "blur(6px)",
    transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
  },
};

const reactorVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 170, damping: 22 } },
  exit: {
    opacity: 0,
    scale: 1.5,
    transition: { duration: 0.5, ease: [0.4, 0, 1, 1] },
  },
};

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.35, ease: EASE } },
};

function Reactor() {
  return (
    <div className="relative h-56 w-56 sm:h-64 sm:w-64">
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="nloRingA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4d7df0" stopOpacity="0" />
            <stop offset="52%" stopColor="#7c5cf0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#9a7af0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="nloRingB" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9a7af0" stopOpacity="0" />
            <stop offset="50%" stopColor="#4d7df0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c5cf0" stopOpacity="0" />
          </linearGradient>
        </defs>

        <circle
          cx="100"
          cy="100"
          r="96"
          fill="none"
          stroke="color-mix(in oklab, var(--brand-purple) 18%, transparent)"
          strokeWidth="1"
        />
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="color-mix(in oklab, var(--brand-purple) 12%, transparent)"
          strokeWidth="1"
        />

        <g className="nlo-spin">
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="url(#nloRingA)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="150 453"
          />
        </g>
        <g className="nlo-spin--rev">
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="url(#nloRingB)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="90 438"
          />
        </g>
        <g className="nlo-spin--slow">
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke="color-mix(in oklab, var(--brand-glow) 70%, transparent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="1.5 9.4"
          />
        </g>
      </svg>

      <div className="absolute inset-0 nlo-orbit">
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-glow nlo-comet" />
      </div>
      <div className="absolute inset-0 nlo-orbit--rev">
        <span className="absolute left-1/2 top-[8.5%] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-blue nlo-comet" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <img
            src={nextwaveLogo}
            alt="Nextwave"
            width={480}
            height={135}
            className="nlo-mark max-h-12 max-w-[62%] object-contain sm:max-h-14"
          />
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <span
              className="nlo-sheen"
              style={{
                WebkitMaskImage: `url(${nextwaveLogo})`,
                maskImage: `url(${nextwaveLogo})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                WebkitMaskSize: "contain",
                maskSize: "contain",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function NavigationOverlay() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");

  const progress = useMotionValue(0);
  const ramp = useRef<ReturnType<typeof animate> | undefined>(undefined);
  const shownRef = useRef(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shownAt = useRef(0);

  const fillWidth = useTransform(progress, (v) => `${Math.max(2, v * 100)}%`);
  const percent = useTransform(progress, (v) => Math.round(v * 100));

  useEffect(() => {
    if (isLoading) {
      clearTimeout(hideTimer.current);
      if (shownRef.current) {
        // Rapid re-navigation while already visible — keep it up, don't reset.
        ramp.current?.stop();
        const cur = progress.get();
        ramp.current = animate(progress, 0.9, {
          duration: Math.max(0.4, 9 * (0.9 - cur)),
          ease: "easeOut",
        });
      } else {
        showTimer.current = setTimeout(() => {
          if (shownRef.current) return;
          shownRef.current = true;
          setLabel(labelFor(pathname));
          shownAt.current = Date.now();
          setVisible(true);
          ramp.current?.stop();
          progress.set(0.06);
          ramp.current = animate(progress, 0.9, { duration: 9, ease: "easeOut" });
        }, SHOW_DELAY);
      }
    } else {
      clearTimeout(showTimer.current);
      if (shownRef.current) {
        ramp.current?.stop();
        ramp.current = animate(progress, 1, { duration: 0.4, ease: "easeOut" });
        const remaining = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt.current));
        hideTimer.current = setTimeout(() => {
          shownRef.current = false;
          setVisible(false);
        }, remaining);
      }
    }
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, [isLoading, pathname, progress]);

  useEffect(() => {
    if (!visible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nav-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
          role="status"
          aria-live="polite"
          aria-label={`Loading ${label}`}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />

          <div className="absolute inset-0 overflow-hidden">
            <span className="nlo-aurora nlo-aurora--a left-[14%] top-[20%] block h-[26rem] w-[26rem]" />
            <span className="nlo-aurora nlo-aurora--b bottom-[16%] right-[12%] block h-[24rem] w-[24rem]" />
          </div>

          <div className="absolute inset-0 nlo-grid opacity-60" />
          <div className="absolute inset-0 nlo-vignette" />

          <motion.div
            variants={contentVariants}
            className="relative flex flex-col items-center px-6"
          >
            <motion.div variants={reactorVariants}>
              <Reactor />
            </motion.div>

            <motion.div variants={stageVariants} className="mt-10 flex flex-col items-center">
              <span className="text-[10px] font-medium tracking-[0.42em] uppercase text-muted-foreground">
                Nextwave Infotech
              </span>
              <span className="mt-2.5 text-sm font-medium text-white">
                Loading {label}
                <span className="nlo-dots" />
              </span>
            </motion.div>

            <motion.div variants={stageVariants} className="mt-6 flex items-center gap-3">
              <div className="relative h-1 w-52 overflow-hidden rounded-full nlo-track sm:w-64">
                <motion.div className="h-full rounded-full nlo-fill" style={{ width: fillWidth }} />
              </div>
              <motion.span className="w-9 text-right text-xs font-medium tabular-nums text-muted-foreground">
                {percent}
              </motion.span>
            </motion.div>

            <motion.div
              variants={stageVariants}
              className="mt-7 flex h-6 items-end gap-1.5"
              aria-hidden="true"
            >
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  className="nlo-bar block w-1 rounded-full"
                  style={{
                    height: `${[14, 22, 18, 26, 16, 24, 12][i]}px`,
                    animationDelay: `${i * 0.11}s`,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
