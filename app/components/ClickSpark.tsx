"use client";

// Adapted from React Bits (https://reactbits.dev) — ClickSpark. Instead of wrapping content,
// this is a fixed, screen-sized overlay that listens for clicks anywhere on the page, and each
// spark is a two-colour gradient from the same palette as the DotField stars.
import { useEffect, useRef } from "react";
import { STAR_PALETTE } from "./palette";

type Easing = "linear" | "ease-in" | "ease-in-out" | "ease-out";

type ClickSparkProps = {
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: Easing;
  extraScale?: number;
  lineWidth?: number;
};

type Spark = { x: number; y: number; angle: number; start: number; from: string; to: string };

const ease = (t: number, easing: Easing) => {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in":
      return t * t;
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t * (2 - t);
  }
};

const randomColor = (exclude: number[]) => {
  let c: number;
  do c = Math.floor(Math.random() * STAR_PALETTE.length);
  while (exclude.includes(c));
  return c;
};

export default function ClickSpark({
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  lineWidth = 2,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ sparkSize, sparkRadius, sparkCount, duration, easing, extraScale, lineWidth });
  propsRef.current = { sparkSize, sparkRadius, sparkCount, duration, easing, extraScale, lineWidth };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let sparks: Spark[] = [];
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const p = propsRef.current;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.lineWidth = p.lineWidth;
      ctx.lineCap = "round";

      sparks = sparks.filter((s) => {
        const elapsed = now - s.start;
        if (elapsed >= p.duration) return false;
        const eased = ease(Math.max(0, elapsed) / p.duration, p.easing);
        const distance = eased * p.sparkRadius * p.extraScale;
        const length = p.sparkSize * (1 - eased);
        const cos = Math.cos(s.angle);
        const sin = Math.sin(s.angle);
        const x1 = s.x + distance * cos;
        const y1 = s.y + distance * sin;
        const x2 = s.x + (distance + length) * cos;
        const y2 = s.y + (distance + length) * sin;

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, s.from);
        grad.addColorStop(1, s.to);
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });

      // Only keep animating while sparks are alive.
      raf = sparks.length ? requestAnimationFrame(draw) : 0;
    };

    const onClick = (e: MouseEvent) => {
      const p = propsRef.current;
      const now = performance.now();
      const colors: number[] = [];
      for (let i = 0; i < p.sparkCount; i++) {
        // Differ from the previous spark, and the last one also from the first (they're adjacent).
        const exclude = [colors[i - 1] ?? -1];
        if (i === p.sparkCount - 1) exclude.push(colors[0]);
        colors.push(randomColor(exclude));
      }
      colors.forEach((c, i) => {
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          angle: (2 * Math.PI * i) / p.sparkCount,
          start: now,
          from: STAR_PALETTE[c],
          to: STAR_PALETTE[randomColor([c])],
        });
      });
      if (!raf) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("click", onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
}
