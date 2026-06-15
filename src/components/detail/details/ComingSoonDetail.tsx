"use client";

import { useEffect } from "react";
import { Project } from "@/lib/detail-types";

/* A lightweight placeholder detail for projects flagged `comingSoon` — a brief,
   on-brand teaser (hero image + one-paragraph blurb + tags) instead of a full
   case study. Used for Ambit until its real write-up ships. */

const ACCENT = "#e9c98a";

export default function ComingSoonDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  // Go fullscreen for the duration, matching the case-study layouts.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: false }));
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0b0a09] text-white">
      <button
        onClick={onBack}
        className="cs-back-top absolute top-5 left-6 z-50 flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)" }}
      >
        ← all projects
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28 gap-7 w-full max-w-2xl mx-auto">
        {/* Teaser hero */}
        <div
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: "22 / 13", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.85)", outline: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumbnail}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Coming-soon eyebrow */}
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 uppercase"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.26em",
            color: ACCENT,
            background: "rgba(233,201,138,0.10)",
            border: "1px solid rgba(233,201,138,0.28)",
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: 9999, background: ACCENT }} />
          Coming soon
        </span>

        <div className="flex flex-col gap-2">
          <h1 style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 700, fontSize: "clamp(2.2rem, 6vw, 3.4rem)", letterSpacing: "-0.02em" }}>
            {project.title}
          </h1>
          <div
            className="flex items-center justify-center gap-3"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}
          >
            <span>{project.role}</span>
            <span className="opacity-40">·</span>
            <span>{project.date}</span>
          </div>
        </div>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", lineHeight: 1.65, color: "rgba(255,255,255,0.72)" }}>
          {project.longDescription ?? project.description}
        </p>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="tag-pill">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
