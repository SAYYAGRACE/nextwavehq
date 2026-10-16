"use client";

import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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

const SHOW_DELAY = 140;
const MIN_VISIBLE = 620;

export function NavigationOverlay() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [visible, setVisible] = useState(false);
  const [label, setLabel] = useState("");

  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shownAt = useRef(0);

  useEffect(() => {
    if (isLoading) {
      clearTimeout(hideTimer.current);
      showTimer.current = setTimeout(() => {
        setLabel(labelFor(pathname));
        shownAt.current = Date.now();
        setVisible(true);
      }, SHOW_DELAY);
    } else {
      clearTimeout(showTimer.current);
      if (visible) {
        const remaining = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt.current));
        hideTimer.current = setTimeout(() => setVisible(false), remaining);
      }
    }
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, [isLoading, pathname, visible]);

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          role="status"
          aria-live="polite"
          aria-label={`Loading ${label}`}
        >
          <div className="absolute inset-0 bg-background/85 backdrop-blur-2xl" />
          <div className="absolute inset-0 nav-overlay-grid opacity-[0.35]" />
          <div className="absolute left-1/2 top-1/2 h-[42rem] w-[42rem] nav-overlay-aurora" />

          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center"
          >
            <div className="relative h-28 w-28">
              <div className="absolute inset-0 rounded-full nav-overlay-ring-track" />
              <div className="absolute inset-0 rounded-full nav-overlay-ring" />
              <div className="absolute inset-0 nav-overlay-orbit">
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-glow shadow-[0_0_14px_var(--brand-glow)]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src="/icon-192.png"
                  alt=""
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl nav-overlay-logo"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center">
              <span className="text-[10px] font-medium tracking-[0.34em] uppercase text-muted-foreground">
                Nextwave
              </span>
              <span className="mt-2 text-sm font-medium text-white">
                Loading {label}
                <span className="nav-overlay-dots" />
              </span>
            </div>

            <div className="mt-5 h-[3px] w-48 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-1/3 rounded-full nav-overlay-bar" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
