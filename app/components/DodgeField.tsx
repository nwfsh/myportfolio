"use client";

// Ported from React Bits (DodgeField). The child slides away from the pointer a few times, then
// gives in and sits still so it can be clicked. Added here: `leap`, where the child rests at the
// field's right end and jumps to the far end away from the pointer instead of flinching.

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "motion/react";

import "./DodgeField.css";

const COUNT_LINE = 0.55;
const DEAD_ZONE = 6;
const CAUGHT_HOLD_MS = 760;
const INSET = 12;
const DEFAULT_TAUNTS = ["Catch me", "Nope", "Too slow", "Almost", "Okay, okay"];

type Axis = "both" | "x" | "y";
type Wall = "clamp" | "bounce";
export type DodgeState = { dodges: number; gave: boolean; caught: boolean; fleeing: boolean };

const wallIt = (t: number, room: number, wall: Wall) => {
  if (wall === "bounce") {
    if (t > room) return Math.max(-room, 2 * room - t);
    if (t < -room) return Math.min(room, -2 * room - t);
    return t;
  }
  return Math.min(room, Math.max(-room, t));
};
const bearingOf = (dx: number, dy: number, d: number, axis: Axis) => {
  if (axis === "x") return { x: Math.sign(dx) || 1, y: 0 };
  if (axis === "y") return { x: 0, y: Math.sign(dy) || 1 };
  return { x: dx / d, y: dy / d };
};

type Props = {
  children?: ReactNode | ((state: DodgeState) => ReactNode);
  taunts?: string[];
  notice?: string;
  inkColor?: string;
  contrastColor?: string;
  fieldHeight?: number;
  reach?: number;
  radius?: number;
  falloff?: number;
  fleeDuration?: number;
  returnDuration?: number;
  returnBounce?: number;
  axis?: Axis;
  wall?: Wall;
  // Rest at the right end and leap to whichever end of the field is away from the pointer (x only;
  // reach, falloff, axis and wall are unused). It stays put between leaps and once it gives in.
  leap?: boolean;
  patience?: number;
  disabled?: boolean;
  onDodge?: (count: number) => void;
  onRelent?: () => void;
  onCatch?: () => void;
  className?: string;
  style?: CSSProperties;
};

