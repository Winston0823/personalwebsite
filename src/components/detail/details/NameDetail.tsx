"use client";

import { personalInfo } from "@/lib/detail-content";
import SectionLabel from "./SectionLabel";
import { DetailHeader, Hairline } from "./DetailLayout";

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function NameDetail() {
  return (
    <div className="detail-stagger flex flex-col gap-10 max-w-2xl mx-auto w-full">
      {/* Editorial header — display-font name with the role as standfirst */}
      <DetailHeader title={personalInfo.name} standfirst={personalInfo.title} />

      {/* Divider */}
      <Hairline />

      {/* Bio */}
      <div className="flex flex-col gap-3">
        {personalInfo.bio.map((paragraph, i) => (
          <p
            key={i}
            className="text-text-secondary leading-relaxed"
            style={{ fontSize: "var(--text-body)" }}
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Education */}
      <div className="flex flex-col gap-3">
        <SectionLabel caps={false}>Education</SectionLabel>
        <div className="flex flex-col gap-0.5">
          <p className="font-semibold text-text-primary" style={{ fontSize: "var(--text-body)" }}>
            {personalInfo.university}
          </p>
          <p className="text-text-secondary" style={{ fontSize: "var(--text-caption)" }}>
            {personalInfo.major}
          </p>
          {personalInfo.minor && (
            <p className="text-text-secondary" style={{ fontSize: "var(--text-caption)" }}>
              Minor in {personalInfo.minor}
            </p>
          )}
        </div>
      </div>

      {/* Elsewhere — social links + Resume */}
      <div className="flex flex-col gap-3">
        <SectionLabel caps={false}>Elsewhere</SectionLabel>
        <div className="flex items-center gap-3 flex-wrap">
        {personalInfo.social.linkedin && (
          <a
            href={personalInfo.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-text-primary transition-colors"
            style={{ border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)" }}
          >
            <LinkedInIcon />
          </a>
        )}
        {personalInfo.social.github && (
          <a
            href={personalInfo.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-text-primary transition-colors"
            style={{ border: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(255, 255, 255, 0.04)" }}
          >
            <GitHubIcon />
          </a>
        )}
        {personalInfo.resume && (
          <a
            href={personalInfo.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
            style={{ fontFamily: "var(--font-rounded)", fontSize: "var(--text-caption)" }}
          >
            <DownloadIcon />
            Download Resume
          </a>
        )}
        </div>
      </div>
    </div>
  );
}
