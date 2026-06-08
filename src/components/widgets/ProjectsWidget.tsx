"use client";

import { projects } from "@/lib/detail-content";

// Featured projects shown in the widget preview (in display order).
// Edit this list to change which projects appear on the dashboard.
const FEATURED_IDS = ["project-5", "project-7", "project-6", "project-usc-racing"]; // AWL, Unrealtor, Sublime, USC Formula Electric

const featured = FEATURED_IDS.map((id) => projects.find((p) => p.id === id)).filter(
  (p): p is NonNullable<typeof p> => p !== undefined
);

export default function ProjectsWidget() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2
          className="font-semibold uppercase tracking-widest text-accent"
          style={{ fontSize: "var(--text-widget-title)" }}
        >
          Projects
        </h2>
        <span
          className="text-text-secondary"
          style={{ fontSize: "var(--text-caption)" }}
        >
          View All
        </span>
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1 min-h-0">
        {featured.map((project) => (
          <div
            key={project.id}
            className="relative rounded-xl overflow-hidden bg-text-secondary/5 ring-1 ring-black/5 shadow-sm"
            title={project.title}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.thumbnail}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
