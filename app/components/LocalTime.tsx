"use client";

import { useEffect, useState } from "react";

// Live clock in a fixed time zone (so every visitor sees *your* local time, not theirs).
// Rendered only after mount: the server's build-time clock would never match the visitor's.
export default function LocalTime({ timeZone, className }: { timeZone: string; className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
    const update = () => setTime(format.format(new Date()));
    update();
    // Tick on the next minute boundary, then every minute.
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      update();
      interval = setInterval(update, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [timeZone]);

  return (
    <time className={className} aria-live="off" suppressHydrationWarning>
      {time ?? " "}
    </time>
  );
}
