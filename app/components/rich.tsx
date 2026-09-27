import { Fragment, type ReactNode } from "react";

// Text supports **highlights**, like Markdown bold: rich("a **key** phrase") renders "key" in
// <strong className="hl"> (styled in globals.css: near-black, dusty pink underline).
// Nothing else is parsed.
export function rich(text: string): ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="hl">{part}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}
