"use client";

import { useState } from "react";
import JellyRadio from "./JellyRadio";
import ProjectAccordion from "./ProjectAccordion";
import { CATEGORIES, PROJECTS, type CategoryId } from "../projects";

type Filter = "all" | CategoryId;

const labelOf = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!.label;

export default function ProjectGrid() {
  const [filter, setFilter] = useState<Filter>("all");

  // Filtering only reorders: matching projects move to the front (keeping their original order),
  // the rest follow. Nothing is dimmed or highlighted.
  const matches = (cats: CategoryId[]) => filter === "all" || cats.includes(filter);
  const ordered = [...PROJECTS].sort((a, b) => Number(matches(b.categories)) - Number(matches(a.categories)));
  const count = PROJECTS.filter((p) => matches(p.categories)).length;

  return (
    <>
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

      <ProjectAccordion
        resetKey={filter}
        items={ordered.map((p) => ({ project: p }))}
      />
    </>
  );
}
