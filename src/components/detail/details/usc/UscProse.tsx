"use client";

import type { ReactNode } from "react";
import { Project } from "@/lib/detail-types";
import Reveal from "../../shared/Reveal";

/* Act 3 — the write-up, in the team's own first-person voice. Each block is a
   short, plain-spoken take on a design decision (no problem/call/result scaffold),
   the way a recruiting page should read. Closes on the team's real numbers and the
   live-site CTA. */

// Inline gold emphasis for the phrases worth landing on.
function Em({ children }: { children: ReactNode }) {
  return <span style={{ color: "#e3b53d", fontWeight: 600 }}>{children}</span>;
}

function DecisionBlock({
  index,
  title,
  paragraphs,
  image,
  imageAlt,
  anchor,
  label,
}: {
  index: string;
  title: string;
  paragraphs: ReactNode[];
  image?: string;
  imageAlt?: string;
  anchor: string;
  label: string;
}) {
  return (
    <Reveal
      id={anchor}
      data-usc-section=""
      data-usc-label={label}
      className="flex flex-col gap-4 w-full max-w-5xl mx-auto scroll-mt-24"
    >
      <div className="flex items-baseline gap-3">
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#e3b53d", letterSpacing: "0.1em" }}>
          {index}
        </span>
        <h3
          className="text-white"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "clamp(1.4rem, 2.6vw, 1.9rem)", letterSpacing: "-0.01em" }}
        >
          {title}
        </h3>
      </div>
      <div className={image ? "grid grid-cols-1 md:grid-cols-2 gap-6 items-center" : ""}>
        <div className="flex flex-col gap-3">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1.7, color: i === 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.62)" }}
            >
              {p}
            </p>
          ))}
        </div>
        {image && (
          <div
            className="relative w-full overflow-hidden rounded-xl"
            style={{ aspectRatio: "16 / 9", outline: "1px solid rgba(227,181,61,0.18)", boxShadow: "0 18px 50px -16px rgba(0,0,0,0.7)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={imageAlt ?? ""} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
          </div>
        )}
      </div>
    </Reveal>
  );
}

const STATS = [
  { value: "50+", label: "team members" },
  { value: "10", label: "specialized divisions" },
  { value: "2022", label: "founded" },
  { value: "2026", label: "competition year" },
];

export default function UscProse({ project }: { project: Project }) {
  const cta = project.cta;
  return (
    <div className="flex flex-col gap-20 px-6 sm:px-10 pb-24 pt-4">
      {/* Our design goal */}
      <Reveal className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
        <span
          className="uppercase"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.3em", color: "#e3b53d" }}
        >
          Our design goal
        </span>
        <p
          className="text-white"
          style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)", lineHeight: 1.5, fontWeight: 500 }}
        >
          A student racing team has to <Em>recruit engineers</Em>, <Em>win over sponsors</Em>,
          and <Em>look as serious as the machines it builds</Em>. Every screen had to read as
          a professional motorsport brand while staying a recruiting-first, student-run site.
        </p>
      </Reveal>

      <DecisionBlock
        index="01"
        title="Ten divisions, ten personalities."
        paragraphs={[
          <>While there are 10 different subdivisions in our team, we had to show that we
          are one &mdash; while still showing our subtle differences through copy, images,
          and signature coloring.</>,
          <>The CTA is consistent: one bright yellow button that contrasts hard against the
          existing black-and-white palette.</>,
          <>Every title is personalized so the reader remembers it. A recruiting page should
          feel like it was made by the people who&rsquo;d actually be your teammates &mdash;
          Aero literally opens with <Em>&ldquo;WE MAKE AIR DO WHAT WE WANT.&rdquo;</Em></>,
        ]}
        image="/images/usc-racing/usc-racing-aero.png"
        imageAlt="Aerodynamics division page"
        anchor="usc-divisions"
        label="Divisions"
      />

      <DecisionBlock
        index="02"
        title="Specs as glass, not tables."
        paragraphs={[
          <>Numbers are what win sponsors over &mdash; 0&ndash;40 in 3.2 seconds, 80 kW,
          600 volts, 230 kilograms. That&rsquo;s the proof we actually build something
          serious.</>,
          <>But nobody&rsquo;s ever been wowed by a spec table. So instead of rows buried in
          a footer, the numbers float over the car as frosted-glass cards in mono type
          &mdash; less datasheet, more live telemetry.</>,
          <>The specs become part of the cinematic instead of a chore to scroll past. They
          sit in the world, reinforcing the &ldquo;this is real engineering&rdquo; story the
          render is already selling.</>,
        ]}
        image="/images/usc-racing/usc-racing-sponsorship.png"
        imageAlt="Sponsorship page with telemetry-style stats"
        anchor="usc-specs"
        label="Specs"
      />

      <DecisionBlock
        index="03"
        title="Motion that respects the reader."
        paragraphs={[
          <>Motion is the fastest way to look expensive &mdash; and the fastest way to make
          someone seasick. We wanted the site to feel engineered, not like a theme-park
          ride.</>,
          <>So every effect earns its place: the whole page glides on one smooth-scroll,
          sections ease in as you reach them, and anything still half-finished stays behind a
          flag so the live site never ships unpolished.</>,
          <>Flip on reduced motion and it all quietly steps aside. It should feel considered
          at any scroll speed &mdash; and stay usable for anyone who&rsquo;d rather it hold
          still.</>,
        ]}
        anchor="usc-motion"
        label="Motion"
      />

      {/* Stats */}
      <Reveal id="usc-numbers" data-usc-section="" data-usc-label="Numbers" className="w-full max-w-5xl mx-auto scroll-mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-5 py-6 flex flex-col gap-1"
              style={{ background: "rgba(227,181,61,0.06)", border: "1px solid rgba(227,181,61,0.18)" }}
            >
              <span
                className="text-[#e3b53d]"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
              >
                {s.value}
              </span>
              <span className="uppercase text-white/55" style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.18em" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      {cta && (
        <Reveal id="usc-live" data-usc-section="" data-usc-label="Live site" className="flex flex-col items-center text-center gap-3 w-full max-w-5xl mx-auto scroll-mt-24">
          <span
            className="uppercase"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.3em", color: "#e3b53d" }}
          >
            {cta.heading}
          </span>
          {cta.sublabel && (
            <p className="text-white/65 max-w-md" style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1.6 }}>
              {cta.sublabel}
            </p>
          )}
          {/* Mirrors the live team site's CTA button: flat USC-gold pill,
              pure-black text, plain arrow, no glow — but kept in the page's mono
              face for typographic consistency. */}
          <a
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full font-bold transition-transform duration-200 hover:-translate-y-0.5 mt-1"
            style={{
              background: "#e3b53d",
              color: "#000",
              padding: "0.85rem 1.9rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
              boxShadow: "0 6px 16px -8px rgba(0,0,0,0.5)",
            }}
          >
            {cta.label}
            <span aria-hidden="true">→</span>
          </a>
        </Reveal>
      )}
    </div>
  );
}