export default function DodgeField({
  children,
  taunts = DEFAULT_TAUNTS,
  notice = "",
  inkColor = "#f5f5f5",
  contrastColor = "#18181b",
  fieldHeight = 240,
  reach = 72,
  radius = 120,
  falloff = 2,
  fleeDuration = 130,
  returnDuration = 620,
  returnBounce = 0.1,
  axis = "both",
  wall = "clamp",
  leap = false,
  patience = 4,
  disabled = false,
  onDodge,
  onRelent,
  onCatch,
  className = "",
  style,
}: Props) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const moverRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const transform = useMotionTemplate`translate(${x}px, ${y}px)`;
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(true);
  const [inside, setInside] = useState(false);
  const [dodges, setDodges] = useState(0);
  const [caught, setCaught] = useState(false);
  const gave = dodges >= Math.max(1, patience);
  const still = gave || caught || disabled || !!reduce;

  const pointer = useRef<{ x: number; y: number } | null>(null);
  const bearing = useRef({ x: 1, y: 0 });
  const armed = useRef(true);
  const room = useRef({ x: 0, y: 0 });
  // Leap mode: how far left the child can go from its home at the right end, and where it's headed.
  const leapRoom = useRef(0);
  const target = useRef(0);
  const raf = useRef(0);
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const live = useRef({
    reach,
    radius,
    falloff,
    fleeDuration,
    returnDuration,
    returnBounce,
    axis,
    wall,
    leap,
    still,
    inside,
    reduce,
  });
  live.current = {
    reach,
    radius,
    falloff,
    fleeDuration,
    returnDuration,
    returnBounce,
    axis,
    wall,
    leap,
    still,
    inside,
    reduce,
  };

  useEffect(() => {
    const field = fieldRef.current;
    const mover = moverRef.current;
    if (!field || !mover) return undefined;
    const measure = () => {
      room.current = {
        x: Math.max(0, (field.clientWidth - mover.offsetWidth) / 2 - INSET),
        y: Math.max(0, (field.clientHeight - mover.offsetHeight) / 2 - INSET),
      };
      leapRoom.current = Math.max(0, field.clientWidth - mover.offsetWidth - INSET);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(field);
    observer.observe(mover);
    return () => observer.disconnect();
  }, []);

  const frame = useCallback(() => {
    raf.current = 0;
    const field = fieldRef.current;
    const p = pointer.current;
    const L = live.current;
    if (!field) return;
    const rect = field.getBoundingClientRect();
    const zoom = rect.width / (field.offsetWidth || rect.width) || 1;
    if (L.leap) {
      const mover = moverRef.current;
      if (!mover) return;
      // Pointer relative to where the child is (or is headed), not its home.
      const centre = rect.right - (mover.offsetWidth / 2) * zoom + target.current * zoom;
      const px = p ? (p.x - centre) / zoom : Infinity;
      const py = p ? (p.y - (rect.top + rect.height / 2)) / zoom : Infinity;
      const near = Math.hypot(px, py) <= L.radius;
      const over =
        !!p && p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom;
      let to = target.current;
      if (L.reduce) to = 0;
      else if (!L.still && near) {
        // The end on the far side of the field from the pointer; if it's already there, the other.
        const far = p!.x >= rect.left + rect.width / 2 ? -leapRoom.current : 0;
        to = far !== target.current ? far : far === 0 ? -leapRoom.current : 0;
      }
      // Not dodging any more (caught and reset) and the pointer has left: glide home.
      else if (!L.still && !over && !near) to = 0;
      if (to !== target.current) {
        const fled = !L.still && near;
        if (fled) setDodges((n) => n + 1);
        target.current = to;
        if (L.reduce) x.jump(to);
        else
          animate(
            x,
            to,
            fled
              ? { type: "spring", duration: L.fleeDuration / 1000, bounce: 0 }
              : { type: "spring", duration: L.returnDuration / 1000, bounce: L.returnBounce },
          );
      }
      const fleeing = near && !L.still;
      if (fleeing !== L.inside) setInside(fleeing);
      return;
    }
    const dx = p ? (p.x - (rect.left + rect.width / 2)) / zoom : Infinity;
    const dy = p ? (p.y - (rect.top + rect.height / 2)) / zoom : Infinity;
    const d = Math.hypot(dx, dy);
    const isInside = d <= L.radius;
    if (!isInside && !L.inside) return;
    if (!L.still) {
      if (d < L.radius * COUNT_LINE) {
        if (armed.current) {
          armed.current = false;
          setDodges((n) => n + 1);
        }
      } else if (d > L.radius) {
        armed.current = true;
      }
    }
    if (Number.isFinite(d) && d > DEAD_ZONE) bearing.current = bearingOf(dx, dy, d, L.axis);
    const flee = isInside && !L.still ? (1 - d / L.radius) ** L.falloff : 0;
    const tx = wallIt(-bearing.current.x * flee * L.reach, room.current.x, L.wall);
    const ty = wallIt(-bearing.current.y * flee * L.reach, room.current.y, L.wall);
    if (L.reduce) {
      x.jump(0);
      y.jump(0);
    } else {
      const cfg =
        flee > 0
          ? { type: "spring" as const, duration: L.fleeDuration / 1000, bounce: 0 }
          : { type: "spring" as const, duration: L.returnDuration / 1000, bounce: L.returnBounce };
      animate(x, tx, cfg);
      animate(y, ty, cfg);
    }
    if (isInside !== L.inside) setInside(isInside);
  }, [x, y]);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFine(query.matches);
    sync();
    query.addEventListener("change", sync);
    if (!query.matches || disabled) return () => query.removeEventListener("change", sync);
    const tick = () => {
      if (!raf.current) raf.current = requestAnimationFrame(frame);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      pointer.current = { x: e.clientX, y: e.clientY };
      tick();
    };
    const onLeave = () => {
      pointer.current = null;
      tick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", tick, { passive: true, capture: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      query.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", tick, { capture: true });
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [disabled, frame]);

  useEffect(() => {
    if (!raf.current) raf.current = requestAnimationFrame(frame);
  }, [still, frame]);
  useEffect(() => {
    if (dodges) onDodge?.(dodges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dodges]);
  useEffect(() => {
    if (gave) onRelent?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gave]);
  useEffect(() => () => clearTimeout(hold.current), []);

  const handleClick = () => {
    setCaught(true);
    onCatch?.();
    clearTimeout(hold.current);
    hold.current = setTimeout(() => {
      setCaught(false);
      setDodges(0);
      armed.current = false;
    }, CAUGHT_HOLD_MS);
  };

  const state = { dodges, gave, caught, fleeing: inside && !still };
  const content =
    typeof children === "function"
      ? children(state)
      : (children ?? (
          <button type="button" className="dodge-field__pill" aria-label={taunts[0]}>
            <DodgeLabels taunts={taunts} index={tauntIndex(taunts, state)} />
          </button>
        ));

  return (
    <div
      ref={fieldRef}
      className={`dodge-field${className ? ` ${className}` : ""}`}
      data-coarse={fine ? undefined : ""}
      data-flat={reduce ? "" : undefined}
      data-leap={leap ? "" : undefined}
      style={
        {
          "--df-ink": inkColor,
          "--df-contrast": contrastColor,
          "--df-height": `${fieldHeight}px`,
          ...style,
        } as CSSProperties
      }
    >
      <motion.div
        ref={moverRef}
        className="dodge-field__mover"
        style={{ transform }}
        data-fled={inside && !still ? "true" : "false"}
        data-relented={gave ? "true" : "false"}
        data-caught={caught ? "true" : "false"}
        onClick={handleClick}
      >
        {content}
      </motion.div>
      {!fine && notice ? <p className="dodge-field__notice">{notice}</p> : null}
    </div>
  );
}

// The stacked taunt labels that cross-fade inside a pill; exported so a custom child (e.g. a link)
// can reuse the built-in pill look. `index` picks the visible one, as the built-in pill does.
export function DodgeLabels({ taunts, index }: { taunts: string[]; index: number }) {
  return (
    <span className="dodge-field__labels">
      {taunts.map((taunt, i) => (
        <span
          key={`${taunt}-${i}`}
          className="dodge-field__label"
          data-active={i === index ? "true" : "false"}
          aria-hidden="true"
        >
          {taunt}
        </span>
      ))}
    </span>
  );
}

// The label index the built-in pill would show for a given state.
export function tauntIndex(taunts: string[], { dodges, gave, caught }: DodgeState) {
  return gave || caught ? taunts.length - 1 : Math.min(dodges, Math.max(0, taunts.length - 2));
}
