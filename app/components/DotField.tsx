"use client";

// Adapted from React Bits (https://reactbits.dev) — DotField.
import { memo, useEffect, useId, useRef, type HTMLAttributes } from "react";
import { createIridescence, type Iridescence } from "./iridescence";
import { STAR_PALETTE } from "./palette";
import "./DotField.css";

const TWO_PI = Math.PI * 2;

// Holographic overlay: dots near the cursor are drawn as a mask (bucketed by fade level)
// and filled with the iridescence shader, so each frame is a handful of fills.
const HOLO_ALPHAS = 8;

// Unit star outlines for 5–12 points (outer radius 1), precomputed so each frame only
// rotates and scales them. Index = number of points.
const STAR_MIN_POINTS = 5;
const STAR_MAX_POINTS = 12;
const STAR_INNER = 0.45;
const STAR_SHAPES: Float32Array[] = [];
for (let n = STAR_MIN_POINTS; n <= STAR_MAX_POINTS; n++) {
  const verts = new Float32Array(n * 4);
  for (let v = 0; v < n * 2; v++) {
    const r = v % 2 === 0 ? 1 : STAR_INNER;
    const ang = (v * Math.PI) / n - Math.PI / 2;
    verts[v * 2] = Math.cos(ang) * r;
    verts[v * 2 + 1] = Math.sin(ang) * r;
  }
  STAR_SHAPES[n] = verts;
}

// How far apart (in degrees of hue) a star's two gradient colours may be. 180 allows any
// pairing, including opposites; lower it (e.g. 60) to keep each gradient in one colour family.
const STAR_GRADIENT_MAX_HUE = 180;

function hexHue(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (d === 0) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
}

// For each palette colour, the other palette colours close enough in hue to pair with it
// (falling back to the single nearest hue if nothing is within range).
const STAR_PARTNERS: number[][] = STAR_PALETTE.map((hex, i) => {
  const hue = hexHue(hex);
  const dists = STAR_PALETTE.map((other, j) => {
    const diff = Math.abs(hexHue(other) - hue);
    return j === i ? Infinity : Math.min(diff, 360 - diff);
  });
  const close = dists.flatMap((dist, j) => (dist <= STAR_GRADIENT_MAX_HUE ? [j] : []));
  return close.length ? close : [dists.indexOf(Math.min(...dists))];
});

// Each star's max size is starSize × a random factor (skewed so most are small and a few
// are large), and it eases in/out at its own rate.
const STAR_SIZE_MIN = 0.3;
const STAR_SIZE_MAX = 1.9;
const STAR_SIZE_SKEW = 1.8;
const STAR_RATE_MIN = 0.03;
const STAR_RATE_MAX = 0.2;

type Dot = {
  ax: number;
  ay: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
  // Star shape used when hovered: point count, resting angle, spin speed (rad/s, signed).
  points: number;
  rot: number;
  spin: number;
  color: number;
  // Second gradient colour, and whether the gradient is radial (centre → tips) or linear (tip → tip).
  color2: number;
  radial: boolean;
  sizeMul: number;
  growRate: number;
  grow: number;
  // Click-burst displacement applied this frame (also used when drawing the star).
  ox: number;
  oy: number;
};

type DotFieldProps = {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  gradientFrom?: string;
  gradientTo?: string;
  glowColor?: string;
  holographic?: boolean;
  holoRadius?: number;
  holoColor?: [number, number, number];
  holoSpeed?: number;
  holoContrast?: number;
  holoStars?: boolean;
  starSize?: number;
  scrollWithPage?: boolean;
  burstRadius?: number;
  burstStrength?: number;
  burstDuration?: number;
} & HTMLAttributes<HTMLDivElement>;

