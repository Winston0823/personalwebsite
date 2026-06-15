"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { projects } from "@/lib/detail-content";
import { Project } from "@/lib/detail-types";
import { handleCardMove, handleCardLeave } from "@/lib/card-tilt";
import SectionLabel from "./SectionLabel";
import AwlCinematic from "./awl/AwlCinematic";
import SublimeCinematic from "./sublime/SublimeCinematic";
import UscCinematic from "./usc/UscCinematic";
import ComingSoonDetail from "./ComingSoonDetail";

type FilterValue = "all" | "games" | "ui-ux" | "entrepreneurship";

// Flat, single-level taxonomy. "All" always renders; each domain leaf is pruned
// to those that actually have projects (see ProjectFiltersSidebar), so e.g.
// Entrepreneurship stays hidden until its first project ships.
const FILTER_SECTIONS: { value: FilterValue; header: string }[] = [
  { value: "all", header: "All" },
  { value: "games", header: "Games" },
  { value: "ui-ux", header: "UI / UX" },
  { value: "entrepreneurship", header: "Entrepreneurship" },
];

function ProjectFiltersSidebar({
  active,
  onSelect,
}: {
  active: FilterValue;
  onSelect: (v: FilterValue) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // "All" always shows; a domain leaf shows only when it has ≥1 project, so
  // empty sections self-prune and reappear automatically once filled.
  const sections = FILTER_SECTIONS.filter(
    (s) => s.value === "all" || projects.some((p) => p.domain === s.value)
  );

  return createPortal(
    <div className="filter-sidebar">
      <div className="filter-sidebar__label">Filter</div>
      {sections.map((section, i) => {
        const isLast = i === sections.length - 1;
        return (
          <div key={section.value} className="filter-section">
            <button
              className={`filter-item filter-item--top${
                active === section.value ? " active" : ""
              }`}
              data-cursor="button"
              onClick={() => onSelect(section.value)}
            >
              <span>{section.header}</span>
            </button>
            {!isLast && <div className="filter-section__divider" />}
          </div>
        );
      })}
    </div>,
    document.body
  );
}

function BackArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* ── Level 2: Project Case Study ── */

function CaseImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

/* Prominent closing call-to-action. Louder than the quiet `links` row:
   a centered heading, optional subline, and a solid accent button that
   drives the reader to the live artifact. Opt-in via `project.cta`. */
function CtaBlock({ cta }: { cta: NonNullable<Project["cta"]> }) {
  return (
    <section className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto w-full py-2">
      <SectionLabel>{cta.heading}</SectionLabel>
      {cta.sublabel && (
        <p
          className="text-text-secondary leading-relaxed max-w-md"
          style={{ fontSize: "var(--text-body)" }}
        >
          {cta.sublabel}
        </p>
      )}
      <a
        href={cta.url}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="link"
        className="inline-flex items-center gap-2 rounded-full font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 mt-1"
        style={{
          background: "var(--color-accent)",
          padding: "0.85rem 1.75rem",
          fontSize: "var(--text-body)",
          boxShadow: "0 8px 24px -6px var(--color-accent)",
        }}
      >
        {cta.label}
        <span aria-hidden="true">→</span>
      </a>
    </section>
  );
}

/* Full-bleed hero with two kinds of parallax:
   1. Scroll parallax — background media translates at a fraction of scroll
      speed so it appears to lag behind page scroll.
   2. Cursor parallax — on mousemove, each layer displaces by a different
      amount so the hero reads as 3D. Layers use CSS vars set here. */
function CaseHero({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const isVideo = !!project.heroVideo;
  const isEmbed = isVideo && /^https?:\/\//.test(project.heroVideo!);
  const heroRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  // Scroll parallax
  useEffect(() => {
    const hero = heroRef.current;
    const media = mediaRef.current;
    if (!hero || !media) return;

    const scroller = hero.closest(".detail-scroll") as HTMLElement | null;
    if (!scroller) return;

    let raf: number | null = null;
    const PARALLAX_FACTOR = 0.4;

    const update = () => {
      raf = null;
      const y = scroller.scrollTop;
      media.style.transform = `translate3d(0, ${y * PARALLAX_FACTOR}px, 0)`;
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // Cursor parallax (layered tilt)
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    let raf: number | null = null;
    let latestX = 0;
    let latestY = 0;

    // Per-layer max displacement (px). Higher = larger shift.
    // Background moves LESS than foreground so the text appears closer.
    const BG_RANGE = 14;
    const MID_RANGE = 22; // back button
    const FG_RANGE = 32; // title + pills

    const apply = () => {
      raf = null;
      hero.style.setProperty("--tilt-bg-x", `${latestX * BG_RANGE}px`);
      hero.style.setProperty("--tilt-bg-y", `${latestY * BG_RANGE}px`);
      hero.style.setProperty("--tilt-mid-x", `${latestX * MID_RANGE}px`);
      hero.style.setProperty("--tilt-mid-y", `${latestY * MID_RANGE}px`);
      hero.style.setProperty("--tilt-fg-x", `${latestX * FG_RANGE}px`);
      hero.style.setProperty("--tilt-fg-y", `${latestY * FG_RANGE}px`);
    };

    const onMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      latestX = (e.clientX - rect.left) / rect.width - 0.5;
      latestY = (e.clientY - rect.top) / rect.height - 0.5;
      if (raf === null) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      latestX = 0;
      latestY = 0;
      if (raf === null) raf = requestAnimationFrame(apply);
      hero.classList.add("hero-tilt-reset");
    };

    const onEnter = () => {
      hero.classList.remove("hero-tilt-reset");
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    hero.addEventListener("mouseenter", onEnter);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
      hero.removeEventListener("mouseenter", onEnter);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={heroRef}
      className="case-hero relative -mx-8 mb-2 overflow-hidden bg-black"
      style={{ height: "100vh" }}
    >
      {/* Media layer — taller than the hero so parallax never reveals empty
          space at the bottom. Top is offset upward by the same amount so the
          image is centered visually at scrollTop=0. */}
      <div
        ref={mediaRef}
        className="absolute left-0 right-0"
        style={{ top: "-15%", height: "130%", willChange: "transform" }}
      >
        {isVideo ? (
          isEmbed ? (
            <iframe
              src={project.heroVideo}
              title={`${project.title} hero`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={project.heroVideo}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          )
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover hero-layer-bg"
            style={{ objectPosition: "50% 72%" }}
            decoding="async"
          />
        )}
      </div>

      {/* Top-of-image gradient → keeps the back button readable */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Back button — stays pinned, excluded from parallax */}
      <button
        onClick={onBack}
        className="absolute top-5 left-8 z-10 flex items-center gap-1 text-white cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          fontSize: "var(--text-caption)",
          fontFamily: "var(--font-rounded)",
          textShadow: "0 1px 4px rgba(0,0,0,0.6)",
        }}
      >
        <BackArrow />
        All Projects
      </button>

      {/* Bottom gradient → legibility ramp for title block */}
      <div
        className="absolute inset-x-0 bottom-0 z-0 pointer-events-none"
        style={{
          height: "55%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* Overlaid title + pills */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-8 pb-7 flex flex-col gap-3 hero-layer-fg">
        <h2
          className="font-semibold text-white"
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            textShadow: "0 2px 12px rgba(0,0,0,0.55)",
          }}
        >
          {project.title}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="tag-pill">{project.role}</span>
          <span className="tag-pill">{project.date}</span>
        </div>
      </div>
    </div>
  );
}

/* Phosphor icons (MIT) — inline SVGs so we don't pull in a dep just for
   four glyphs. 256-unit viewBox, fill="currentColor" for token-bound color. */
function IconHourglass() {
  return (
    <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M200,29.32V32a8,8,0,0,1-8,8H184v8a72.08,72.08,0,0,1-40,64.46v15.08A72.08,72.08,0,0,1,184,192v8h8a8,8,0,0,1,8,8v2.68a16,16,0,0,1-12.94,15.7l-118,21.42a16,16,0,0,1-19-15.74V208a8,8,0,0,1,8-8h8v-8a72.08,72.08,0,0,1,40-64.46V112.54A72.08,72.08,0,0,1,72,48V40H64a8,8,0,0,1-8-8V29.32A16,16,0,0,1,75.06,13.62l118-21.42A16,16,0,0,1,200,29.32ZM88,48a56.06,56.06,0,0,0,32,50.6V72h16V98.6A56.06,56.06,0,0,0,168,48V40H88Zm80,144v-8a56.06,56.06,0,0,0-32-50.6V160H120V133.4A56.06,56.06,0,0,0,88,184v8Z"/>
    </svg>
  );
}
function IconUsersThree() {
  return (
    <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-30.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"/>
    </svg>
  );
}
function IconWrench() {
  return (
    <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M226.76,69a8,8,0,0,0-12.84-2.88l-40.3,37.19-17.23-3.7-3.7-17.23,37.19-40.3A8,8,0,0,0,187,29.24,72,72,0,0,0,88,96,72.34,72.34,0,0,0,94,124.94L33.79,177c-.15.12-.29.26-.43.39a32,32,0,0,0,45.26,45.26c.13-.13.27-.28.39-.42L130.06,162A72,72,0,0,0,232,96,71.56,71.56,0,0,0,226.76,69ZM160,152a56.14,56.14,0,0,1-27.07-7,8,8,0,0,0-9.92,1.77L67.11,211.51a16,16,0,0,1-22.62-22.62L109.18,133a8,8,0,0,0,1.77-9.93,56,56,0,0,1,58.36-82.31l-31.2,33.81a8,8,0,0,0-1.94,7.1L141.83,108a8,8,0,0,0,6.14,6.14l26.35,5.66a8,8,0,0,0,7.1-1.94l33.81-31.2A56.06,56.06,0,0,1,160,152Z"/>
    </svg>
  );
}
function IconBookmark() {
  return (
    <svg viewBox="0 0 256 256" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.77-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"/>
    </svg>
  );
}

/* Top-of-page metadata strip rendered right under the hero. Centered rows
   of `[icon] [label] [value]` — quick facts a recruiter can absorb in 3
   seconds. Icons render in the accent color, labels in uppercase accent,
   values in the standard body color. */
function ProjectDetailsBlock({ details }: { details: import("@/lib/detail-types").ProjectDetails }) {
  const rows: { icon: React.ReactNode; label: string; value: React.ReactNode }[] = [];
  if (details.devPeriod) {
    rows.push({ icon: <IconHourglass />, label: "Dev Period", value: details.devPeriod });
  }
  if (details.teamSize) {
    rows.push({ icon: <IconUsersThree />, label: "Team", value: details.teamSize });
  }
  if (details.context) {
    rows.push({ icon: <IconBookmark />, label: "Context", value: details.context });
  }
  if (details.tools && details.tools.length > 0) {
    rows.push({
      icon: <IconWrench />,
      label: "Tools",
      value: (
        <span className="inline-flex flex-wrap gap-x-2 gap-y-1 items-center">
          {details.tools.map((t, i) => (
            <span key={t}>
              {t}
              {i < details.tools!.length - 1 && (
                <span className="text-text-secondary opacity-40 ml-2">·</span>
              )}
            </span>
          ))}
        </span>
      ),
    });
  }
  if (rows.length === 0 && !details.statement) return null;

  return (
    <section className="flex flex-col gap-5">
      {rows.length > 0 && (
        <ul className="flex flex-col items-center gap-2.5 list-none p-0 m-0">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-3">
              <span className="text-accent flex-shrink-0 flex items-center" style={{ width: 14, height: 14 }}>
                {r.icon}
              </span>
              <span
                className="uppercase font-semibold text-accent"
                style={{ fontSize: "0.78rem", letterSpacing: "0.22em" }}
              >
                {r.label}
              </span>
              <span
                className="text-text-primary"
                style={{ fontSize: "var(--text-body)", letterSpacing: "0.04em" }}
              >
                {r.value}
              </span>
            </li>
          ))}
        </ul>
      )}
      {details.statement && (
        <blockquote
          className="border-l-2 border-accent/40 pl-4 italic text-text-secondary leading-relaxed self-center max-w-2xl"
          style={{ fontSize: "var(--text-body)" }}
        >
          {details.statement}
        </blockquote>
      )}
    </section>
  );
}

