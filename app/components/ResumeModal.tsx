"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Download04Icon, File02Icon, LinkSquare02Icon } from "@hugeicons/core-free-icons";
import { RESUMES } from "../resumes";
import "./ResumeModal.css";

// The dock's "Resume" pop-up: one row per resume, each with View (opens the PDF in a new tab)
// and Download. A native <dialog> like the project pop-up, so Esc closes it and focus stays
// inside; clicking the dimmed backdrop closes it too.
export default function ResumeModal({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const root = document.documentElement;
    root.style.overflow = "hidden";
    // No dialog.close() here: it would fire onClose straight after opening (React runs effects
    // twice in development). Unmounting takes the dialog off screen.
    return () => {
      root.style.overflow = "";
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="resume-modal"
      aria-labelledby="resume-modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="resume-modal__body">
        <button type="button" className="resume-modal__close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2 id="resume-modal-title">Resume</h2>
        <p className="resume-modal__intro">Pick the one that fits the role.</p>

        <ul className="resume-modal__list">
          {RESUMES.map((r) => (
            <li key={r.role} className="resume-modal__item">
              <span className="resume-modal__icon" aria-hidden="true">
                <HugeiconsIcon icon={File02Icon} size={20} strokeWidth={1.8} />
              </span>
              <span className="resume-modal__role">{r.role}</span>
              <span className="resume-modal__actions">
                <a href={r.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${r.role} resume`}>
                  <HugeiconsIcon icon={LinkSquare02Icon} size={15} strokeWidth={2} aria-hidden="true" />
                  View
                </a>
                <a href={r.href} download={r.file} aria-label={`Download ${r.role} resume`}>
                  <HugeiconsIcon icon={Download04Icon} size={15} strokeWidth={2} aria-hidden="true" />
                  Download
                </a>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
