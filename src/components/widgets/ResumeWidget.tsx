"use client";

import { experience, personalInfo } from "@/lib/detail-content";

export default function ResumeWidget() {
  const recent = experience.slice(0, 3);
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2
          className="font-semibold uppercase tracking-widest text-accent"
          style={{ fontSize: "var(--text-widget-title)" }}
        >
          Experience
        </h2>
        <a
          href={personalInfo.resume ?? "/resume.pdf"}
          download
          className="inline-flex items-center gap-1 text-accent font-medium hover:opacity-80 transition-opacity"
          style={{ fontSize: "var(--text-caption)" }}
          aria-label="Download résumé as PDF"
        >
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12" />
            <path d="M7 10l5 5 5-5" />
            <path d="M5 21h14" />
          </svg>
          PDF
        </a>
      </div>
      <div className="flex flex-col gap-3 flex-1 relative">
        <div className="absolute left-[5px] top-2 bottom-2 w-px bg-accent/20" />
        {recent.map((exp) => (
          <div key={exp.id} className="flex gap-3 items-start relative">
            <div className="w-[11px] h-[11px] rounded-full bg-accent/30 border-2 border-accent shrink-0 mt-0.5 z-10" />
            <div className="min-w-0">
              <p className="text-accent font-medium" style={{ fontSize: "var(--text-caption)" }}>
                {exp.year}
              </p>
              <p className="font-medium text-text-primary leading-snug" style={{ fontSize: "var(--text-body)" }}>
                {exp.role}
              </p>
              <p className="text-text-secondary leading-snug" style={{ fontSize: "var(--text-caption)" }}>
                {exp.company}
                {exp.location ? <span className="opacity-70"> · {exp.location}</span> : null}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
