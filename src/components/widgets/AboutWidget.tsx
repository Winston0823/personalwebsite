"use client";

import { skills } from "@/lib/detail-content";

// Curated subset surfaced on the dashboard tile. Full list lives in the
// detail panel. Order matters — first chips read first.
const PREVIEW_SKILLS = [
  "Unity",
  "Unreal Engine 5",
  "Figma",
  "Game Systems Design",
  "Level Design",
  "UI/UX Design",
  "C#",
  "Blender",
  "Photoshop",
];

const previewChips = PREVIEW_SKILLS
  .map((name) => skills.find((s) => s.name === name))
  .filter((s): s is NonNullable<typeof s> => Boolean(s));

export default function AboutWidget() {
  return (
    <div className="flex flex-col h-full">
      <h2
        className="font-semibold uppercase tracking-widest text-accent mb-3"
        style={{ fontSize: "var(--text-widget-title)" }}
      >
        Skills
      </h2>
      <div className="flex flex-wrap gap-1.5 content-start min-h-0 overflow-hidden">
        {previewChips.map((skill) => (
          <span
            key={skill.name}
            className="inline-flex items-center px-2.5 py-1 rounded-full bg-text-secondary/8 ring-1 ring-black/5 text-text-primary"
            style={{ fontSize: "var(--text-caption)" }}
          >
            {skill.name}
          </span>
        ))}
      </div>
    </div>
  );
}
