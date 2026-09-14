import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue, useReducedMotion } from "motion/react";

export function CursorGlow() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 400, damping: 40 });
  const sy = useSpring(y, { stiffness: 400, damping: 40 });
  const haloX = useSpring(x, { stiffness: 100, damping: 25 });
  const haloY = useSpring(y, { stiffness: 100, damping: 25 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFine = window.matchMedia("(pointer: fine)").matches;
    if (!isFine || reduced) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [reduced, x, y]);

  if (!enabled) return null;

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-[80] hidden lg:block" aria-hidden>
      <motion.div
        className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-glow"
        style={{ left: x, top: y }}
      />
      <motion.div
        className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-glow/40"
        style={{ left: haloX, top: haloY }}
      />
      <motion.div
        className="absolute h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: haloX,
          top: haloY,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--brand-purple) 12%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}