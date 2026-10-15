"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "nextwave.cookie-consent";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          role="dialog"
          aria-modal="true"
          aria-label="Cookie notice"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl glass-strong border border-hairline p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Cookie className="h-5 w-5 shrink-0 text-brand-glow" />
            <p className="flex-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We use essential cookies and limited analytics to run this site and understand how it
              is used. See our{" "}
              <Link to="/privacy" className="text-brand-glow hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={dismiss}
                className="rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "var(--gradient-brand)" }}
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
