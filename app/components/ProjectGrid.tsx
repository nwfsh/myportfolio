"use client";

import { useState, type CSSProperties } from "react";
import { LayoutGroup, MotionConfig, motion } from "motion/react";
import JellyRadio from "./JellyRadio";
import { CATEGORIES, PROJECTS, type CategoryId } from "../projects";

type Filter = "all" | CategoryId;

const colorOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.color;
const labelOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.label;

export default function ProjectGrid() {
  const [filter, setFilter] = useState<Filter>("all");

  // Matching projects move to the front (keeping their original order); the rest follow.
  const matches = (cats: CategoryId[]) => filter === "all" || cats.includes(filter);
  const ordered = [...PROJECTS].sort((a, b) => Number(matches(b.categories)) - Number(matches(a.categories)));
  const count = PROJECTS.filter((p) => matches(p.categories)).length;

  return (
    <MotionConfig reducedMotion="user">
      <div className="project-filter">
        <JellyRadio
          ariaLabel="Highlight projects by category"
          items={[{ value: "all", label: "All" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label }))]}
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          chipColor="#f4f4f5"
          activeColor="#f4f4f5"
          textColor="#3f3f46"
          activeTextColor="#18181b"
          size="md"
          gap={14}
          swell={0}
          barge={0}
          shrink={0}
        />
        <p className="project-filter__status" aria-live="polite">
          {filter === "all" ? `${count} projects` : `${count} ${labelOf(filter)} project${count === 1 ? "" : "s"} first`}
        </p>
      </div>

      <LayoutGroup>
        <div className="grid">
          {ordered.map((p) => {
            const on = matches(p.categories);
            return (
              <motion.article
                key={p.title}
                layout="position" /* position only, so the image never stretches mid-move */
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="card project-card"
                data-dim={on ? undefined : ""}
              >
                <div
                  className="project-card__media"
                  style={
                    {
                      "--c1": colorOf(p.categories[0]),
                      "--c2": colorOf(p.categories[1] ?? p.categories[0]),
                    } as CSSProperties
                  }
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={`${p.title} preview`} loading="lazy" />
                  ) : (
                    <span className="project-card__placeholder">Image coming soon</span>
                  )}
                </div>
                <div className="project-card__body">
                  <div className="project-card__cats">
                    {p.categories.map((c) => (
                      <span
                        key={c}
                        className="project-card__cat"
                        data-on={filter === c ? "" : undefined}
                        style={{ "--cat": colorOf(c) } as CSSProperties}
                      >
                        {labelOf(c)}
                      </span>
                    ))}
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <div className="tags">
                    {p.tags.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </LayoutGroup>
    </MotionConfig>
  );
}
