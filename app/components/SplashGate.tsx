"use client";

import { useEffect, useState, type ReactNode } from "react";

// Fired by LoadingScreen when the splash starts fading out (finished or skipped).
export const SPLASH_DONE = "splash:done";

declare global {
  interface Window {
    __splashDone?: boolean;
  }
}

export function markSplashDone() {
  window.__splashDone = true;
  window.dispatchEvent(new Event(SPLASH_DONE));
}

// Holds the page back until the splash is done. The page is still in the server HTML and
// loads (images, fonts) underneath, just hidden; when the splash starts fading it's mounted
// afresh (new key), so its intro animations, like the hero typing, start as it's revealed
// instead of having already played behind the splash.
export default function SplashGate({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.__splashDone) {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener(SPLASH_DONE, onDone);
    return () => window.removeEventListener(SPLASH_DONE, onDone);
  }, []);

  return (
    <div key={done ? "shown" : "waiting"} style={done ? undefined : { visibility: "hidden" }}>
      {children}
    </div>
  );
}