const DotField = memo(function DotField({
  dotRadius = 1.5,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.1,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  sparkle = false,
  waveAmplitude = 0,
  gradientFrom = "rgba(168, 85, 247, 0.35)",
  gradientTo = "rgba(180, 151, 207, 0.25)",
  glowColor = "#120F17",
  holographic = false,
  holoRadius = 180,
  holoColor = [1, 1, 1],
  holoSpeed = 1,
  holoContrast = 0.7,
  holoStars = false,
  starSize = 4.5,
  scrollWithPage = false,
  burstRadius = 0,
  burstStrength = 18,
  burstDuration = 700,
  ...rest
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0, inside: false });
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  // Grid geometry, so the frame loop can visit only the rows currently on screen.
  const gridRef = useRef({ cols: 0, rows: 0, step: 1, padY: 0 });
  const glowOpacity = useRef(0);
  const engagement = useRef(0);
  const holoAmount = useRef(0);
  const propsRef = useRef({ dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, sparkle, waveAmplitude, gradientFrom, gradientTo, holographic, holoRadius, holoColor, holoSpeed, holoContrast, holoStars, starSize, scrollWithPage, burstRadius, burstStrength, burstDuration });
  propsRef.current = { dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, sparkle, waveAmplitude, gradientFrom, gradientTo, holographic, holoRadius, holoColor, holoSpeed, holoContrast, holoStars, starSize, scrollWithPage, burstRadius, burstStrength, burstDuration };
  const rebuildRef = useRef<(() => void) | null>(null);
  // useId is identical on server and client (Math.random() caused a hydration mismatch);
  // strip React's punctuation so it's safe inside url(#...).
  const glowId = `dot-field-glow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    const glowEl = glowRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const holoCanvas = document.createElement("canvas");
    const holoCtx = holoCanvas.getContext("2d");
    let iri: Iridescence | null = null;

    function resize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(doResize, 100);
    }

    function doResize() {
      const rect = canvas!.parentElement!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      sizeRef.current = { w, h };
      holoCanvas.width = w * dpr;
      holoCanvas.height = h * dpr;
      holoCtx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      iri?.resize(w, h);
      buildDots(w, h);
    }

    function buildDots(w: number, viewH: number) {
      const p = propsRef.current;
      // In scroll mode the grid spans the whole document (in page coordinates) so it moves
      // with the content; otherwise it's just the viewport.
      const h = p.scrollWithPage ? Math.max(viewH, document.documentElement.scrollHeight) : viewH;
      const step = p.dotRadius + p.dotSpacing;
      const cols = Math.floor(w / step);
      const rows = Math.floor(h / step);
      const padX = (w % step) / 2;
      const padY = (h % step) / 2;
      const dots: Dot[] = new Array(rows * cols);
      let idx = 0;
      const taken = new Set<number>();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const ax = padX + col * step + step / 2;
          const ay = padY + row * step + step / 2;
          // Pick a colour none of the already-placed touching neighbours (left, and the three
          // above) use, so no two adjacent stars match.
          taken.clear();
          if (col > 0) taken.add(dots[idx - 1].color);
          if (row > 0) {
            taken.add(dots[idx - cols].color);
            if (col > 0) taken.add(dots[idx - cols - 1].color);
            if (col < cols - 1) taken.add(dots[idx - cols + 1].color);
          }
          let color: number;
          do color = Math.floor(Math.random() * STAR_PALETTE.length);
          while (taken.has(color));
          dots[idx++] = {
            ax,
            ay,
            sx: ax,
            sy: ay,
            vx: 0,
            vy: 0,
            x: ax,
            y: ay,
            points: STAR_MIN_POINTS + Math.floor(Math.random() * (STAR_MAX_POINTS - STAR_MIN_POINTS + 1)),
            rot: Math.random() * TWO_PI,
            spin: (0.4 + Math.random() * 0.8) * (Math.random() < 0.5 ? -1 : 1),
            color,
            color2: STAR_PARTNERS[color][Math.floor(Math.random() * STAR_PARTNERS[color].length)],
            radial: (row + col) % 2 === 0,
            sizeMul: STAR_SIZE_MIN + Math.random() ** STAR_SIZE_SKEW * (STAR_SIZE_MAX - STAR_SIZE_MIN),
            growRate: STAR_RATE_MIN + Math.random() * (STAR_RATE_MAX - STAR_RATE_MIN),
            grow: 0,
            ox: 0,
            oy: 0,
          };
        }
      }
      dotsRef.current = dots;
      gridRef.current = { cols, rows, step, padY };
    }

    // Measure against the live viewport rect so this stays correct when the field is
    // position: fixed and the page scrolls underneath it.
    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.inside = true;
    }

    // Click shockwaves, in the same (page) coordinates as the dots.
    const bursts: { x: number; y: number; start: number; env: number }[] = [];
    function onClick(e: MouseEvent) {
      if (propsRef.current.burstRadius <= 0) return;
      const rect = canvas!.getBoundingClientRect();
      const scrollY = propsRef.current.scrollWithPage ? window.scrollY : 0;
      bursts.push({ x: e.clientX - rect.left, y: e.clientY - rect.top + scrollY, start: performance.now(), env: 0 });
    }

    function onMouseLeave() {
      mouseRef.current.inside = false;
    }

    function updateMouseSpeed() {
      const m = mouseRef.current;
      const dx = m.prevX - m.x;
      const dy = m.prevY - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.speed += (dist - m.speed) * 0.5;
      if (m.speed < 0.001) m.speed = 0;
      m.prevX = m.x;
      m.prevY = m.y;
    }

    const speedInterval = setInterval(updateMouseSpeed, 20);

    let frameCount = 0;
    const holoBuckets: number[][] = Array.from({ length: HOLO_ALPHAS }, () => []);
    // Star mode: indices of the dots currently showing as stars.
    const activeStars: number[] = [];

    function tick() {
      frameCount++;
      const dots = dotsRef.current;
      const m = mouseRef.current;
      const { w, h } = sizeRef.current;
      const p = propsRef.current;
      const t = frameCount * 0.02;
      // Page scroll offset: dots live in page coordinates and are drawn shifted up by it.
      const scrollY = p.scrollWithPage ? window.scrollY : 0;
      const my = m.y + scrollY;
      const grid = gridRef.current;
      const firstRow = Math.max(0, Math.floor((scrollY - grid.padY) / grid.step) - 2);
      const lastRow = Math.min(grid.rows, Math.ceil((scrollY + h - grid.padY) / grid.step) + 2);
      const len = Math.min(dots.length, lastRow * grid.cols);

      // Each burst swells out and settles back: envelope 0 → 1 → 0 over burstDuration.
      const nowMs = performance.now();
      for (let b = bursts.length - 1; b >= 0; b--) {
        const age = (nowMs - bursts[b].start) / p.burstDuration;
        if (age >= 1) bursts.splice(b, 1);
        else bursts[b].env = Math.sin(Math.PI * age);
      }
      const br = p.burstRadius;
      const brSq = br * br;

      const targetEngagement = Math.min(m.speed / 5, 1);
      engagement.current += (targetEngagement - engagement.current) * 0.06;
      if (engagement.current < 0.001) engagement.current = 0;
      const eng = engagement.current;

      glowOpacity.current += (eng - glowOpacity.current) * 0.08;

      holoAmount.current += ((p.holographic && m.inside ? 1 : 0) - holoAmount.current) * 0.1;
      const holo = holoAmount.current;
      const hr = p.holoRadius;
      const hrSq = hr * hr;
      if (holo > 0.01) for (const b of holoBuckets) b.length = 0;
      // Stars keep shrinking after the cursor leaves, so their buckets refill every frame.
      if (p.holoStars) activeStars.length = 0;

      if (glowEl) {
        glowEl.setAttribute("cx", String(m.x));
        glowEl.setAttribute("cy", String(m.y));
        glowEl.style.opacity = String(glowOpacity.current);
      }

      ctx!.clearRect(0, 0, w, h);

      const grad = ctx!.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, p.gradientFrom);
      grad.addColorStop(1, p.gradientTo);
      ctx!.fillStyle = grad;

      const cr = p.cursorRadius;
      const crSq = cr * cr;
      const rad = p.dotRadius / 2;
      const isBulge = p.bulgeOnly;

      ctx!.beginPath();

      for (let i = firstRow * grid.cols; i < len; i++) {
        const d = dots[i];
        const dx = m.x - d.ax;
        const dy = my - d.ay;
        const distSq = dx * dx + dy * dy;

        if (distSq < crSq && eng > 0.01) {
          const dist = Math.sqrt(distSq);
          if (isBulge) {
            const t = 1 - dist / cr;
            const push = t * t * p.bulgeStrength * eng;
            const angle = Math.atan2(dy, dx);
            d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15;
            d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15;
          } else {
            const angle = Math.atan2(dy, dx);
            const move = (500 / dist) * (m.speed * p.cursorForce);
            d.vx += Math.cos(angle) * -move;
            d.vy += Math.sin(angle) * -move;
          }
        } else if (isBulge) {
          d.sx += (d.ax - d.sx) * 0.1;
          d.sy += (d.ay - d.sy) * 0.1;
        }

        if (!isBulge) {
          d.vx *= 0.9;
          d.vy *= 0.9;
          d.x = d.ax + d.vx;
          d.y = d.ay + d.vy;
          d.sx += (d.x - d.sx) * 0.1;
          d.sy += (d.y - d.sy) * 0.1;
        }

        let drawX = d.sx;
        let drawY = d.sy - scrollY;

        // Click bursts push dots outward from the click and pop them into stars.
        let pop = 0;
        d.ox = 0;
        d.oy = 0;
        for (let b = 0; b < bursts.length; b++) {
          const bx = d.ax - bursts[b].x;
          const by = d.ay - bursts[b].y;
          const bdSq = bx * bx + by * by;
          if (bdSq >= brSq || bdSq === 0) continue;
          const bd = Math.sqrt(bdSq);
          const k = 1 - bd / br;
          const amp = k * k * bursts[b].env * p.burstStrength;
          d.ox += (bx / bd) * amp;
          d.oy += (by / bd) * amp;
          pop = Math.max(pop, k * bursts[b].env);
        }
        drawX += d.ox;
        drawY += d.oy;
        if (p.waveAmplitude > 0) {
          drawY += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
          drawX += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
        }

        if (p.sparkle) {
          const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0;
          if (hash % 100 < 3) {
            ctx!.moveTo(drawX + rad * 1.8, drawY);
            ctx!.arc(drawX, drawY, rad * 1.8, 0, TWO_PI);
          } else {
            ctx!.moveTo(drawX + rad, drawY);
            ctx!.arc(drawX, drawY, rad, 0, TWO_PI);
          }
        } else {
          ctx!.moveTo(drawX + rad, drawY);
          ctx!.arc(drawX, drawY, rad, 0, TWO_PI);
        }

        if (p.holoStars) {
          let target = 0;
          if (holo > 0.01 && distSq < hrSq) {
            const k = 1 - Math.sqrt(distSq) / hr;
            target = k * k * (3 - 2 * k) * holo;
          }
          if (pop > target) target = pop;
          // Each star chases the target at its own pace, so the field fills in unevenly.
          d.grow += (target - d.grow) * d.growRate;
          if (d.grow > 0.03) activeStars.push(i);
        } else if (holo > 0.01 && distSq < hrSq) {
          const dist = Math.sqrt(distSq);
          const k = 1 - dist / hr;
          const a = k * k * (3 - 2 * k) * holo;
          if (a > 0.05) {
            holoBuckets[Math.min(HOLO_ALPHAS - 1, Math.floor(a * HOLO_ALPHAS))].push(drawX, drawY);
          }
        }
      }

      ctx!.fill();

      if (p.holoStars) {
        // Each star has its own gradient, so these are filled one at a time (only the few
        // hundred near the cursor are active).
        const now = performance.now() / 1000;
        for (const di of activeStars) {
          const d = dots[di];
          let x = d.sx + d.ox;
          let y = d.sy - scrollY + d.oy;
          if (p.waveAmplitude > 0) {
            y += Math.sin(d.ax * 0.03 + t) * p.waveAmplitude;
            x += Math.cos(d.ay * 0.03 + t * 0.7) * p.waveAmplitude * 0.5;
          }
          const size = rad + (p.starSize * d.sizeMul - rad) * d.grow;
          const ang = d.rot + d.spin * now;
          const c = Math.cos(ang) * size;
          const sn = Math.sin(ang) * size;
          const verts = STAR_SHAPES[d.points];
          const grad = d.radial
            ? ctx!.createRadialGradient(x, y, 0, x, y, size)
            : ctx!.createLinearGradient(x - sn, y + c, x + sn, y - c); // along the star's first spike
          grad.addColorStop(0, STAR_PALETTE[d.color]);
          grad.addColorStop(1, STAR_PALETTE[d.color2]);
          ctx!.fillStyle = grad;
          ctx!.globalAlpha = d.grow;
          ctx!.beginPath();
          ctx!.moveTo(x + verts[0] * c - verts[1] * sn, y + verts[0] * sn + verts[1] * c);
          for (let v = 2; v < verts.length; v += 2) {
            ctx!.lineTo(x + verts[v] * c - verts[v + 1] * sn, y + verts[v] * sn + verts[v + 1] * c);
          }
          ctx!.closePath();
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      } else if (holo > 0.01 && holoCtx) {
        if (!iri) {
          iri = createIridescence({ color: p.holoColor, speed: p.holoSpeed, amplitude: 0.1, contrast: p.holoContrast });
          iri.resize(w, h);
        }
        // 1. Draw the hovered dots as an opaque-to-transparent mask.
        holoCtx.globalCompositeOperation = "source-over";
        holoCtx.clearRect(0, 0, w, h);
        holoCtx.fillStyle = "#fff";
        for (let b = 0; b < HOLO_ALPHAS; b++) {
          const pts = holoBuckets[b];
          if (!pts.length) continue;
          holoCtx.globalAlpha = (b + 1) / HOLO_ALPHAS;
          holoCtx.beginPath();
          for (let j = 0; j < pts.length; j += 2) {
            holoCtx.moveTo(pts[j] + rad, pts[j + 1]);
            holoCtx.arc(pts[j], pts[j + 1], rad, 0, TWO_PI);
          }
          holoCtx.fill();
        }
        holoCtx.globalAlpha = 1;
        // 2. Fill the mask with the shader (drawn in the same frame, so no preserved buffer needed).
        iri.render(performance.now() / 1000, m.x, m.y);
        holoCtx.globalCompositeOperation = "source-in";
        holoCtx.drawImage(iri.canvas, 0, 0, w, h);
        holoCtx.globalCompositeOperation = "source-over";
        // 3. Lay the coloured dots over the base ones.
        ctx!.drawImage(holoCanvas, 0, 0, w, h);
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    doResize();
    window.addEventListener("resize", resize);
    // The page can grow after load (fonts, images); keep the grid covering all of it.
    const pageObserver = propsRef.current.scrollWithPage ? new ResizeObserver(resize) : null;
    pageObserver?.observe(document.body);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("click", onClick);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("blur", onMouseLeave);
    rafRef.current = requestAnimationFrame(tick);

    rebuildRef.current = () => {
      const { w, h } = sizeRef.current;
      if (w > 0 && h > 0) buildDots(w, h);
    };

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(speedInterval);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", resize);
      pageObserver?.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("blur", onMouseLeave);
      iri?.destroy();
    };
  }, []);

  useEffect(() => {
    rebuildRef.current?.();
  }, [dotRadius, dotSpacing]);

  return (
    <div className="dot-field-container" {...rest}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <defs>
          <radialGradient id={glowId}>
            <stop offset="0%" stopColor={glowColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle
          ref={glowRef}
          cx="-9999"
          cy="-9999"
          r={glowRadius}
          fill={`url(#${glowId})`}
          style={{ opacity: 0, willChange: "opacity" }}
        />
      </svg>
    </div>
  );
});

export default DotField;
