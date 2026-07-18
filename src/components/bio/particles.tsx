"use client";

import { useEffect, useRef } from "react";

interface Props {
  color: string;
  density: number; // 0-100
  stars: boolean;
  particles: boolean;
  rain: boolean;
}

/** One full-screen canvas that renders twinkling stars, floating particles, and
 *  falling rain — whichever the owner enabled. Cheap, GPU-friendly, cleaned up
 *  on unmount, and disabled under prefers-reduced-motion. */
export function Particles({ color, density, stars, particles, rain }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const scale = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    scale();

    const n = Math.round((density / 100) * 90) + 10;

    const starField = stars
      ? Array.from({ length: n }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          tw: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.02 + 0.005,
        }))
      : [];

    const dust = particles
      ? Array.from({ length: Math.round(n * 0.7) }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 2.2 + 0.6,
          vy: -(Math.random() * 0.4 + 0.1),
          vx: (Math.random() - 0.5) * 0.2,
          a: Math.random() * 0.5 + 0.2,
        }))
      : [];

    const drops = rain
      ? Array.from({ length: Math.round(n * 0.8) }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          len: Math.random() * 14 + 6,
          vy: Math.random() * 6 + 4,
        }))
      : [];

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const s of starField) {
        s.tw += s.sp;
        const op = (Math.sin(s.tw) + 1) / 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2 + op * 0.8;
        ctx.fill();
      }

      for (const d of dust) {
        d.y += d.vy;
        d.x += d.vx;
        if (d.y < -5) {
          d.y = h + 5;
          d.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = d.a;
        ctx.fill();
      }

      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      for (const r of drops) {
        r.y += r.vy;
        if (r.y > h) {
          r.y = -r.len;
          r.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x, r.y + r.len);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => scale();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [color, density, stars, particles, rain]);

  if (!stars && !particles && !rain) return null;
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[5]" aria-hidden />;
}
