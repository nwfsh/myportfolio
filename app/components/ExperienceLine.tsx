"use client";

// A time-scaled, vertical experience timeline, built from React Bits' LineSidebar (proximity effect,
// markers). "Now" is at the top and time runs downward; the axis only spans the actual time range.
// Short ticks mark every 4 months (labels on the left); each position has a longer marker at its start
// date with its label on the right, sitting over its own span; the selected position draws a bar along
// the axis for its whole duration, and its responsibilities pop out right beside its title (on
// narrow screens they show under the timeline instead).
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { DotSnapProbe, useDotSnap } from "./DotSnapText";
import "./ExperienceLine.css";

export type ExperienceRole = {
  org: string;
  location?: string;
  title: string;
  /** "Oct 2025 – Apr 2026", "Apr 2026 – Present" or a single "Aug 2026". */
  dates: string;
  points?: string[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TICK_MONTHS = 4;

// Months are counted as a single index (year * 12 + month) so positions are easy to scale.
const parseMonth = (text: string, now: number): number | null => {
  const t = text.trim();
  if (/^present$/i.test(t)) return now;
  const m = t.match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{4})$/);
  if (!m) return null;
  const mo = MONTHS.findIndex((name) => name.toLowerCase() === m[1].toLowerCase());
  return mo < 0 ? null : Number(m[2]) * 12 + mo;
};

const monthLabel = (idx: number) => `${MONTHS[idx % 12]} ${Math.floor(idx / 12)}`;

const smooth = (p: number) => p * p * (3 - 2 * p);

