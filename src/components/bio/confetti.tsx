"use client";

import { useEffect, useRef } from "react";

/** A one-shot confetti burst that plays for ~2.5s when mounted (on enter). */
export function Confetti({ colors }: { colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = (canvas.width = window.innerWidth * dpr);
    const h = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    const N = 160;
    const parts = Array.from({ length: N }, () => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.3,
      y: h * 0.35 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 16 * dpr,
      vy: (Math.random() * -14 - 6) * dpr,
      size: (Math.random() * 6 + 4) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
    }));

    const g = 0.45 * dpr;
    const start = performance.now();
    let raf = 0;

    const draw = (t: number) => {
      const elapsed = t - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.vy += g;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99;
        p.rot += p.vr;
        if (elapsed > 1600) p.life -= 0.02;
        if (p.life <= 0) continue;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      if (elapsed < 2600) raf = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [colors]);

  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[55]" aria-hidden />;
}
