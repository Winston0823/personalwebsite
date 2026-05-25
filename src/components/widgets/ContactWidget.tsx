"use client";

import { personalInfo } from "@/lib/detail-content";

export default function ContactWidget() {
  const email = personalInfo.email;
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
      <h2 className="font-semibold uppercase tracking-widest text-accent" style={{ fontSize: "var(--text-widget-title)" }}>
        Let&apos;s Connect
      </h2>
      <a
        href={`mailto:${email}`}
        className="font-normal text-text-secondary hover:text-text-primary transition-colors"
        style={{ fontSize: "var(--text-body)" }}
      >
        {email}
      </a>
      <a
        href={`mailto:${email}`}
        className="px-6 py-2 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
        style={{ fontSize: "var(--text-body)", fontFamily: "var(--font-rounded)" }}
      >
        Say Hello
      </a>
    </div>
  );
}
