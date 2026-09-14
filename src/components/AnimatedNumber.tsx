"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

export function AnimatedNumber({
  value,
  suffix = "",
  delay = 0,
}: {
  value: number;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView || !ref.current || reduced) return;
    const controls = animate(0, value, {
      duration: 1.2,
      delay,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const el = ref.current;
        if (!el) return;
        el.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, value, suffix, delay, reduced]);

  return (
    <span ref={ref} className="tabular-nums">
      {reduced ? `${value}${suffix}` : `0${suffix}`}
    </span>
  );
}
