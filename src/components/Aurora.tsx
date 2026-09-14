import { motion, useReducedMotion } from "motion/react";

type AuroraProps = {
  className?: string;
};

export function Aurora({ className = "" }: AuroraProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <motion.div
        className="absolute -top-1/4 left-[10%] h-[45vw] w-[45vw] rounded-full bg-brand-purple/30 blur-[120px]"
        animate={reduced ? undefined : { x: [0, 60, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[10%] right-[5%] h-[38vw] w-[38vw] rounded-full bg-brand-blue/25 blur-[120px]"
        animate={reduced ? undefined : { x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-15%] left-[35%] h-[40vw] w-[40vw] rounded-full bg-brand-glow/20 blur-[140px]"
        animate={reduced ? undefined : { x: [0, 40, 0], y: [0, -35, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[45%] left-[45%] h-[20vw] w-[20vw] rounded-full bg-brand-pink/20 blur-[100px]"
        animate={reduced ? undefined : { x: [0, -30, 0], y: [0, 25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}