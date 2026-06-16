"use client";

import { useEffect, useRef, useState } from "react";
import { Project } from "@/lib/detail-types";
import Reveal from "../../shared/Reveal";
import AmbitSwatches from "./AmbitSwatches";
import AmbitScreens from "./AmbitScreens";
import {
  ambit, ambitPremise, ambitSystemIntro, ambitBuild, ambitClose,
} from "@/lib/ambit-content";

/* Ambit case study — dark, warm, editorial. Mirrors the Sublime/USC/AWL
   cinematic framework (progress hairline + right-rail section nav + scroll-
   reveal sections), restyled toward the Adrian Zumbrunnen experiments feel:
   sectioned long-scroll, a real color-swatch grid, and category-labeled screen
   cards. Type is Ambit's own pairing (Zodiak Bold display, Plus Jakarta body),
   self-hosted from the Ambit app's font files. Palette confirmed against
   Ambit/constants/theme.ts (the locked source of truth). */

const ACCENT = "#A6C7C2"; // Ambit's signature teal action — the single locked accent
const BG = "#1C1C1A"; // Ambit ink (real token), the case-study ground
const CREAM = "rgba(245,239,228,0.78)";
const ZODIAK = "var(--font-zodiak), Georgia, serif"; // Ambit's real display face
const JAKARTA = "var(--font-jakarta), system-ui, sans-serif";
const MONO = "var(--font-mono)";

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: ZODIAK, fontSize: "clamp(1.6rem, 2.6vw, 2.3rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#F5EFE4", marginBottom: "1rem" }}>
      {children}
    </h3>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: JAKARTA, fontSize: "clamp(1rem, 1.15vw, 1.1rem)", lineHeight: 1.75, color: CREAM, maxWidth: "60ch", marginBottom: "1rem" }}>
      {children}
    </p>
  );
}

function SectionRow({
  index, label, anchor, children,
}: { index: string; label: string; anchor: string; children: React.ReactNode }) {
  return (
    <Reveal
      id={anchor}
      data-sub-section=""
      data-sub-label={label}
      className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-x-10 gap-y-4 scroll-mt-24"
      style={{ paddingTop: "3.5rem", marginTop: "3.5rem", borderTop: "1px solid rgba(245,239,228,0.10)" }}
    >
      <div className="md:sticky md:top-24 self-start">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1" style={{ fontFamily: MONO }}>
          <span style={{ color: ACCENT, fontSize: "0.78rem", letterSpacing: "0.12em" }}>{index}</span>
          <span className="uppercase" style={{ color: "rgba(245,239,228,0.5)", fontSize: "0.72rem", letterSpacing: "0.22em" }}>{label}</span>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </Reveal>
  );
}

