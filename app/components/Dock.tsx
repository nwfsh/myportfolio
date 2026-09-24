"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase01Icon, Folder01Icon, Home01Icon, UserIcon } from "@hugeicons/core-free-icons";
import JellyRadio from "./JellyRadio";

const SECTIONS = [
  { id: "home", label: "Home", icon: Home01Icon },
  { id: "projects", label: "Projects", icon: Folder01Icon },
  { id: "experience", label: "Experience", icon: Briefcase01Icon },
  { id: "profile", label: "Reach Me", icon: UserIcon },
];

// While a click-triggered smooth scroll is running, ignore scroll-spy so the dock doesn't
// wobble through every section in between. Released on scrollend, or after this long.
const LOCK_MS = 1200;

// The section under the middle of the viewport.
function sectionAtCentre() {
  const mid = window.innerHeight / 2;
  let id = SECTIONS[0].id;
  for (const s of SECTIONS) {
    const el = document.getElementById(s.id);
    if (el && el.getBoundingClientRect().top <= mid) id = s.id;
  }
  return id;
}

export default function Dock() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const lockUntil = useRef(0);

  useEffect(() => {
    let raf = 0;
    const sync = () => {
      raf = 0;
      if (performance.now() < lockUntil.current) return;
      setActive(sectionAtCentre());
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    const onScrollEnd = () => {
      lockUntil.current = 0;
      sync();
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
    };
  }, []);

  const go = (id: string) => {
    lockUntil.current = performance.now() + LOCK_MS;
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="dock" aria-label="Sections">
      <JellyRadio
        ariaLabel="Go to section"
        items={SECTIONS.map((s) => ({
          value: s.id,
          label: s.label,
          icon: <HugeiconsIcon icon={s.icon} size={16} strokeWidth={2} />,
        }))}
        value={active}
        onChange={go}
        chipColor="#f4f4f5"
        activeColor="#18181b"
        textColor="#3f3f46"
        activeTextColor="#fafafa"
        size="md"
        gap={6}
        radius={18}
      />
    </nav>
  );
}