// The selected role's location and bullets. Every line is two dot rows tall (and gaps are one row;
// see the CSS), so snapping the first line onto a dot row puts every line on a row. The shift uses
// `translate`, separate from the slide-in `transform` animation.
function RoleDetails({ role, className }: { role: ExperienceRole; className: string }) {
  const { probeRef, shift } = useDotSnap();
  const points = role.points ?? [];
  return (
    <div id="xl-detail" role="tabpanel" className={className} style={{ translate: `0 ${shift}px` }}>
      {role.location ? (
        <p className="xl__org">
          {role.location}
          <DotSnapProbe probeRef={probeRef} />
        </p>
      ) : null}
      {points.length ? (
        <ul className="xl__points">
          {points.map((pt, i) => (
            <li key={pt}>
              {pt}
              {!role.location && i === 0 ? <DotSnapProbe probeRef={probeRef} /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type Props = {
  /** Newest first (current at the top). */
  roles: ExperienceRole[];
  accentColor?: string;
  /** Height of one month on the timeline, in px. */
  monthHeight?: number;
  proximityRadius?: number;
  maxShift?: number;
  smoothing?: number;
};

export default function ExperienceLine({
  roles,
  accentColor = "#18181b",
  monthHeight = 34,
  proximityRadius = 140,
  maxShift = 14,
  smoothing = 100,
}: Props) {
  // "Present" depends on today's date, which differs between build time and visit time, so the
  // scale is only drawn after mount (the server renders just the frame) to avoid a hydration mismatch.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const d = new Date();
    setNow(d.getFullYear() * 12 + d.getMonth());
  }, []);

  const [activeIndex, setActiveIndex] = useState(0); // newest role selected to start with

  // Wide screens show details popping out beside the title; narrow ones show them under the
  // timeline. Rendered as one or the other (never both), so there's a single tabpanel.
  const [wide, setWide] = useState<boolean | null>(null);
  useEffect(() => {
    // Enough room beside the titles for the pop-out (the section spans the middle 2/3 of the screen,
    // minus the glass panel's padding).
    const mq = window.matchMedia("(min-width: 1200px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const scale = useMemo(() => {
    if (now === null) return null;
    const spans = roles.map((r) => {
      const [a, b] = r.dates.split(/\s*[–—-]\s*/);
      const start = parseMonth(a, now) ?? now;
      const endRaw = b ? parseMonth(b, now) : null;
      // A single month still spans that month; "Present" runs through the current month.
      const end = (endRaw ?? start) + 1;
      return { start, end, ongoing: b ? /present/i.test(b) : false };
    });
    const min = Math.min(...spans.map((s) => s.start));
    // Oldest end snaps back to a 4-month boundary (Jan / May / Sep); the top is now.
    const from = Math.floor(min / TICK_MONTHS) * TICK_MONTHS;
    const to = now + 1;
    // Time runs downward: now at 0%, the earliest month at 100%.
    const pct = (m: number) => ((to - m) / (to - from)) * 100;
    const ticks: { idx: number; top: number; now?: boolean }[] = [{ idx: now, top: 0, now: true }];
    // 4-month ticks, skipping any within 2 months of "Now" so their labels don't collide.
    for (let m = from; m <= to - 2; m += TICK_MONTHS) ticks.push({ idx: m, top: pct(m) });
    return {
      height: (to - from) * monthHeight,
      ticks,
      // `top`/`bottom` are the span's edges on screen; the marker sits at the start date (`bottom`).
      spans: spans.map((s) => ({ ...s, top: pct(s.end), bottom: pct(s.start) })),
    };
  }, [roles, now, monthHeight]);

  // --- LineSidebar proximity effect (rAF-eased --effect per role, measured along y) ---
  const trackRef = useRef<HTMLDivElement>(null);
  const roleRefs = useRef<(HTMLLIElement | null)[]>([]);
  const targetsRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const activeRef = useRef(activeIndex);
  activeRef.current = activeIndex;

  const runFrame = useCallback(
    (t: number) => {
      const dt = Math.min((t - lastRef.current) / 1000, 0.05);
      lastRef.current = t;
      const k = 1 - Math.exp(-dt / (Math.max(smoothing, 1) / 1000));
      let moving = false;
      roleRefs.current.forEach((el, i) => {
        if (!el) return;
        const target = Math.max(targetsRef.current[i] || 0, activeRef.current === i ? 1 : 0);
        const cur = currentRef.current[i] || 0;
        const next = cur + (target - cur) * k;
        const settled = Math.abs(target - next) < 0.0015;
        currentRef.current[i] = settled ? target : next;
        el.style.setProperty("--effect", currentRef.current[i].toFixed(4));
        if (!settled) moving = true;
      });
      rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
    },
    [smoothing]
  );

  const startLoop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const box = trackRef.current;
    if (!box) return;
    const y = e.clientY - box.getBoundingClientRect().top;
    roleRefs.current.forEach((el, i) => {
      if (!el) return;
      // Roles sit at their start marker; their label extends upward over the span, so measure
      // from a little above the marker.
      const center = el.offsetTop - 30;
      targetsRef.current[i] = smooth(Math.max(0, 1 - Math.abs(y - center) / proximityRadius));
    });
    startLoop();
  };
  const onPointerLeave = () => {
    targetsRef.current = targetsRef.current.map(() => 0);
    startLoop();
  };

  useEffect(() => {
    startLoop();
  }, [activeIndex, scale, startLoop]);
  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const active = roles[activeIndex];
  const activeSpan = scale?.spans[activeIndex];


  return (
    <div className="xl" style={{ "--accent-color": accentColor, "--max-shift": `${maxShift}px` } as CSSProperties}>
      <div
        className="xl__track"
        ref={trackRef}
        style={{ height: scale ? `${scale.height}px` : undefined }}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {/* The axis only spans the time range. */}
        <div className="xl__axis" aria-hidden="true" />

        {scale ? (
          <>
            {/* "Now" plus a tick every 4 months, to scale. */}
            {scale.ticks.map((t) => (
              <span
                key={t.now ? "now" : t.idx}
                className="xl__tick"
                data-now={t.now ? "" : undefined}
                style={{ top: `${t.top}%` }}
                aria-hidden="true"
              >
                <span className="xl__tick-label">{t.now ? "Now" : monthLabel(t.idx)}</span>
              </span>
            ))}

            {/* How long the selected position lasted. */}
            {activeSpan ? (
              <span
                className="xl__span"
                data-ongoing={activeSpan.ongoing ? "" : undefined}
                style={{ top: `${activeSpan.top}%`, height: `${activeSpan.bottom - activeSpan.top}%` }}
                aria-hidden="true"
              />
            ) : null}

            <ul className="xl__roles" role="tablist" aria-label="Experience timeline" aria-orientation="vertical">
              {roles.map((role, i) => (
                <li
                  key={`${role.org}-${role.title}`}
                  ref={(el) => {
                    roleRefs.current[i] = el;
                  }}
                  className="xl__role"
                  style={{ top: `${scale.spans[i].bottom}%` }}
                >
                  <span className="xl__marker" aria-hidden="true" />
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === i}
                    aria-controls="xl-detail"
                    className="xl__label"
                    onClick={() => setActiveIndex(i)}
                    onKeyDown={(e) => {
                      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                      e.preventDefault();
                      const next = (i + (e.key === "ArrowDown" ? 1 : -1) + roles.length) % roles.length;
                      setActiveIndex(next);
                      roleRefs.current[next]?.querySelector("button")?.focus();
                    }}
                  >
                    <span className="xl__date">{role.dates}</span>
                    <span className="xl__title">{role.title}</span>
                    <span className="xl__company">{role.org}</span>
                  </button>
                  {/* Responsibilities pop out from the left, right beside the selected title. */}
                  {wide && activeIndex === i ? <RoleDetails key={i} role={role} className="xl__pop" /> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      {wide === false && active ? <RoleDetails key={activeIndex} role={active} className="xl__detail" /> : null}
    </div>
  );
}
