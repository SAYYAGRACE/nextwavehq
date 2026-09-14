import { useRef, type MouseEvent, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
};

export function TiltCard({ children, className = "", maxTilt = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const springRx = useSpring(rx, { stiffness: 200, damping: 20 });
  const springRy = useSpring(ry, { stiffness: 200, damping: 20 });
  const springGx = useSpring(gx, { stiffness: 200, damping: 20 });
  const springGy = useSpring(gy, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(springRx, (v) => `${v.toFixed(2)}deg`);
  const rotateY = useTransform(springRy, (v) => `${v.toFixed(2)}deg`);
  const glow = useTransform(
    [springGx, springGy] as MotionValue<number>[],
    ([x, y]) =>
      `radial-gradient(420px circle at ${x}% ${y}%, color-mix(in oklab, var(--brand-purple) 22%, transparent), transparent 65%)`,
  );

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rx.set((0.5 - py) * maxTilt * -1);
    ry.set((px - 0.5) * maxTilt);
    gx.set(px * 100);
    gy.set(py * 100);
  }

  function handleLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 900,
      }}
      className={`group ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-[1]"
        style={{ background: glow }}
        aria-hidden
      />
      <div className="relative z-[2]">{children}</div>
    </motion.div>
  );
}