/* Editorial header — article-style. Title sits on the left typeset like a
   headline; cover lives on the right as a 2:3 portrait poster card. The
   ratio is intentional — narrow-and-tall reads as cinematic / book-cover
   rather than thumbnail, which suits a narrative game like AWL. The card
   uses an inner matting frame (matched-paper-coded) and a subtle lift on
   hover so it feels like a printed object resting in the layout, not a
   placeholder.

   Used when `project.heroStyle === "editorial"`. */
function EditorialHeader({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  return (
    <header className="flex flex-col gap-10 pb-4">
      {/* Back button — same affordance as full-bleed hero, just placed inline */}
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1 text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
        style={{
          fontSize: "var(--text-caption)",
          fontFamily: "var(--font-rounded)",
        }}
      >
        <BackArrow />
        All Projects
      </button>

      <div className="grid grid-cols-[1fr] md:grid-cols-[1fr_minmax(400px,480px)] gap-8 lg:gap-12 items-start">
        {/* ── Left column — article title block ── */}
        <div className="flex flex-col gap-5 min-w-0 pt-1">
          {/* Kicker with leading accent rule — magazine-coded marker that
              this is a case study, not a thumbnail. */}
          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-secondary"
            style={{ fontSize: "var(--text-caption)" }}
          >
            <span
              aria-hidden="true"
              className="block h-px bg-accent"
              style={{ width: 28 }}
            />
            <span
              className="uppercase font-semibold text-accent"
              style={{ fontSize: "0.72rem", letterSpacing: "0.22em" }}
            >
              {project.role}
            </span>
            <span className="opacity-30">·</span>
            <span style={{ letterSpacing: "0.04em" }}>{project.date}</span>
          </div>

          {/* Title row — engine icon (if any) sits to the LEFT of the title,
              vertically centered with the headline block. */}
          <div className="flex items-center gap-5">
            {project.engineIcon && (
              <span
                aria-hidden="true"
                className="flex-shrink-0 self-center"
                style={{ width: 64, height: 64 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.engineIcon}
                  alt=""
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </span>
            )}
            {/* Article title — h1 inherits font-display (Plein) via globals.css */}
            <h1
              className="font-semibold text-text-primary min-w-0"
              style={{
                fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
              }}
            >
              {project.title}
            </h1>
          </div>

          {/* Standfirst — single sentence framing the project */}
          <p
            className="text-text-secondary leading-relaxed"
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
              maxWidth: "42ch",
              lineHeight: 1.55,
            }}
          >
            {project.description}
          </p>

          {/* Hairline rule before tags — newspaper-coded section break */}
          <div
            aria-hidden="true"
            className="bg-text-secondary/15"
            style={{ height: 1, width: 56, marginTop: "0.25rem" }}
          />

          {/* Tags row */}
          <div className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span key={t} className="tag-pill">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right column — 2:3 poster card with inner matting + tilt ──
            Slight leftward translate so the rotated bounding box stays
            inside the panel padding (rotation otherwise pushes the right
            corner off-screen). */}
        <figure
          className="group flex flex-col gap-3 m-0 transition-transform duration-[400ms] ease-out hover:[transform:translateX(-130px)_rotate(0deg)_translateY(-2px)]"
          style={{
            transform: project.posterRotation
              ? `translateX(-130px) rotate(${project.posterRotation}deg)`
              : undefined,
            transformOrigin: "center center",
          }}
        >
          <div
            className="relative rounded-[14px]"
            style={{
              aspectRatio: "2 / 3",
              padding: 10, // matting border around the image
              backgroundColor: "var(--color-cream-paper)",
              boxShadow:
                "0 22px 50px -10px rgba(20,20,30,0.30), 0 8px 16px -6px rgba(20,20,30,0.20), inset 0 0 0 1px rgba(255,255,255,0.55)",
            }}
          >
            {/* Subtle inner frame to make the matting read as deliberate */}
            <div
              aria-hidden="true"
              className="absolute inset-[6px] rounded-[10px] pointer-events-none"
              style={{
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
              }}
            />
            {/* Image clipped into the inner frame */}
            <div
              className="relative w-full h-full overflow-hidden rounded-[8px] bg-black/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.thumbnail}
                alt={project.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Caption beneath the poster — quiet attribution line. Sits
              inside the figure so it inherits the parent rotation. */}
          <figcaption
            className="uppercase tracking-widest text-text-secondary opacity-70 text-center"
            style={{ fontSize: "0.65rem", letterSpacing: "0.22em" }}
          >
            Cover · {project.title}
          </figcaption>
        </figure>
      </div>
    </header>
  );
}

