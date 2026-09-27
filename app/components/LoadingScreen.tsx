"use client";

import { useEffect, useState } from "react";
import PromptBar from "./PromptBar";
import { markSplashDone } from "./SplashGate";
import ThoughtLine from "./ThoughtLine";

// ── Edit the loading text here ───────────────────────────────────────────────
// Written from the recruiter's side: they type the prompt, and the "AI" finds Avery.
// Typed into the prompt bar, then "sent"; the thinking line below answers it.
const PROMPT =
  "find me someone super cool and super employable, with insane aura";// whos passionate aout everthing she does 
const LABEL = "Searching for the perfect hire";
const DONE_LABEL = "Found in"; // becomes "Found in 2.4s" once it settles
// Shown one at a time beneath the line; the last one is "in progress", earlier ones get a tick.
const STEPS = [
    // "User said 'she'. Narrowing it down...",
    "Searching..",
    "Found the perfect match...",
];
// ─────────────────────────────────────────────────────────────────────────────

const START_MS = 400; // empty bar before typing starts
const TYPE_MS = 30; // average time per typed character (each one varies a little)
const SEND_MS = 300; // pause on the finished prompt before it's sent
const STEP_MS = 800; // time between steps appearing
const HOLD_MS = 700; // pause on the finished line before the screen fades
const FADE_MS = 500; // must match the .loader transition in globals.css

// Full-screen loading screen. A prompt bar (React Bits PromptBar, not usable) at the bottom
// types PROMPT and sends it; the sent prompt shows as a message and the thinking line
// (React Bits ThoughtLine) answers. It is in the server HTML, so it covers the page from the
// first paint; it settles once every step has shown *and* the page (images, fonts) has loaded,
// then fades out and unmounts.
export default function LoadingScreen() {
  const [typed, setTyped] = useState("");
  const [sent, setSent] = useState(false);
  const [shown, setShown] = useState(1);
  const [pageReady, setPageReady] = useState(false);
  const [phase, setPhase] = useState<"working" | "leaving" | "gone">("working");
  // shown goes one past the list so the last step also gets its STEP_MS as "in progress".
  const working = !(sent && pageReady && shown > STEPS.length);

  // Type the prompt one character at a time, then send it. Reduced motion: all at once.
  useEffect(() => {
    if (sent) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typed.length >= PROMPT.length || reduced) {
      const id = setTimeout(() => setSent(true), reduced ? 0 : SEND_MS);
      return () => clearTimeout(id);
    }
    const wait = typed.length === 0 ? START_MS : TYPE_MS * (0.5 + Math.random());
    const id = setTimeout(() => setTyped(PROMPT.slice(0, typed.length + 1)), wait);
    return () => clearTimeout(id);
  }, [typed, sent]);

  // Once sent, reveal the steps one at a time.
  useEffect(() => {
    if (!sent || shown > STEPS.length) return;
    const id = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(id);
  }, [shown, sent]);

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

  // Skip: fade out straight away.
  const skip = () => {
    setPhase("leaving");
    setTimeout(() => setPhase("gone"), FADE_MS);
  };

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

  // Let the page mount (and start its own animations) as the splash starts to fade.
  useEffect(() => {
    if (phase !== "working") markSplashDone();
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      className="loader"
      data-sent={sent ? "" : undefined}
      data-leaving={phase === "leaving" ? "" : undefined}
    >
      {/* The "chat": the sent prompt, then the thinking line answering it. */}
      <div className="loader__chat">
        {sent ? (
          <>
            <p className="loader__message">{PROMPT}</p>
            <ThoughtLine
              working={working}
              label={LABEL}
              doneLabel={DONE_LABEL}
              steps={STEPS.slice(0, shown)}
              fontSize={15}
              collapsible={false}
              collapseOnSettle={false}
            />
          </>
        ) : null}
      </div>
      {/* The prompt bar, with Skip right above it. */}
      <div className="loader__dock">
        <div className="loader__slot">
          <button type="button" className="loader__skip" onClick={skip}>
            Skip intro
          </button>
          {/* Plays back only: not clickable or typeable (see .loader__bar). */}
          <div className="loader__bar" aria-hidden="true" inert>
            {/* React Bits' defaults (model and effort pills), in light colours, sized like the
                Claude.ai new-chat box (see .loader__bar in globals.css). */}
            <PromptBar
              value={sent ? "" : typed}
              busy={sent && working}
              background="#ffffff"
              color="#18181b"
              menuBackground="#ffffff"
              width={672}
              radius={20}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
