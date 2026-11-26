"use client";

import { useEffect, useRef } from "react";
import Folder from "./Folder";
// import DodgeField, { DodgeLabels, tauntIndex } from "./DodgeField";
import { RESUMES } from "../resumes";
import "./ResumeModal.css";

// The View button's labels: "View" at rest, one per dodge, the last once it gives in.
// const TAUNTS = ["View", "Nope", "Too slow", "Almost", "Okay, okay"];

// One page in the folder per resume; clicking a page opens that PDF in a new tab.
const ITEMS = RESUMES.map((r) => ({ title: r.role }));

// The dock's "Resume" pop-up: a folder holding one page per resume. Click the folder to open it,
// then click a page to open that PDF in a new tab. (The earlier list with a dodging View button is
// commented out below.) A native <dialog> like
// the project pop-up, so Esc closes it and focus stays inside; clicking the backdrop closes
// it too.
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
        // No card any more, so a click on the empty space around the folder closes it too.
        const t = e.target as HTMLElement;
        if (t === e.currentTarget || t.matches(".resume-modal__body, .resume-modal__folder")) onClose();
      }}
    >
      <div className="resume-modal__body">
        <button type="button" className="resume-modal__close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2 id="resume-modal-title">Resume</h2>
        <div className="resume-modal__folder">
          <Folder
            label="Resume"
            items={ITEMS}
            color="#a1a1aa"
            theme="light"
            size={typeof window !== "undefined" && window.innerWidth < 480 ? 0.75 : 1.2}
            zoomOnClick={false}
            onItemClick={(_item, index) =>
              void window.open(RESUMES[index].href, "_blank", "noopener,noreferrer")
            }
          />
        </div>
        <p className="resume-modal__intro">Open the folder and pick the one that fits the role.</p>

        {/* The earlier list: one row per resume with a dodging View button.
        <ul className="resume-modal__list">
          {RESUMES.map((r) => (
            <li key={r.role} className="resume-modal__item">
              <span className="resume-modal__role">{r.role}</span>
              <DodgeField
                className="resume-modal__dodge"
                inkColor="#18181b"
                contrastColor="#fafafa"
                fieldHeight={52}
                leap
                radius={70}
                fleeDuration={260}
                taunts={TAUNTS}
              >
                {(state) => (
                  <a
                    className="dodge-field__pill"
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${r.role} resume`}
                  >
                    <DodgeLabels taunts={TAUNTS} index={tauntIndex(TAUNTS, state)} />
                  </a>
                )}
              </DodgeField>
            </li>
          ))}
        </ul>
        */}
      </div>
    </dialog>
  );
}
