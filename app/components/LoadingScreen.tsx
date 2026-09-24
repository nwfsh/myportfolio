"use client";

import { useEffect, useState } from "react";
import ThoughtLine from "./ThoughtLine";

// ── Edit the loading text here ───────────────────────────────────────────────
const LABEL = "Creating a website that would make you wanna hire me so bad";
const DONE_LABEL = "Made it in"; // becomes "Made it in 2.4s" once it settles
// Shown one at a time beneath the line; the last one is "in progress", earlier ones get a tick.
const STEPS = [
    
  "Creating a personal website that makes you wanna hire me so bad.",
  "Hypnothizing you to move my application to the next stage.",
  // "Giving it my best shot.",
];
// ─────────────────────────────────────────────────────────────────────────────

const STEP_MS = 800; // time between steps appearing
const HOLD_MS = 700; // pause on the finished line before the screen fades
const FADE_MS = 500; // must match the .loader transition in globals.css

// Full-screen loading screen (React Bits ThoughtLine). It is in the server HTML, so it covers
// the page from the first paint; it settles once every step has shown *and* the page (images,
// fonts) has loaded, then fades out and unmounts.
export default function LoadingScreen() {
  const [shown, setShown] = useState(1);
  const [pageReady, setPageReady] = useState(false);
  const [phase, setPhase] = useState<"working" | "leaving" | "gone">("working");
  // shown goes one past the list so the last step also gets its STEP_MS as "in progress".
  const working = !(pageReady && shown > STEPS.length);

  // Reveal the steps one at a time.
  useEffect(() => {
    if (shown > STEPS.length) return;
    const id = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [shown]);

  // Wait for the page's images and web fonts.
  useEffect(() => {
    let cancelled = false;
    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((res) => window.addEventListener("load", () => res(), { once: true }));
    Promise.all([loaded, document.fonts.ready]).then(() => {
      if (!cancelled) setPageReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Once settled: hold, fade, then remove.
  useEffect(() => {
    if (working) return;
    const leave = setTimeout(() => setPhase("leaving"), HOLD_MS);
    const gone = setTimeout(() => setPhase("gone"), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(leave);
      clearTimeout(gone);
    };
  }, [working]);

  // No scrolling the page underneath while the screen is up.
  useEffect(() => {
    if (phase === "gone") return;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className="loader" data-leaving={phase === "leaving" ? "" : undefined}>
      <ThoughtLine
        working={working}
        label={LABEL}
        doneLabel={DONE_LABEL}
        steps={STEPS.slice(0, shown)}
        fontSize={18}
        collapsible={false}
        collapseOnSettle={false}
      />
    </div>
  );
}
