"use client";

import { skills, skillCategories } from "@/lib/detail-content";
import SoftwareMarquee from "@/components/common/SoftwareMarquee";
import { DetailHeader, Hairline } from "./DetailLayout";

// The "tools" category is the software list, and software is the marquee's
// job — showing the same names twice in one panel is the thing that made the
// old version feel cluttered. Everything else is a discipline.
const DISCIPLINE_CATEGORIES = Object.keys(skillCategories).filter((k) => k !== "tools");

export default function AboutDetail() {
  const grouped = DISCIPLINE_CATEGORIES
    .map((key) => ({
      key,
      label: skillCategories[key],
      names: skills.filter((s) => s.category === key).map((s) => s.name),
    }))
    .filter((g) => g.names.length > 0);

  return (
    <div className="detail-stagger flex flex-col gap-10 max-w-2xl mx-auto w-full">
      {/* Title only — the standfirst said what the list below already shows. */}
      <DetailHeader title="Skills" />

      <Hairline />

      {/* A list, not a pill cloud: one skill per line, category names carried
          in the left column so the eye can scan either axis. */}
      <div className="flex flex-col gap-7">
        {grouped.map((group) => (
          <section key={group.key} className="skill-group">
            <h2 className="skill-group__label">{group.label}</h2>
            <ul className="skill-group__list">
              {group.names.map((name) => (
                <li key={name} className="skill-group__item">
                  {name}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Hairline />

      <section className="flex flex-col gap-4">
        <h2 className="skill-group__label">Software</h2>
        <SoftwareMarquee size="lg" label="Software I use" />
      </section>
    </div>
  );
}
