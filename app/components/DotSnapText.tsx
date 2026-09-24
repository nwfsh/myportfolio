"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Space between the text's baseline and the centre of the dot row it sits on.
const GAP = 3;

// Snaps a line of text onto the DotField grid (read from the --dot-step / --dot-offset variables
// DotField publishes). Put `probeRef` on a zero-size inline-block at the end of the line to align —
// it sits on that line's baseline — and apply `shift` as a vertical offset to the text's container.
// Only ever moves up, by less than one row. Re-measures on resize, layout changes and font load.
// Lines below stay on rows too if their line-height and gaps are multiples of the row step.
export function useDotSnap() {
  const probeRef = useRef<HTMLSpanElement>(null);
  const shiftRef = useRef(0);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const probe = probeRef.current;
      const root = getComputedStyle(document.documentElement);
      const step = parseFloat(root.getPropertyValue("--dot-step"));
      const offset = parseFloat(root.getPropertyValue("--dot-offset"));
      if (!probe || !step || Number.isNaN(offset)) return;
      // Take out the current shift to get the baseline's natural position, in page coordinates.
      const baseline = probe.getBoundingClientRect().top + window.scrollY - shiftRef.current;
      const row = offset + Math.floor((baseline + GAP - offset) / step) * step;
      const next = row - GAP - baseline;
      if (Math.abs(next - shiftRef.current) < 0.1) return;
      shiftRef.current = next;
      setShift(next);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("resize", schedule);
    window.addEventListener("dotgrid", schedule);
    document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("dotgrid", schedule);
    };
  }, []);

  return { probeRef, shift };
}

/** Zero-size marker that sits on the baseline of the line it's placed in. */
export function DotSnapProbe({ probeRef }: { probeRef: React.RefObject<HTMLSpanElement | null> }) {
  return <span ref={probeRef} aria-hidden="true" style={{ display: "inline-block", width: 0, height: 0 }} />;
}

// A paragraph whose last line is nudged up so its baseline sits just above a row of dots.
export default function DotSnapText({ children, className }: { children: ReactNode; className?: string }) {
  const { probeRef, shift } = useDotSnap();
  return (
    <p className={className} style={{ transform: `translateY(${shift}px)` }}>
      {children}
      <DotSnapProbe probeRef={probeRef} />
    </p>
  );
}
