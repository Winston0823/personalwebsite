"use client";

import { useEffect, useRef, useState } from "react";
import { Project } from "@/lib/detail-types";
import PaperTearReveal from "./PaperTearReveal";
import LayerShowcase from "./LayerShowcase";
import UscProse from "./UscProse";

/* heroStyle: "usc" — "Lights Out".
   Act 1: an F1 start-light gantry stutters on over the wireframe car; drop the
   lights to launch the photoreal render in (scroll locked until then). Act 2:
   the two hero layers + the live liquid-pixel demo. Act 3: the build as design
   decisions, then stats + CTA. Top progress bar + right-rail section nav, like
   the AWL/Sublime pages. */

const ACCENT = "#e3b53d";

export default function UscCinematic({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const navElsRef = useRef<{ id: string; label: string; el: HTMLElement }[]>([]);
  const [opened, setOpened] = useState(false);
  const [navItems, setNavItems] = useState<{ id: string; label: string }[]>([]);
  const [activeId, setActiveId] = useState("");

  // Theme the detail panel + go fullscreen for the duration.
  useEffect(() => {
    document.body.setAttribute("data-detail-theme", "usc");
    window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: true }));
    return () => {
      document.body.removeAttribute("data-detail-theme");
      window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: false }));
    };
  }, []);

  // Lock scroll inside the detail panel until the launch fires.
  useEffect(() => {
    const scroller = rootRef.current?.closest(".detail-scroll") as HTMLElement | null;
    scrollerRef.current = scroller;
    if (!scroller) return;
    scroller.style.overflow = opened ? "" : "hidden";
    return () => {
      scroller.style.overflow = "";
    };
  }, [opened]);

  // Scroll loop: progress bar + active nav item.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const st = scroller.scrollTop;
      if (barRef.current) barRef.current.style.width = `${((max > 0 ? st / max : 0) * 100).toFixed(2)}%`;
      const sTop = scroller.getBoundingClientRect().top;
      const els = navElsRef.current;
      let act = els.length ? els[0].id : "";
      for (const it of els) {
        const top = it.el.getBoundingClientRect().top - sTop + st;
        if (st + scroller.clientHeight * 0.4 >= top) act = it.id;
      }
      setActiveId((p) => (p === act ? p : act));
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [opened]);

  // Build nav from tagged sections.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-usc-section]"));
    const items = els.map((el) => ({ id: el.id, label: el.getAttribute("data-usc-label") || "", el }));
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
    <div ref={rootRef} className="flex flex-col bg-[#050505] text-white" data-cursor-theme="usc">
      {/* Reading-progress hairline */}
      <div className="sticky top-0 z-50 pointer-events-none" style={{ height: 0, opacity: opened ? 1 : 0, transition: "opacity 500ms ease 300ms" }}>
        <div className="relative" style={{ height: 0 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.12)" }} />
          <div ref={barRef} style={{ position: "absolute", top: 0, left: 0, height: 2, width: "0%", background: ACCENT }} />
        </div>
      </div>

      {/* Right-rail section nav */}
      <nav
        className="hidden md:flex fixed z-50 flex-col gap-3 items-end"
        style={{ right: 26, top: "50%", transform: "translateY(-50%)", opacity: opened && navItems.length ? 1 : 0, pointerEvents: opened ? "auto" : "none", transition: "opacity 500ms ease" }}
      >
        {navItems.map((it) => {
          const on = it.id === activeId;
          return (
            <button key={it.id} onClick={() => scrollToId(it.id)} className="group flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0">
              <span
                className="uppercase whitespace-nowrap group-hover:text-white"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.16em", color: on ? "#fff" : "rgba(255,255,255,0.4)", transition: "color 200ms ease" }}
              >
                {it.label}
              </span>
              <span style={{ display: "block", height: 1, width: on ? 30 : 14, background: on ? ACCENT : "rgba(255,255,255,0.35)", transition: "width 250ms ease, background 250ms ease" }} />
            </button>
          );
        })}
      </nav>

      {/* Back button — pinned over the stage */}
      <button
        onClick={onBack}
        className="fixed top-5 left-6 z-50 flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
        style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "rgba(255,255,255,0.8)", textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
      >
        ← all projects
      </button>

      {/* ACT 1 — lights-out launch gate */}
      <section className="relative w-full overflow-hidden" style={{ height: "100vh" }}>
        <PaperTearReveal
          photorealSrc="/images/usc-racing/hero-photoreal.png"
          videoSrc="/usc-start-lights.mp4"
          onOpened={() => setOpened(true)}
        />
        {/* Title lockup, surfaced once launched */}
        <div
          className="absolute inset-x-0 bottom-0 z-30 px-8 pb-8 pointer-events-none flex flex-col gap-2"
          style={{ opacity: opened ? 1 : 0, transform: opened ? "translateY(0)" : "translateY(14px)", transition: "opacity 700ms ease-out 200ms, transform 700ms ease-out 200ms" }}
        >
          <h1 className="text-white" style={{ fontFamily: "var(--font-display, sans-serif)", fontWeight: 700, fontSize: "clamp(2.2rem, 5.5vw, 3.8rem)", letterSpacing: "-0.02em", textShadow: "0 2px 16px rgba(0,0,0,0.6)" }}>
            {project.title}
          </h1>
          <div className="flex items-center gap-3" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>
            <span>{project.role}</span>
            <span className="opacity-40">·</span>
            <span>{project.date}</span>
          </div>
          <span className="uppercase mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.28em", color: ACCENT }}>
            scroll ↓
          </span>
        </div>
      </section>

      {/* ACT 2 — two cars, one hero */}
      <section id="usc-hero" data-usc-section="" data-usc-label="The hero" className="px-6 sm:px-10 py-24 scroll-mt-24">
        <LayerShowcase />
      </section>

      {/* ACT 3 — decisions, stats, CTA */}
      <UscProse project={project} />
    </div>
  );
}
