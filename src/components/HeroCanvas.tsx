"use client";

import { useEffect, useRef } from "react";

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame: number;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = canvas.parentElement?.offsetHeight ?? window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // Aurora blobs config
    const blobs = [
      { x: 0.25, y: 0.3, rx: 0.3, ry: 0.15, color: "100,120,240", speed: 0.0007, phase: 0 },
      { x: 0.7, y: 0.55, rx: 0.28, ry: 0.14, color: "130,80,240", speed: 0.0005, phase: 2.1 },
      { x: 0.5, y: 0.7, rx: 0.35, ry: 0.12, color: "80,160,230", speed: 0.0009, phase: 4.2 },
    ];

    const draw = () => {
      const w = window.innerWidth;
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      blobs.forEach((b) => {
        const cx = b.x * w + Math.sin(t * b.speed + b.phase) * w * 0.08;
        const cy = b.y * h + Math.cos(t * b.speed * 1.3 + b.phase) * h * 0.06;
        const rx = b.rx * w;
        const ry = b.ry * h;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        grad.addColorStop(0, `rgba(${b.color}, 0.22)`);
        grad.addColorStop(0.6, `rgba(${b.color}, 0.08)`);
        grad.addColorStop(1, `rgba(${b.color}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      t++;
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