function ContributionList({ items }: { items: import("@/lib/detail-types").Contribution[] }) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((c, i) => (
        <div key={i} className="flex flex-col gap-2">
          <p className="font-semibold text-text-primary" style={{ fontSize: "var(--text-body)" }}>
            {c.title}
          </p>
          <p className="text-text-secondary leading-relaxed" style={{ fontSize: "var(--text-body)" }}>
            {c.detail}
          </p>
          {c.image && <CaseImage src={c.image} alt={c.title} />}
        </div>
      ))}
    </div>
  );
}

function ProcessGallery({ steps }: { steps: import("@/lib/detail-types").ProcessStep[] }) {
  return (
    <div className="flex flex-col gap-5">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {step.before && <CaseImage src={step.before} alt={`${step.caption} — before`} />}
            {step.after && <CaseImage src={step.after} alt={`${step.caption} — after`} />}
          </div>
          <p className="text-text-secondary" style={{ fontSize: "var(--text-caption)" }}>
            {step.caption}
          </p>
        </div>
      ))}
    </div>
  );
}

/* One tilted artifact (polaroid). Cream matting, slight inner frame, hover
   lift. Mirrors the editorial-header poster card styling so the page reads
   as a cohesive moodboard rather than disconnected components. */
function NarrativeMediaCard({
  item,
}: {
  item: import("@/lib/detail-types").NarrativeMedia;
}) {
  const rotate = item.rotate ?? 0;
  const offsetY = item.offsetY ?? 0;
  return (
    <figure
      className="m-0 transition-transform duration-[400ms] ease-out hover:[transform:rotate(0deg)_translateY(-2px)]"
      style={{
        transform: `rotate(${rotate}deg) translateY(${offsetY}px)`,
        transformOrigin: "center center",
      }}
    >
      <div
        className="relative rounded-[12px]"
        style={{
          padding: 10,
          backgroundColor: "var(--color-cream-paper)",
          boxShadow:
            "0 18px 40px -10px rgba(20,20,30,0.28), 0 6px 14px -4px rgba(20,20,30,0.18), inset 0 0 0 1px rgba(255,255,255,0.55)",
        }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-[6px] rounded-[8px] pointer-events-none"
          style={{ boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
        />
        <div className="relative w-full overflow-hidden rounded-[6px] bg-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.alt}
            className="block w-full h-auto"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      {item.caption && (
        <figcaption
          className="uppercase text-text-secondary opacity-70 text-center mt-2"
          style={{ fontSize: "0.62rem", letterSpacing: "0.22em" }}
        >
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* Renders an array of long-form narrative blocks — each one is a section
   title + paragraph + tilted media (sketches, screenshots, mockups).
   Lives between Overview and Contributions so the moodboard-y storytelling
   leads into the cleaner contribution list. */
function NarrativeBlocksSection({
  blocks,
}: {
  blocks: import("@/lib/detail-types").NarrativeBlock[];
}) {
  return (
    <div className="flex flex-col gap-10">
      {blocks.map((block, i) => {
        const layout = block.layout ?? "media-right";
        const hasMedia = block.media && block.media.length > 0;

        const bodyEl = (
          <div className="flex flex-col gap-3 min-w-0">
            <SectionLabel>{block.title}</SectionLabel>
            <p
              className="text-text-secondary leading-relaxed"
              style={{ fontSize: "var(--text-body)", lineHeight: 1.65 }}
            >
              {block.body}
            </p>
          </div>
        );

        if (!hasMedia || layout === "media-below") {
          return (
            <section key={i} className="flex flex-col gap-5 max-w-3xl mx-auto w-full">
              {bodyEl}
              {hasMedia && (
                <div className="flex flex-wrap gap-6 justify-center pt-2">
                  {block.media!.map((m, mi) => (
                    <div key={mi} className="flex-1 min-w-[200px] max-w-[360px]">
                      <NarrativeMediaCard item={m} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        }

        // Stacked layout: cards overlap at rest with the second peeking out
        // from behind the first; on hover they fan apart sideways. Internal
        // rotate/offsetY on each media item is suppressed because the
        // wrapper here owns the transform.
        if (layout === "media-stack") {
          const items = block.media!.slice(0, 2);
          const stackEl = (
            <div
              className="group relative w-full mx-auto"
              style={{ maxWidth: 360, aspectRatio: "5 / 4" }}
            >
              {/* Bottom card — peeks behind */}
              {items[1] && (
                <div className="absolute top-1/2 left-1/2 w-full transition-transform duration-[500ms] ease-out z-10 [transform:translate(-50%,-50%)_translate(14px,8px)_rotate(5deg)] group-hover:[transform:translate(-50%,-50%)_translate(58%,4px)_rotate(11deg)]">
                  <NarrativeMediaCard item={{ ...items[1], rotate: undefined, offsetY: undefined }} />
                </div>
              )}
              {/* Top card — frontmost */}
              <div className="absolute top-1/2 left-1/2 w-full transition-transform duration-[500ms] ease-out z-20 [transform:translate(-50%,-50%)_translate(-14px,-8px)_rotate(-4deg)] group-hover:[transform:translate(-50%,-50%)_translate(-58%,-4px)_rotate(-11deg)]">
                <NarrativeMediaCard item={{ ...items[0], rotate: undefined, offsetY: undefined }} />
              </div>
            </div>
          );

          return (
            <section
              key={i}
              className="grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,380px)] gap-6 lg:gap-10 items-center max-w-3xl mx-auto w-full"
            >
              {bodyEl}
              {stackEl}
            </section>
          );
        }

        // Side-by-side layouts (media-right / media-left) are constrained to
        // the same max-w-3xl reading column as the other prose sections.
        // Sketches shrink to fit alongside the body; the section stays in the
        // same visual margins as Problem / Overview / Outcome.
        const mediaEl = (
          <div className="flex items-start justify-center gap-3 min-w-0">
            {block.media!.map((m, mi) => (
              <div
                key={mi}
                className="flex-1 min-w-0"
                style={{ maxWidth: 180 }}
              >
                <NarrativeMediaCard item={m} />
              </div>
            ))}
          </div>
        );

        return (
          <section
            key={i}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start max-w-3xl mx-auto w-full"
          >
            {layout === "media-left" ? (
              <>
                {mediaEl}
                {bodyEl}
              </>
            ) : (
              <>
                {bodyEl}
                {mediaEl}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

/* Before/after image comparison slider. Takes exactly two media items —
   the first renders on the left, the second on the right, separated by a
   vertical divider that the user can drag to reveal more of one or the
   other. Pointer events handle both mouse and touch. */
function ImageCompareSlider({
  a,
  b,
}: {
  a: import("@/lib/detail-types").NarrativeMedia;
  b: import("@/lib/detail-types").NarrativeMedia;
}) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  };

  return (
    <figure className="m-0">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden select-none"
        data-cursor="compare"
        style={{
          aspectRatio: "16 / 10",
          borderRadius: 6,
          cursor: "ew-resize",
          background: "#0a0a0a",
          touchAction: "none",
        }}
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          updateFromClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
          } catch {
            /* noop */
          }
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
      >
        {/* Bottom layer — image B (right side / second image). Always
            fully drawn beneath. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.src}
          alt={b.alt}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover" }}
          draggable={false}
          loading="lazy"
          decoding="async"
        />
        {/* Top layer — image A (left side / first image), clipped to the
            current slider position via clip-path inset. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={a.src}
          alt={a.alt}
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            clipPath: `inset(0 ${100 - position}% 0 0)`,
            WebkitClipPath: `inset(0 ${100 - position}% 0 0)`,
          }}
          draggable={false}
          loading="lazy"
          decoding="async"
        />
        {/* Divider line + circular drag handle */}
        <div
          className="absolute top-0 bottom-0 pointer-events-none"
          style={{
            left: `${position}%`,
            width: 2,
            background: "rgba(255,255,255,0.85)",
            boxShadow: "0 0 12px rgba(0,0,0,0.6)",
            transform: "translateX(-1px)",
          }}
        >
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center"
            style={{
              width: 38,
              height: 38,
              background: "rgba(255,255,255,0.96)",
              boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
              color: "#0a0a0a",
              fontFamily: "var(--font-mono)",
              fontSize: "0.95rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            ⇆
          </div>
        </div>
      </div>
      {/* Captions row — image A label on the left, image B label on the
          right. Only shown if either media item supplied a caption. */}
      {(a.caption || b.caption) && (
        <figcaption
          className="flex justify-between mt-3 text-white/55"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
        >
          <span>{a.caption ?? ""}</span>
          <span>{b.caption ?? ""}</span>
        </figcaption>
      )}
    </figure>
  );
}

/* Click-to-reveal contribution row used inside the minimal layout.
   Title is a large bold clickable header; optional preview line shows
   beneath it (always visible — gives scanning readers the gist without
   clicking). Full detail expands underneath. Defaults to OPEN on load so
   substance is visible during HR scans; user can collapse to focus. */
function ExpandableContribution({
  c,
}: {
  c: import("@/lib/detail-types").Contribution;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginTop: "1.75rem", marginBottom: "0.25rem" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-baseline gap-3 text-left w-full cursor-pointer hover:opacity-90 transition-opacity"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "clamp(1.4rem, 2.2vw, 1.85rem)",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        <span
          aria-hidden="true"
          className="text-white/55 inline-block transition-transform duration-[220ms] ease-out"
          style={{
            fontSize: "0.65em",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            transformOrigin: "center 55%",
          }}
        >
          ▸
        </span>
        <span className="text-white">{c.title}.</span>
      </button>
      {c.preview && (
        <p
          className="text-white/80"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(1rem, 1.2vw, 1.125rem)",
            lineHeight: 1.6,
            marginTop: "0.6rem",
            paddingLeft: "1.75rem",
          }}
        >
          {c.preview}
        </p>
      )}
      {open && (
        <p
          className="text-white/55"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.92rem, 1.05vw, 1rem)",
            lineHeight: 1.7,
            marginTop: c.preview ? "0.75rem" : "1rem",
            paddingLeft: "1.75rem",
            animation: "fadeIn 220ms ease-out",
          }}
        >
          {c.detail}
        </p>
      )}
    </div>
  );
}

/* ── Minimal case study (heroStyle: "minimal") ──
   Stripped-down editorial: pure-black panel, monospace typography, big
   lowercase title, single ~640px column, no metadata icons / tilted poster
   / accent labels / narrative-block media stacks. Reads as a single quiet
   document. */
function MinimalCaseStudy({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  // Body data-attribute swaps the .detail-panel background to solid black
  // (rule in globals.css). Cleaned up on unmount so subsequent projects
  // revert to the standard glass panel.
  useEffect(() => {
    document.body.setAttribute("data-detail-theme", "minimal");
    return () => {
      document.body.removeAttribute("data-detail-theme");
    };
  }, []);

  // Reuse the case-study fullscreen-panel pattern from the other branches.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: false }));
    };
  }, []);

  const primaryLink = project.links?.[0];

  // Small reusable inline pieces — kept local to this branch so they don't
  // collide with the editorial-branch helpers above.
  const H2 = ({ children }: { children: React.ReactNode }) => (
    <h2
      className="font-bold text-white"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(1.6rem, 2.4vw, 2rem)",
        letterSpacing: "-0.01em",
        marginTop: "4.5rem",
        marginBottom: "1.5rem",
      }}
    >
      {children}
    </h2>
  );
  const Body = ({ children }: { children: React.ReactNode }) => (
    <p
      className="text-white/85"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(1rem, 1.2vw, 1.125rem)",
        lineHeight: 1.7,
        letterSpacing: "0.005em",
        marginBottom: "1rem",
      }}
    >
      {children}
    </p>
  );

  return (
    <div
      className="text-white"
      style={{
        fontFamily: "var(--font-mono)",
        // The panel padding already supplies horizontal breathing room;
        // we just need a centered narrow column for the editorial measure.
      }}
    >
      {/* Top breadcrumb — back link only, left-aligned. */}
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          paddingBottom: "5rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.95rem",
        }}
      >
        <button
          onClick={onBack}
          className="cs-back-top text-white/55 hover:text-white transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← all projects
        </button>
      </div>

      {/* Hero — oversized lowercase title, standfirst, CTA. When the project
          opts into coverLayout="beside-hero", the cover renders as a small
          portrait card to the right of the text column; otherwise it lives
          as a standalone figure below the hero. */}
      {(() => {
        const heroText = (
          <div className="flex flex-col">
            {/* Engine glyph + role/date kicker — top of the column, quiet
                so it signals the stack without competing with the title. */}
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/60"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                marginBottom: "1.75rem",
              }}
            >
              {project.engineIcon && (
                <>
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center justify-center"
                    style={{ width: 18, height: 18 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.engineIcon}
                      alt=""
                      className="w-full h-full"
                      style={{ objectFit: "contain", opacity: 0.85 }}
                    />
                  </span>
                  <span className="opacity-40">·</span>
                </>
              )}
              <span>{project.role.toLowerCase()}</span>
              <span className="opacity-40">·</span>
              <span>{project.date}</span>
              {project.details?.context && (
                <>
                  <span className="opacity-40">·</span>
                  <span>{project.details.context.toLowerCase()}</span>
                </>
              )}
            </div>
            <h1
              className="font-bold text-white"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                marginBottom: "2.5rem",
              }}
            >
              {project.title.toLowerCase()}
            </h1>
            <p
              className="text-white/85"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(1.05rem, 1.35vw, 1.25rem)",
                lineHeight: 1.65,
                maxWidth: "32ch",
                marginBottom: "3rem",
              }}
            >
              {project.description}
            </p>
            {primaryLink && (
              <a
                href={primaryLink.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="inline-flex items-center self-start hover:bg-white/5 transition-colors"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.95rem",
                  color: "white",
                  padding: "0.85rem 1.5rem",
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.55)",
                }}
              >
                → {primaryLink.label.toLowerCase()}
              </a>
            )}
          </div>
        );

        // Soft vignette overlay — fades the image edges to the panel
        // background so the figure feels embedded in the page instead of
        // floating on top of it. Centered on the coverFocus so the
        // feathering happens around the subject, not over it.
        const focus = project.coverFocus ?? "center center";
        const aspect = project.coverAspect ?? "3 / 4";
        const sideCover = project.thumbnail && (
          <figure className="m-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.thumbnail}
              alt={project.title}
              className="block w-full"
              style={{
                aspectRatio: aspect,
                objectFit: "cover",
                objectPosition: focus,
                borderRadius: 6,
              }}
              loading="lazy"
              decoding="async"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 85% 90% at ${focus}, rgba(10,10,10,0) 55%, #0a0a0a 100%)`,
                borderRadius: 6,
              }}
            />
          </figure>
        );

        if (project.coverLayout === "beside-hero" && project.thumbnail) {
          return (
            <header
              style={{ maxWidth: 920, margin: "0 auto", paddingBottom: "6rem" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,360px)] gap-10 md:gap-14 items-center">
                {heroText}
                {sideCover}
              </div>
            </header>
          );
        }

        // Ambient backdrop layout: the cover sits behind the hero text at
        // half opacity, full natural aspect (no crop), with a radial
        // vignette fading its edges into the panel background. Hero text
        // sits on top via stacking context so it remains crisp.
        if (project.coverLayout === "behind-hero" && project.thumbnail) {
          return (
            <header
              className="relative"
              style={{
                maxWidth: 880,
                margin: "0 auto",
                paddingTop: "2rem",
                paddingBottom: "6rem",
                // Reserve enough vertical room so the backdrop has presence.
                minHeight: 520,
              }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.thumbnail}
                  alt=""
                  className="block max-w-full max-h-full"
                  style={{
                    objectFit: "contain",
                    opacity: 0.5,
                    WebkitMaskImage:
                      "radial-gradient(ellipse 75% 80% at center, black 30%, transparent 100%)",
                    maskImage:
                      "radial-gradient(ellipse 75% 80% at center, black 30%, transparent 100%)",
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              {/* Hero text on top — stacked above via relative + z-10 */}
              <div className="relative z-10">{heroText}</div>
            </header>
          );
        }

        // Default: hero text only, cover renders as full-width figure below.
        return (
          <>
            <header
              style={{ maxWidth: 720, margin: "0 auto", paddingBottom: "6rem" }}
            >
              {heroText}
            </header>
            {project.thumbnail && (
              <figure
                className="m-0"
                style={{ maxWidth: 880, margin: "0 auto", paddingBottom: "2rem" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="block w-full h-auto"
                  style={{
                    borderRadius: 6,
                    objectFit: project.coverFocus ? "cover" : undefined,
                    objectPosition: project.coverFocus ?? undefined,
                  }}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            )}
          </>
        );
      })()}

      {/* Sections — each one is bold mono h2 + paragraphs. We pull from
          longDescription, narrativeBlocks, contributions, outcome. */}
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {project.longDescription && (
          <section>
            <H2>the premise.</H2>
            <Body>{project.longDescription}</Body>
          </section>
        )}

        {project.narrativeBlocks?.map((block, i) => (
          <section key={i}>
            <H2>{block.title.toLowerCase()}.</H2>
            <Body>{block.body}</Body>
            {block.media && block.media.length > 0 && (
              <div className="flex flex-col gap-10 mt-8 mb-4">
                {block.layout === "media-compare" && block.media.length >= 2 ? (
                  <ImageCompareSlider a={block.media[0]} b={block.media[1]} />
                ) : (
                  block.media.map((m, mi) => (
                    <figure key={mi} className="m-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.src}
                        alt={m.alt}
                        className="block w-full h-auto"
                        style={{ borderRadius: 6 }}
                        loading="lazy"
                        decoding="async"
                      />
                      {m.caption && (
                        <figcaption
                          className="text-white/55 text-center mt-3"
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.85rem",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {m.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))
                )}
              </div>
            )}
          </section>
        ))}

        {project.contributions && project.contributions.length > 0 && (
          <section>
            <H2>what i built.</H2>
            {project.contributions.map((c, i) =>
              c.expandable ? (
                <ExpandableContribution key={i} c={c} />
              ) : (
                <Body key={i}>
                  <span className="text-white">{c.title}. </span>
                  <span className="text-white/75">{c.detail}</span>
                </Body>
              )
            )}
          </section>
        )}

        {project.outcome && (
          <section>
            <H2>where it landed.</H2>
            <Body>{project.outcome}</Body>
          </section>
        )}

        {/* Credits — quiet, comma-joined inline rather than a labeled
            section, to keep the document feeling like one quiet read. */}
        {project.team && project.team.length > 0 && (
          <section style={{ marginTop: "5rem" }}>
            <p
              className="text-white/45"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
              }}
            >
              {project.team.join(" · ")}
            </p>
          </section>
        )}

        {/* Footer — small back-to-projects + repeat of primary link */}
        <footer
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/55"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            marginTop: "3rem",
            paddingBottom: "1rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "2rem",
          }}
        >
          <button
            onClick={onBack}
            className="hover:text-white transition-colors cursor-pointer"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← all projects
          </button>
          {project.links?.map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              className="hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {l.label.toLowerCase()} ↗
            </a>
          ))}
        </footer>
      </div>
    </div>
  );
}

