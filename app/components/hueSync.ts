// Chrome only (html[data-engine="blink"]): each glow layer runs the 24s hue cycle itself rather
// than inheriting it from the project list. A negative delay of "page time mod 24s", set when an
// element mounts, puts every layer on the same colour at the same moment, whenever it mounted.
export const HUE_CYCLE_MS = 24000;

export function setHueSync(el: HTMLElement | null) {
  if (!el) return;
  const now = Number(document.timeline?.currentTime ?? performance.now());
  el.style.setProperty("--hue-sync", `${-Math.round(now % HUE_CYCLE_MS)}ms`);
}
