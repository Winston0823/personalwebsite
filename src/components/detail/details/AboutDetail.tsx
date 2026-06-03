"use client";

import { skills, skillCategories } from "@/lib/detail-content";
import SectionLabel from "./SectionLabel";
import { DetailHeader, Hairline } from "./DetailLayout";

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
    <div className="detail-stagger flex flex-col gap-10 max-w-2xl mx-auto w-full">
      <DetailHeader
        title="Skills & tools"
        standfirst="The disciplines and software I work across — design, art, and code."
      />

      <Hairline />

      <div className="flex flex-col gap-8">
        {Object.entries(grouped).map(([key, names]) => (
          <div key={key} className="flex flex-col gap-3">
            <SectionLabel caps={false}>{skillCategories[key]}</SectionLabel>
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
    </div>
  );
}
