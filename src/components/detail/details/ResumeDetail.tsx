"use client";

import { personalInfo, skills, skillCategories, experience } from "@/lib/detail-content";

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function ResumeDetail() {
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
    <div className="detail-stagger flex flex-col gap-6">
      {/* Education */}
      <div className="flex flex-col gap-2">
        <p
          className="uppercase tracking-widest font-semibold text-accent"
          style={{ fontSize: "0.8rem" }}
        >
          Education
        </p>
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-white" style={{ fontSize: "1.05rem" }}>
            {personalInfo.university}
          </p>
          <p className="text-white/85" style={{ fontSize: "0.9rem" }}>
            {personalInfo.major}
          </p>
          {personalInfo.minor && (
            <p className="text-white/85" style={{ fontSize: "0.9rem" }}>
              Minor in {personalInfo.minor}
            </p>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="flex flex-col gap-4">
        <p
          className="uppercase tracking-widest font-semibold text-accent"
          style={{ fontSize: "0.8rem" }}
        >
          Experience
        </p>
        <div className="flex flex-col gap-5">
          {experience.map((exp) => (
            <div key={exp.id} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold text-white" style={{ fontSize: "1rem" }}>
                  {exp.role}
                </p>
                <p className="text-white/70" style={{ fontSize: "0.8rem" }}>
                  {exp.start} – {exp.end}
                </p>
              </div>
              <p className="text-white/85" style={{ fontSize: "0.9rem" }}>
                {exp.company}
                {exp.location ? ` · ${exp.location}` : ""}
              </p>
              <ul className="flex flex-col gap-1.5 mt-1 list-disc pl-5 marker:text-white/40">
                {exp.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="text-white/85 leading-relaxed"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Skills by category */}
      <div className="flex flex-col gap-4">
        <p
          className="uppercase tracking-widest font-semibold text-accent"
          style={{ fontSize: "0.8rem" }}
        >
          Skills
        </p>
        {Object.entries(grouped).map(([key, names]) => (
          <div key={key} className="flex flex-col gap-2">
            <p
              className="text-accent font-medium"
              style={{ fontSize: "0.85rem" }}
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

      {/* Download button */}
      <div>
        <a
          href={personalInfo.resume ?? "/resume.pdf"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          style={{ fontFamily: "var(--font-rounded)", fontSize: "0.95rem" }}
        >
          <DownloadIcon />
          Download Resume
        </a>
      </div>
    </div>
  );
}
