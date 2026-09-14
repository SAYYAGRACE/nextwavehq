"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 32, mass: 0.3 });

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-brand-blue via-brand-purple to-brand-glow"
      style={{ scaleX }}
    />
  );
}
