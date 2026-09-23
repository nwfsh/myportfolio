"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon } from "@hugeicons/core-free-icons";
import RefineFrame, { type RefineStatus } from "./RefineFrame";
import portrait from "@/data/portrait.jpg";
import portrait2 from "@/data/portrait-2.jpg";
import exclamation from "@/data/Group 5.svg";
import exclamationIdle from "@/data/Group 5-2.svg";
import starburst from "@/data/Group 3.svg";
import starburstIdle from "@/data/Group 3-2.svg";
import sparkle from "@/data/Union.svg";
import sparkleIdle from "@/data/Union-2.svg";
import paper from "@/data/Group 4.svg";

// Photos the refresh button cycles through, in order.
const PHOTOS = [
  { src: portrait.src, alt: "Portrait of Avery" },
  { src: portrait2.src, alt: "Avery with a bowl of salmon rice" },
];

// Corner stickers: `idle` shows normally, `hover` cross-fades in while the photo is hovered.
const STICKERS = [
  { corner: "top-left", idle: exclamationIdle.src, hover: exclamation.src },
  { corner: "top-right", idle: starburstIdle.src, hover: starburst.src },
  { corner: "bottom-left", idle: sparkleIdle.src, hover: sparkle.src },
];

// Walk through the stages so the photo "develops" into view (on load and after each refresh).
// Timed against STAGE_MS so each stage finishes before the next starts: the frame steps through
// 8 pixel levels, one per STAGE_MS — generating covers 4 (2.4s), refining 3 (1.8s), complete 1.
const STAGE_MS = 600;
const SEQUENCE: { status: RefineStatus; at: number }[] = [
  { status: "generating", at: 800 },
  { status: "refining", at: 3200 },
  { status: "complete", at: 5200 },
];

export default function HeroPhoto() {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<RefineStatus>("queued");
  const [presses, setPresses] = useState(0);
  const photo = PHOTOS[index];

  useEffect(() => {
    setStatus("queued");
    const timers = SEQUENCE.map(({ status, at }) => setTimeout(() => setStatus(status), at));
    return () => timers.forEach(clearTimeout);
  }, [index]);

  // Warm the cache so the next photo is ready when the button is pressed.
  useEffect(() => {
    PHOTOS.forEach(({ src }) => {
      new Image().src = src;
    });
  }, []);

  return (
    <div className="hero-photo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-photo__backdrop" src={paper.src} alt="" aria-hidden="true" />
      {/* key: a fresh frame per photo, so no state or pixels from the previous photo carry over. */}
      <RefineFrame
        key={photo.src}
        status={status}
        aspectRatio="3 / 4"
        width={340}
        radius={20}
        labels={{ generating: "Loading", refining: "Sharpening", complete: "Photo of Avery generated!" }}
        stageDuration={STAGE_MS}
        hideAfter={4000}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.src} alt={photo.alt} />
      </RefineFrame>
      <button
        type="button"
        className="hero-photo__refresh"
        onClick={() => {
          setIndex((i) => (i + 1) % PHOTOS.length);
          setPresses((n) => n + 1);
        }}
        aria-label="Show another photo"
        title="Show another photo"
      >
        {/* key restarts the spin animation on each press; no spin on first render */}
        <span key={presses} className={presses ? "hero-photo__refresh-icon" : undefined} style={{ display: "grid" }}>
          <HugeiconsIcon icon={RefreshIcon} size={18} strokeWidth={2} />
        </span>
      </button>
      {/* Decorative stickers layered over the frame's corners. */}
      {STICKERS.map(({ corner, idle, hover }) => (
        <span key={corner} className={`hero-photo__deco hero-photo__deco--${corner}`} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={idle} alt="" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="hero-photo__deco-hover" src={hover} alt="" />
        </span>
      ))}
    </div>
  );
}
