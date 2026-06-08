"use client";

import { Project } from "@/lib/detail-types";
import Reveal from "../../shared/Reveal";

/* Act 3 — the write-up, reframed as design decisions rather than a feature list.
   Each block states the problem, the options on the table, the call I made, and
   the result — the way a hiring portfolio should read. Closes on the team's real
   numbers and the live-site CTA. */

function DecisionBlock({
  index,
  title,
  problem,
  call,
  result,
  image,
  imageAlt,
  anchor,
  label,
}: {
  index: string;
  title: string;
  problem: string;
  call: string;
  result: string;
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
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
            <span style={{ color: "#e3b53d" }}>The problem — </span>{problem}
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.85)" }}>
            <span style={{ color: "#e3b53d" }}>The call — </span>{call}
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>
            <span style={{ color: "#e3b53d" }}>The result — </span>{result}
          </p>
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
      {/* The brief / goal */}
      <Reveal className="flex flex-col gap-4 w-full max-w-5xl mx-auto">
        <span
          className="uppercase"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.3em", color: "#e3b53d" }}
        >
          The brief
        </span>
        <p
          className="text-white"
          style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(1.15rem, 2.2vw, 1.6rem)", lineHeight: 1.5, fontWeight: 500 }}
        >
          A student racing team has to recruit engineers, win over sponsors, and look as
          serious as the machines it builds — all from one front door. Every screen had to
          read as a professional motorsport brand while staying a recruiting-first,
          student-run site. I led the design and build.
        </p>
      </Reveal>

      <DecisionBlock
        index="01"
        title="Ten divisions, ten personalities."
        problem="Ten engineering divisions (aero, powertrain, accumulator, frame…) could have been a flat directory of identical pages — accurate, and instantly forgettable."
        call="One templated page system, but each division gets an oversized editorial headline in its own voice, pinned 'polaroid' build photos with handwritten captions, and a prev/next counter. Same skeleton, ten attitudes."
        result="Recruiting pages that feel made by the people who'd be your teammates — not generated from a CMS. Aero literally opens with 'WE MAKE AIR DO WHAT WE WANT.'"
        image="/images/usc-racing/usc-racing-aero.png"
        imageAlt="Aerodynamics division page"
        anchor="usc-divisions"
        label="Divisions"
      />

      <DecisionBlock
        index="02"
        title="Specs as glass, not tables."
        problem="The team's hard numbers — 0–40 in 3.2s, 80 kW, 600 V, 230 kg — are the proof points sponsors care about, but a spec table is where momentum goes to die."
        call="Floating frosted-glass telemetry cards over the hero, set in JetBrains Mono so they read like a live dashboard. The data sits in the world, not in a footnote."
        result="The numbers became part of the cinematic, not a chore to scroll past — and they reinforce the 'this is real engineering' story the render is selling."
        image="/images/usc-racing/usc-racing-sponsorship.png"
        imageAlt="Sponsorship page with telemetry-style stats"
        anchor="usc-specs"
        label="Specs"
      />

      <DecisionBlock
        index="03"
        title="Motion that respects the reader."
        problem="Heavy scroll effects (smooth-scroll, parallax, pixel reveals) are easy to overdo — they thrill once and nauseate forever, and they exclude anyone who's motion-sensitive."
        call="Lenis smooth-scroll lives in a single provider that also owns route-change scroll-reset, framer-motion handles section reveals, and motion-heavy beats yield to prefers-reduced-motion. A feature-flag module gates anything still in flight so the live site never ships half-done."
        result="A site that feels engineered and considered at any scroll speed — and stays usable for people who turn motion off."
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
          <a
            href={cta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full font-semibold transition-transform duration-200 hover:-translate-y-0.5 mt-1"
            style={{
              background: "linear-gradient(180deg,#f2cf6a,#e3b53d)",
              color: "#1a1a1a",
              padding: "0.85rem 1.9rem",
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
              boxShadow: "0 10px 30px -8px rgba(227,181,61,0.5)",
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