export default function AmbitCinematic({
  project, onBack,
}: { project: Project; onBack: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const navElsRef = useRef<{ id: string; label: string; el: HTMLElement }[]>([]);
  const [navItems, setNavItems] = useState<{ id: string; label: string }[]>([]);
  const [activeId, setActiveId] = useState("");

  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  // Take over the panel.
  useEffect(() => {
    document.body.setAttribute("data-detail-theme", "ambit");
    window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: true }));
    return () => {
      document.body.removeAttribute("data-detail-theme");
      window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: false }));
    };
  }, []);

  // Scroll loop: progress bar + active nav item (rAF-batched on the panel scroller).
  useEffect(() => {
    const scroller = rootRef.current?.closest(".detail-scroll") as HTMLElement | null;
    scrollerRef.current = scroller;
    if (!scroller) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const st = scroller.scrollTop;
      if (barRef.current) barRef.current.style.width = `${((max > 0 ? st / max : 0) * 100).toFixed(2)}%`;
      const sTop = scroller.getBoundingClientRect().top;
      const probe = st + scroller.clientHeight * 0.4;
      const els = navElsRef.current;
      let act = els.length ? els[0].id : "";
      for (const it of els) {
        const top = it.el.getBoundingClientRect().top - sTop + st;
        if (probe >= top) act = it.id;
      }
      setActiveId((p) => (p === act ? p : act));
    };
    const onScroll = () => { if (raf === null) raf = requestAnimationFrame(update); };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // Build nav from tagged sections.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-sub-section]"));
    const items = els.map((el) => ({ id: el.id, label: el.getAttribute("data-sub-label") || "", el }));
    navElsRef.current = items;
    setNavItems(items.map(({ id, label }) => ({ id, label })));
  }, []);

  const scrollToId = (id: string) => {
    const scroller = scrollerRef.current;
    const el = document.getElementById(id);
    if (!scroller || !el) return;
    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 72;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  return (
    <div ref={rootRef} className="relative w-full" style={{ background: BG }} data-cursor-theme="ambit">
      {/* Reading-progress hairline */}
      <div className="sticky top-0 z-50 pointer-events-none" style={{ height: 0 }}>
        <div className="relative" style={{ height: 0 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(245,239,228,0.12)" }} />
          <div ref={barRef} style={{ position: "absolute", top: 0, left: 0, height: 2, width: "0%", background: ACCENT }} />
        </div>
      </div>

      {/* Right-rail section nav */}
      <nav className="hidden md:flex fixed z-50 flex-col gap-3 items-end" style={{ right: 26, top: "50%", transform: "translateY(-50%)", opacity: navItems.length ? 1 : 0, transition: "opacity 500ms ease" }}>
        {navItems.map((it) => {
          const on = it.id === activeId;
          return (
            <button key={it.id} onClick={() => scrollToId(it.id)} className="group flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0">
              <span className="uppercase whitespace-nowrap" style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.16em", color: on ? "#F5EFE4" : "rgba(245,239,228,0.4)", transition: "color 200ms ease" }}>
                {it.label}
              </span>
              <span style={{ display: "block", height: 1, width: on ? 30 : 14, background: on ? ACCENT : "rgba(245,239,228,0.35)", transition: "width 250ms ease, background 250ms ease" }} />
            </button>
          );
        })}
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "100dvh" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.thumbnail} alt={project.title} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(28,28,26,0.55) 0%, rgba(28,28,26,0.35) 35%, rgba(28,28,26,0.94) 100%)` }} />

        <button onClick={onBack} className="absolute top-5 left-6 z-30 flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" style={{ fontFamily: MONO, fontSize: "0.8rem", color: "rgba(245,239,228,0.85)" }}>
          ← all projects
        </button>

        <div className="relative z-10 flex flex-col justify-end" style={{ minHeight: "100dvh", padding: "clamp(28px, 5vw, 64px)" }}>
          <div style={{ maxWidth: "46rem" }}>
            <div className="uppercase mb-5" style={{ fontFamily: MONO, fontSize: "0.72rem", letterSpacing: "0.28em", color: ACCENT }}>
              {ambit.eyebrow}
            </div>
            <h1 style={{ fontFamily: ZODIAK, fontWeight: 700, fontSize: "clamp(4rem, 13vw, 9rem)", lineHeight: 0.92, letterSpacing: "-0.03em", color: "#F5EFE4" }}>
              Ambit
            </h1>
            <p className="mt-5" style={{ fontFamily: JAKARTA, fontSize: "clamp(1.05rem, 1.5vw, 1.3rem)", lineHeight: 1.55, color: "rgba(245,239,228,0.82)", maxWidth: "34ch" }}>
              {ambit.tagline}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2" style={{ fontFamily: MONO, fontSize: "0.78rem", color: "rgba(245,239,228,0.6)" }}>
              <span>{ambit.role}</span>
              <span style={{ opacity: 0.4 }}>/</span>
              <span>{ambit.date}</span>
            </div>
            <div className="mt-1.5" style={{ fontFamily: MONO, fontSize: "0.74rem", color: "rgba(245,239,228,0.45)" }}>
              {ambit.credit}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="mx-auto w-full px-6 md:px-10 pb-28" style={{ maxWidth: "1080px" }}>
        <SectionRow index={next()} label="Premise" anchor="sub-premise">
          <H3>Meet the person, not the PDF</H3>
          <Body>{ambitPremise}</Body>
        </SectionRow>

        <SectionRow index={next()} label="System" anchor="sub-system">
          <H3>A small, strict design system</H3>
          <Body>{ambitSystemIntro}</Body>
          <div className="mt-8">
            <AmbitSwatches />
          </div>
        </SectionRow>

        <SectionRow index={next()} label="Screens" anchor="sub-screens">
          <H3>The flow, screen by screen</H3>
          <Body>A chat-first onboarding that asks for vibe before résumé, then routes you by role, skills, and who is actually nearby.</Body>
          <div className="mt-8">
            <AmbitScreens />
          </div>
        </SectionRow>

        <SectionRow index={next()} label="Build" anchor="sub-build">
          <H3>Built solo, zero to one</H3>
          <Body>{ambitBuild}</Body>
          <div className="mt-3 flex flex-wrap gap-2">
            {ambit.stack.map((t) => (
              <span key={t} style={{ fontFamily: MONO, fontSize: "0.72rem", color: "rgba(245,239,228,0.7)", background: "rgba(245,239,228,0.06)", border: "1px solid rgba(245,239,228,0.1)", padding: "5px 11px", borderRadius: 9999 }}>
                {t}
              </span>
            ))}
          </div>
        </SectionRow>

        {/* Close */}
        <Reveal style={{ marginTop: "3.5rem", paddingTop: "2.5rem", borderTop: "1px solid rgba(245,239,228,0.10)" }}>
          <p style={{ fontFamily: ZODIAK, fontWeight: 700, fontSize: "clamp(1.4rem, 2.4vw, 2rem)", lineHeight: 1.25, color: "#F5EFE4", maxWidth: "24ch" }}>
            {ambitClose}
          </p>
          <button onClick={onBack} className="mt-8 hover:opacity-80 transition-opacity cursor-pointer" style={{ fontFamily: MONO, fontSize: "0.8rem", color: "rgba(245,239,228,0.6)" }}>
            ← all projects
          </button>
        </Reveal>
      </div>
    </div>
  );
}
