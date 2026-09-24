"use client";

// Adapted from React Bits (https://reactbits.dev) — AccordionGallery, turned sideways (a column
// of horizontal strips) and made to hold a project: the title/labels always show, and the
// open strip reveals the description and stack. The image (or grey placeholder) is the backdrop.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { gsap } from "gsap";
import { CATEGORIES, type Project } from "../projects";
import "./ProjectAccordion.css";

type Item = { project: Project; dim?: boolean; highlightCategory?: string };

type Props = {
  items: Item[];
  /** Changing this re-opens the first strip (used when the filter reorders the list). */
  resetKey?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  grayscale?: boolean;
};

const labelOf = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

export default function ProjectAccordion({
  items,
  resetKey,
  height = 1000, // 6 projects: open strip ~400px, closed ones ~110px (room for title + stack)
  gap = 10,
  radius = 14,
  expandRatio = 0.42,
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 3,
  stagger = 0.06,
  trigger = "hover",
  grayscale = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);
  const reducedRef = useRef(false);

  const count = items.length;
  const [active, setActive] = useState(0);
  // Identity of the current order. The filter can reorder strips without changing `active`
  // (it stays 0), so the layout must also re-run when the order changes — otherwise the
  // previously open strip keeps its size at its new position and the new first strip is stuck small.
  const orderKey = items.map((it) => it.project.title).join("|");

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // A project's video plays from the start while its strip is hovered, and pauses when the
  // pointer leaves. Nothing plays for reduced-motion users (they see the first frame).
  const playVideo = (i: number) => {
    const video = videoRefs.current[i];
    if (!video || reducedRef.current) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };
  const pauseVideo = (i: number) => {
    videoRefs.current[i]?.pause();
  };

  // A filter change reorders the strips; open the first (best-matching) one.
  useEffect(() => {
    setActive(0);
  }, [resetKey]);

  const applyLayout = useCallback(
    (animate: boolean) => {
      const panels = panelRefs.current.slice(0, count);
      if (!panels.length) return;

      const r = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (r * (count - 1)) / (1 - r) : 1;
      const mediaSize = mediaSizeRef.current;
      const reduced = reducedRef.current;

      tlRef.current?.kill();
      const dur = animate && !reduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, i) => {
        if (!panel) return;
        const isActive = i === active;
        const media = mediaRefs.current[i];
        const details = detailRefs.current[i];
        const rot = isActive ? 0 : i < active ? tilt : -tilt;

        tl.to(panel, { flexGrow: isActive ? grow : 1, rotateX: -rot, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - i));
          const shift = drift * parallax * mediaSize * 0.06;
          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: 0,
              y: isActive ? 0 : shift,
              "--ag-gray": grayscale ? (isActive ? 0 : 1) : 0,
              "--ag-dim": isActive ? 0 : 0.15, // light wash so closed strips still look crisp
              duration: dur,
              ease,
            },
            0
          );
        }

        if (details) {
          if (isActive) {
            tl.to(details.children, { opacity: 1, y: 0, duration: dur, ease, stagger: reduced ? 0 : stagger }, 0);
          } else {
            tl.to(details.children, { opacity: 0, y: 8, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- orderKey: re-apply after reordering
    [active, count, orderKey, expandRatio, duration, ease, tilt, parallax, grayscale, stagger]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => {
      const usable = Math.max(el.getBoundingClientRect().height - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty("--ag-media-size", `${size}px`);
      applyLayout(!firstRunRef.current);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, gap, count, expandRatio]);

  useEffect(() => {
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout]);

  useEffect(() => () => void tlRef.current?.kill(), []);

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (i + 1) % count;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (i - 1 + count) % count;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    panelRefs.current[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="project-accordion"
      style={{ "--ag-gap": `${gap}px`, "--ag-radius": `${radius}px`, height: `${height}px` } as CSSProperties}
      role="list"
      aria-label="Projects"
    >
      {items.map(({ project: p, dim, highlightCategory }, i) => {
        const isActive = i === active;
        return (
          <div
            key={p.title}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className={`pa-panel${isActive ? " pa-panel--active" : ""}`}
            data-dim={dim ? "" : undefined}
            data-has-video={p.video ? "" : undefined}
            onMouseEnter={() => {
              if (trigger === "hover") setActive(i);
              playVideo(i);
            }}
            onMouseLeave={() => pauseVideo(i)}
            onMouseMove={(e) => {
              // Spotlight (from React Bits' SpotlightCard): the glow follows the cursor.
              const rect = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
              e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
            }}
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(i, e)}
            role="listitem"
            tabIndex={0}
            aria-current={isActive ? "true" : undefined}
            aria-label={p.title}
          >
            <span className="pa-panel__frame" aria-hidden="true">
              <span
                className="pa-panel__media"
                ref={(el) => {
                  mediaRefs.current[i] = el;
                }}
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" draggable={false} />
                ) : null}
              </span>
              <span className="pa-panel__overlay" />
            </span>

            <div className="pa-content">
              {/* Always visible (open or closed): title, date and tech stack. */}
              <div className="pa-head">
                <h3>{p.title}</h3>
                {/* Award sits right beside the title, visible even on a closed strip. */}
                {p.award ? <span className="pa-badge">{p.award}</span> : null}
                {p.date ? <span className="pa-date">{p.date}</span> : null}
              </div>
              <div className="pa-tags">
                {p.tags.map((t) => (
                  <span key={t} className="pa-tag">
                    {t}
                  </span>
                ))}
              </div>
              {/* Revealed on the open strip: description, then project type / categories. */}
              <div
                className="pa-details"
                ref={(el) => {
                  detailRefs.current[i] = el;
                }}
              >
                <p>{p.description}</p>
                <div className="pa-meta">
                  {p.kind ? <span className="pa-kind">{p.kind}</span> : null}
                  {p.categories.map((c) => (
                    <span key={c} className="pa-cat" data-on={highlightCategory === c ? "" : undefined}>
                      {labelOf(c)}
                    </span>
                  ))}
                  {p.status ? <span className="pa-badge pa-badge--status">{p.status}</span> : null}
                </div>
              </div>
            </div>

            {/* Framed preview on the right of the strip (not the backdrop); shown when open. */}
            {p.video ? (
              <div className="pa-video">
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={p.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={`${p.title} demo`}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
