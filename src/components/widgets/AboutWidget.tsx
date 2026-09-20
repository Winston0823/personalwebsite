"use client";

import { skills } from "@/lib/detail-content";
import SoftwareMarquee from "@/components/common/SoftwareMarquee";

// Curated subset surfaced on the dashboard tile. Full list lives in the
// detail panel. Order matters — first chips read first, and the list is cut
// to exactly what fills two rows at the widget's default width.
// Disciplines only. The software names that used to live here (Unity,
// Unreal, Figma, Blender, Photoshop) moved to the marquee below, so the chips
// and the logo strip say different things instead of repeating each other.
const PREVIEW_SKILLS = [
  "Level Design",
  "Game Systems Design",
  "UI/UX Design",
  "Combat Design",
  "C#",
];

const previewChips = PREVIEW_SKILLS
  .map((name) => skills.find((s) => s.name === name))
  .filter((s): s is NonNullable<typeof s> => Boolean(s));

export default function AboutWidget() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <h2
        className="font-semibold uppercase tracking-widest text-accent mb-3"
        style={{ fontSize: "var(--text-widget-title)" }}
      >
        Skills
      </h2>

      {/* Two rows, enforced by height rather than by chip count: the chips
          wrap naturally and the box is clipped to exactly two rows, so a
          resize can never quietly turn this into three. */}
      <div
        className="flex flex-wrap gap-1.5 content-start overflow-hidden shrink-0"
        style={{ maxHeight: "calc(2 * 1.55rem + 0.375rem)" }}
      >
        {previewChips.map((skill) => (
          <span
            key={skill.name}
            className="inline-flex items-center px-2.5 py-1 rounded-full bg-text-secondary/8 text-text-primary whitespace-nowrap"
            style={{ fontSize: "var(--text-caption)" }}
          >
            {skill.name}
          </span>
        ))}
      </div>

      {/* Software marquee — fills the remaining height, scrolls itself.
          Shared with the Skills inspect. */}
      <div className="mt-auto pt-3">
        <SoftwareMarquee size="sm" />
      </div>
    </div>
  );
}
