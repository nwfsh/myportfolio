"use client";

import { useEffect, useRef } from "react";
import { CATEGORIES, type Project } from "../projects";
import { rich } from "./rich";
import "./ProjectModal.css";

const labelOf = (id: string) => CATEGORIES.find((c) => c.id === id)?.label ?? id;

// "Read more" pop-up for one project: everything on its card plus the technical bullet points
// (which only show here). A native <dialog>, so Esc closes it and focus stays inside; clicking
// the dimmed backdrop closes it too. The page underneath doesn't scroll while it's open.
export default function ProjectModal({
  project: p,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    root.style.overflow = "hidden";
    // No dialog.close() here: that fires the close event, which would call onClose and shut the
    // pop-up right after opening (React runs effects twice in development). Unmounting the
    // dialog takes it off screen anyway.
    return () => {
      root.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="project-modal"
      aria-labelledby="project-modal-title"
      onClose={onClose}
      // The dialog box fills its own area; a click landing on the dialog itself is the backdrop.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      // Iridescent glow follows the cursor, like on the project cards.
      onMouseMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - box.left}px`);
        e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - box.top}px`);
      }}
    >
      <div className="project-modal__body">
        <button type="button" className="project-modal__close" aria-label="Close" onClick={onClose}>
          ×
        </button>

        <header className="project-modal__head">
          <h2 id="project-modal-title">{p.title}</h2>
          {p.date ? <span className="project-modal__date">{p.date}</span> : null}
        </header>
        <div className="pa-meta">
          {p.kind ? <span className="pa-kind">{p.kind}</span> : null}
          {p.categories.map((c) => (
            <span key={c} className="pa-cat">
              {labelOf(c)}
            </span>
          ))}
          {p.award ? <span className="pa-badge">{p.award}</span> : null}
          {p.status ? <span className="pa-badge pa-badge--status">{p.status}</span> : null}
        </div>

        {p.video ? (
          <video
            className="project-modal__video"
            src={p.video}
            poster={p.poster}
            autoPlay
            muted
            loop
            playsInline
            aria-label={`${p.title} demo`}
          />
        ) : null}

        <p className="project-modal__pitch">{rich(p.description)}</p>
        {p.note ? <p className="project-modal__note">{rich(p.note)}</p> : null}

        {p.technical || p.points?.length ? (
          <section className="project-modal__section">
            <h3>Technical</h3>
            {p.technical ? <p>{rich(p.technical)}</p> : null}
            {p.points?.length ? (
              <ul>
                {p.points.map((pt) => (
                  <li key={pt}>{rich(pt)}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <div className="pa-tags">
          {p.tags.map((t) => (
            <span key={t} className="pa-tag">
              {t}
            </span>
          ))}
        </div>
      </div>
    </dialog>
  );
}
