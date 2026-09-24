"use client";

// Adapted from React Bits (https://reactbits.dev) — ScrollReveal.
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./ScrollReveal.css";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: string;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationStart?: string;
  wordAnimationEnd?: string;
  blurAnimationEnd?: string;
};

export default function ScrollReveal({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationStart = "top bottom-=20%",
  wordAnimationEnd = "bottom bottom",
  // Defaults to wordAnimationEnd. Set it later than that so words appear blurry first, then sharpen.
  blurAnimationEnd,
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const splitText = useMemo(
    () =>
      children.split(/(\s+)/).map((word, index) => {
        if (/^\s+$/.test(word)) return word;
        return (
          <span className="word" key={index}>
            {word}
          </span>
        );
      }),
    [children]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Respect reduced motion: leave the text fully visible and still.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scroller = scrollContainerRef?.current ?? window;

    // Scoped to this component, so cleanup only removes its own triggers (the original
    // killed every ScrollTrigger on the page).
    const ctx = gsap.context(() => {
      // Tilt that straightens as you scroll; skipped entirely when there's no rotation.
      if (baseRotation !== 0) {
        gsap.fromTo(
          el,
          { transformOrigin: "0% 50%", rotate: baseRotation },
          {
            ease: "none",
            rotate: 0,
            scrollTrigger: { trigger: el, scroller, start: "top bottom", end: rotationEnd, scrub: true },
          }
        );
      }

      const wordElements = el.querySelectorAll(".word");

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: "opacity" },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: { trigger: el, scroller, start: wordAnimationStart, end: wordAnimationEnd, scrub: true },
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: "none",
            filter: "blur(0px)",
            stagger: 0.05,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: wordAnimationStart,
              end: blurAnimationEnd ?? wordAnimationEnd,
              scrub: true,
            },
          }
        );
      }
    }, el);

    // Web fonts swapping in shifts the layout; re-measure trigger positions once they're loaded.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });

    return () => {
      alive = false;
      ctx.revert();
    };
  }, [
    scrollContainerRef,
    enableBlur,
    baseRotation,
    baseOpacity,
    rotationEnd,
    wordAnimationStart,
    wordAnimationEnd,
    blurAnimationEnd,
    blurStrength,
  ]);

  // A <div> wrapper instead of the original <h2>: a <p> inside a heading is invalid HTML and
  // triggers a hydration warning in React.
  return (
    <div ref={containerRef} className={`scroll-reveal ${containerClassName}`}>
      <p className={`scroll-reveal-text ${textClassName}`}>{splitText}</p>
    </div>
  );
}