function ProjectCaseStudy({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  // Tell DetailOverlay to expand the panel to full viewport while the case
  // study is mounted. Reverts on unmount (back button or close).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: true }));
    return () => {
      window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: false }));
    };
  }, []);

  // Coming-soon projects skip the case study entirely — a brief teaser only.
  if (project.comingSoon) {
    return <ComingSoonDetail project={project} onBack={onBack} />;
  }

  // Branch on heroStyle.
  //   "full-bleed" (default) — cinematic CaseHero with parallax (The Sublime).
  //   "editorial"            — title left, tilted poster right (AWL).
  //   "minimal"              — pure-black panel, mono type, narrow column;
  //                            renders its own self-contained layout
  //                            (everything below is skipped).
  if (project.heroStyle === "awl") {
    return <AwlCinematic project={project} onBack={onBack} />;
  }
  if (project.heroStyle === "sublime") {
    return <SublimeCinematic project={project} onBack={onBack} />;
  }
  if (project.heroStyle === "usc") {
    return <UscCinematic project={project} onBack={onBack} />;
  }
  if (project.heroStyle === "minimal") {
    return <MinimalCaseStudy project={project} onBack={onBack} />;
  }
  const isEditorial = project.heroStyle === "editorial";

  return (
    <div className="flex flex-col gap-12">
      {isEditorial ? (
        <EditorialHeader project={project} onBack={onBack} />
      ) : (
        <CaseHero project={project} onBack={onBack} />
      )}

      {/* Project details strip — quick metadata for time-pressed readers */}
      {project.details && <ProjectDetailsBlock details={project.details} />}

      {/* Problem framing — one sentence */}
      {project.problem && (
        <section className="flex flex-col gap-2 max-w-3xl mx-auto w-full">
          <SectionLabel>The Problem</SectionLabel>
          <p className="text-text-primary leading-relaxed" style={{ fontSize: "var(--text-body)" }}>
            {project.problem}
          </p>
        </section>
      )}

      {/* Overview / long description */}
      {project.longDescription && (
        <section className="flex flex-col gap-2 max-w-3xl mx-auto w-full">
          <SectionLabel>Overview</SectionLabel>
          <p className="text-text-secondary leading-relaxed" style={{ fontSize: "var(--text-body)" }}>
            {project.longDescription}
          </p>
        </section>
      )}

      {/* Narrative blocks — decision-point storytelling with tilted media.
          Lives between Overview and Contributions per the AWL Figma. */}
      {project.narrativeBlocks && project.narrativeBlocks.length > 0 && (
        <NarrativeBlocksSection blocks={project.narrativeBlocks} />
      )}

      {/* Contributions */}
      {project.contributions && project.contributions.length > 0 && (
        <section className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <SectionLabel>Contributions</SectionLabel>
          <ContributionList items={project.contributions} />
        </section>
      )}

      {/* Process / iteration */}
      {project.process && project.process.length > 0 && (
        <section className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <SectionLabel>Process</SectionLabel>
          <ProcessGallery steps={project.process} />
        </section>
      )}

      {/* Outcome / takeaways */}
      {project.outcome && (
        <section className="flex flex-col gap-2 max-w-3xl mx-auto w-full">
          <SectionLabel>Outcome</SectionLabel>
          <p className="text-text-secondary leading-relaxed" style={{ fontSize: "var(--text-body)" }}>
            {project.outcome}
          </p>
        </section>
      )}

      {/* Closing call-to-action — the loud "go see it live" beat before the
          quiet metadata sections (tags / credits / links). */}
      {project.cta && <CtaBlock cta={project.cta} />}

      {/* Additional video embeds (beyond hero) */}
      {project.videos && project.videos.length > 0 && (
        <section className="flex flex-col gap-3 max-w-3xl mx-auto w-full">
          <SectionLabel>Watch</SectionLabel>
          <div className="flex flex-col gap-4">
            {project.videos.map((url, i) => (
              <iframe
                key={i}
                src={url}
                title={`${project.title} video ${i + 1}`}
                className="w-full aspect-video rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      <section className="flex flex-col gap-2 max-w-3xl mx-auto w-full">
        <SectionLabel>Tags</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Credits */}
      {project.team && project.team.length > 0 && (
        <section className="flex flex-col gap-2 max-w-3xl mx-auto w-full">
          <SectionLabel>Credits</SectionLabel>
          <ul className="text-text-secondary leading-relaxed" style={{ fontSize: "var(--text-body)" }}>
            {project.team.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Links */}
      {project.links && project.links.length > 0 && (
        <section className="flex flex-col gap-2 max-w-3xl mx-auto w-full">
          <SectionLabel>Links</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {project.links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="link"
                className="tag-pill hover:opacity-90 transition-opacity"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Level 1: Project Grid ── */

function ProjectGrid({
  filter,
  onSelect,
}: {
  filter: FilterValue;
  onSelect: (project: Project) => void;
}) {
  // Two-phase fade: hold the previous filter while cards fade out, then swap
  // the rendered list and fade the new set back in. Layout reflow happens
  // during the opacity-0 window so it's invisible.
  const [renderedFilter, setRenderedFilter] = useState<FilterValue>(filter);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (filter === renderedFilter) return;
    setFading(true);
    const swap = setTimeout(() => {
      setRenderedFilter(filter);
      // Two RAFs so the new cards mount with .is-fading still applied,
      // then transition to opacity 1 on the next frame.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setFading(false));
      });
    }, 180);
    return () => clearTimeout(swap);
  }, [filter, renderedFilter]);

  // Sort by priority (lower = higher in list). Undefined priorities sink to
  // the end but preserve their relative array order so the file acts as a
  // fallback ordering.
  const visible = projects
    .filter((p) => {
      switch (renderedFilter) {
        case "all":
          return p.domain != null;
        case "games":
          return p.domain === "games";
        case "ui-ux":
          return p.domain === "ui-ux";
        case "entrepreneurship":
          return p.domain === "entrepreneurship";
        default:
          return false;
      }
    })
    .map((p, i) => ({ p, i })) // preserve original index for tie-breaking
    .sort((a, b) => {
      const ap = a.p.priority ?? Infinity;
      const bp = b.p.priority ?? Infinity;
      if (ap !== bp) return ap - bp;
      return a.i - b.i;
    })
    .map(({ p }) => p);

  return (
    <div className="flex flex-col gap-5">
      {/* Empty state when a section has no projects yet */}
      {visible.length === 0 && !fading && (
        <div
          className="text-text-secondary text-center py-16"
          style={{ fontSize: "var(--text-body)" }}
        >
          No projects in this category yet — check back soon.
        </div>
      )}
      {/* Grid */}
      <div className={`projects-grid grid grid-cols-2 gap-10${fading ? " is-fading" : ""}`}>
        {visible.map((project) => (
          <div
            key={project.id}
            className="project-card aspect-[4/3]"
            data-cursor="view"
            onClick={() => onSelect(project)}
            onMouseMove={handleCardMove}
            onMouseLeave={handleCardLeave}
          >
            {/* Thumbnail fills the card */}
            <div className="card-media bg-black/5 relative">
              {project.comingSoon && (
                <span
                  className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 uppercase"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.56rem",
                    letterSpacing: "0.16em",
                    color: "#1a1a1a",
                    background: "rgba(233,201,138,0.92)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <span style={{ width: 4, height: 4, borderRadius: 9999, background: "#1a1a1a" }} />
                  Coming soon
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  if (target.parentElement) {
                    target.parentElement.classList.add("flex", "items-center", "justify-center");
                    const span = document.createElement("span");
                    span.textContent = project.title;
                    span.style.fontSize = "var(--text-caption)";
                    span.className = "text-text-secondary font-medium px-2 text-center";
                    target.parentElement.appendChild(span);
                  }
                }}
              />
            </div>

            {/* Info overlay — expands on hover */}
            <div className="card-info">
              <p className="font-semibold" style={{ fontSize: "var(--text-body)" }}>
                {project.title}
              </p>
              <p style={{ fontSize: "var(--text-caption)", color: "rgba(255,255,255,0.75)" }}>
                {project.role}
              </p>
              <p className="card-description">{project.description}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ── */

export default function ProjectsDetail({ initialProjectId }: { initialProjectId?: string }) {
  // When opened from a mobile project card we deep-link straight into that
  // project's case study (skipping the grid). Seed from the initializer so the
  // grid never flashes for a frame before the swap.
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    () => (initialProjectId ? projects.find((p) => p.id === initialProjectId) ?? null : null)
  );
  const [filter, setFilter] = useState<FilterValue>("all");
  const rootRef = useRef<HTMLDivElement>(null);

  // Reset the panel's scroll position whenever we swap between grid and
  // case study. Without this the .detail-scroll container retains scrollTop
  // from the previous view, so opening a project while scrolled down would
  // land mid-page and hide the hero.
  useEffect(() => {
    const scroller = rootRef.current?.closest(".detail-scroll") as HTMLElement | null;
    if (scroller) scroller.scrollTop = 0;
  }, [selectedProject]);

  return (
    <>
      {!selectedProject && (
        <ProjectFiltersSidebar active={filter} onSelect={setFilter} />
      )}
      {/* Intentionally NOT using .detail-stagger on either branch. The
          stagger CSS sets opacity:0 unconditionally; the open-animation only
          runs once, so any later swap (grid ↔ case study) would mount its
          new content invisible with nothing to fade it in. The panel's own
          fade-in covers the initial open. */}
      <div ref={rootRef} className="flex flex-col gap-6">
        {selectedProject ? (
          <ProjectCaseStudy
            project={selectedProject}
            onBack={() => setSelectedProject(null)}
          />
        ) : (
          <ProjectGrid filter={filter} onSelect={setSelectedProject} />
        )}
      </div>
    </>
  );
}
