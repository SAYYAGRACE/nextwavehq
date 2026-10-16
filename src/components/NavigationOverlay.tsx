"use client";

import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SHOW_DELAY = 150;
const MIN_VISIBLE = 450;

export function NavigationOverlay() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [visible, setVisible] = useState(false);
  const shownRef = useRef(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const shownAt = useRef(0);

  useEffect(() => {
    if (isLoading) {
      clearTimeout(hideTimer.current);
      if (!shownRef.current) {
        showTimer.current = setTimeout(() => {
          if (shownRef.current) return;
          shownRef.current = true;
          shownAt.current = Date.now();
          setVisible(true);
        }, SHOW_DELAY);
      }
    } else {
      clearTimeout(showTimer.current);
      if (shownRef.current) {
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
  }, [isLoading, pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="nav-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 top-0 z-[200]"
          role="status"
          aria-live="polite"
          aria-label="Loading page"
        >
          <div className="h-[3px] w-full overflow-hidden">
            <motion.div
              className="h-full w-1/3"
              style={{ background: "var(--gradient-brand)" }}
              initial={{ x: "-100%" }}
              animate={{ x: "320%" }}
              transition={{ duration: 0.9, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
