"use client";

import { skills, skillCategories } from "@/lib/detail-content";

export default function AboutDetail() {
  const grouped = Object.keys(skillCategories).reduce<Record<string, string[]>>(
    (acc, key) => {
      acc[key] = skills
        .filter((s) => s.category === key)
        .map((s) => s.name);
      return acc;
    },
    {}
  );

  return (
    <div className="detail-stagger flex flex-col gap-5">
      {Object.entries(grouped).map(([key, names]) => (
        <div key={key} className="flex flex-col gap-2">
          <p
            className="uppercase tracking-widest font-semibold text-accent"
            style={{ fontSize: "var(--text-caption)" }}
          >
            {skillCategories[key]}
          </p>
          <div className="flex flex-wrap gap-2">
            {names.map((name) => (
              <span key={name} className="skill-pill">
                {name}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
