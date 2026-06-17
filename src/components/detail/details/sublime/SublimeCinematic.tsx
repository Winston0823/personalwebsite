"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Project } from "@/lib/detail-types";
import CrtHero from "./CrtHero";
import GlideDescent from "./GlideDescent";
import GlideCurve from "./GlideCurve";
import VistaReveal from "./VistaReveal";
import Reveal from "../../shared/Reveal";
import InView from "../../shared/InView";
import TrailerButton from "../awl/TrailerButton";
import UiCarousel from "./UiCarousel";
import { isPerfLite } from "@/lib/perf-tier";

const TerrainCanvas = dynamic(() => import("./TerrainCanvas"), { ssr: false });

const ACCENT = "#e83a8a"; // the game's pink crystal
const SPLASH = "/images/sublime-splash-web.jpg";
const OUTCOME_IMG = "/images/sublime/outcome.jpg"; // cinematic still for the outcome band

/* ── Editorial primitives (dark, elegant: display headings, sans body) ── */
function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-white"
      style={{
        fontFamily: "var(--font-display, serif)",
        fontSize: "clamp(1.5rem, 2.4vw, 2.1rem)",
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
        marginBottom: "1rem",
      }}
    >
      {children}
    </h3>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-white/75"
      style={{
        fontFamily: "var(--font-sans, sans-serif)",
        fontSize: "clamp(1rem, 1.15vw, 1.12rem)",
        lineHeight: 1.75,
        marginBottom: "1rem",
        maxWidth: "60ch",
      }}
    >
      {children}
    </p>
  );
}

function SectionRow({
  index,
  label,
  anchor,
  children,
}: {
  index: string;
  label: string;
  anchor: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      id={anchor}
      data-sub-section=""
      data-sub-label={label}
      className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-x-10 gap-y-4 scroll-mt-24"
      style={{ paddingTop: "3.5rem", marginTop: "3.5rem", borderTop: "1px solid rgba(255,255,255,0.10)" }}
    >
      <div className="md:sticky md:top-24 self-start">
        <div className="flex items-baseline gap-3 md:flex-col md:gap-1" style={{ fontFamily: "var(--font-mono)" }}>
          <span style={{ color: ACCENT, fontSize: "0.78rem", letterSpacing: "0.12em" }}>{index}</span>
          <span className="uppercase" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "0.22em" }}>{label}</span>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </Reveal>
  );
}

export default function SublimeCinematic({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const terrainSectionRef = useRef<HTMLElement>(null);
  const terrainProgressRef = useRef(0);
  const barRef = useRef<HTMLDivElement>(null);
  const navElsRef = useRef<{ id: string; label: string; el: HTMLElement }[]>([]);
  const [navItems, setNavItems] = useState<{ id: string; label: string }[]>([]);
  const [activeId, setActiveId] = useState("");

  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  const trailerHref =
    project.links?.find((l) => /trailer/i.test(l.label))?.url ??
    (project.videos?.[0] ? project.videos[0].replace("/embed/", "/watch?v=") : "");

  const c = project.contributions ?? [];

  // Take over the panel.
  useEffect(() => {
    document.body.setAttribute("data-detail-theme", "sublime");
    window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: true }));
    return () => {
      document.body.removeAttribute("data-detail-theme");
      window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: false }));
    };
  }, []);

  // Scroll loop: progress bar + terrain camera progress + active nav item.
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
      const ts = terrainSectionRef.current;
      if (ts) {
        const span = ts.offsetHeight - scroller.clientHeight;
        const top = ts.getBoundingClientRect().top - sTop + st;
        terrainProgressRef.current = span > 0 ? Math.max(0, Math.min(1, (st - top) / span)) : 0;
      }

      const probe = st + scroller.clientHeight * 0.4;
      const els = navElsRef.current;
      let act = els.length ? els[0].id : "";
      for (const it of els) {
        const top = it.el.getBoundingClientRect().top - sTop + st;
        if (probe >= top) act = it.id;
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
    <div ref={rootRef} className="relative w-full text-white" data-cursor-theme="sublime">
      {/* Reading-progress hairline */}
      <div className="sticky top-0 z-50 pointer-events-none" style={{ height: 0 }}>
        <div className="relative" style={{ height: 0 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.12)" }} />
          <div ref={barRef} style={{ position: "absolute", top: 0, left: 0, height: 2, width: "0%", background: ACCENT }} />
        </div>
      </div>

      {/* Right-rail section nav */}
      <nav
        className="hidden md:flex fixed z-50 flex-col gap-3 items-end"
        style={{ right: 26, top: "50%", transform: "translateY(-50%)", opacity: navItems.length ? 1 : 0, transition: "opacity 500ms ease" }}
      >
        {navItems.map((it) => {
          const on = it.id === activeId;
          return (
            <button
              key={it.id}
              onClick={() => scrollToId(it.id)}
              className="group flex items-center gap-3 cursor-pointer bg-transparent border-0 p-0"
            >
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

      {/* ① CRT hero (keeps the broadcast motif) */}
      <CrtHero project={project} onBack={onBack} />

      {/* ② Scroll-glide descent into the world */}
      <GlideDescent />

      {/* ③ The question */}
      <section className="relative bg-[#0a0b0d]">
        <Reveal
          id="sub-question"
          data-sub-section=""
          data-sub-label="The question"
          className="mx-auto w-full px-6 md:px-10 flex flex-col items-center justify-center text-center scroll-mt-24"
          style={{ maxWidth: "1080px", minHeight: "64vh", paddingTop: "3rem", paddingBottom: "3rem" }}
        >
          <div className="uppercase mb-7" style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", letterSpacing: "0.34em", color: ACCENT }}>
            The Question
          </div>
          {project.problem && (
            <blockquote className="m-0" style={{ maxWidth: "720px" }}>
              <p className="text-white" style={{ fontFamily: "var(--font-display, serif)", fontSize: "clamp(1.6rem, 3vw, 2.6rem)", lineHeight: 1.3, letterSpacing: "-0.01em", fontWeight: 600 }}>
                {project.problem}
              </p>
            </blockquote>
          )}
        </Reveal>
      </section>

      {/* ④ Overview */}
      <section className="relative bg-[#0a0b0d]">
        <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: "1080px" }}>
          {project.longDescription && (
            <SectionRow index={next()} label="Overview" anchor="sub-overview">
              <Body>{project.longDescription}</Body>
            </SectionRow>
          )}
        </div>
      </section>

      {/* ⑤ The world — 3D terrain flyover */}
      <section
        ref={terrainSectionRef}
        id="sub-world"
        data-sub-section=""
        data-sub-label="The world"
        className="relative bg-[#0a0b0d] scroll-mt-24"
        style={{ height: "190vh" }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Lite skips the 3D terrain flyover (WebGL loop) — dark stage +
              copy still carry the section. */}
          {!isPerfLite() && (
            <InView className="absolute inset-0 pointer-events-none">
              <TerrainCanvas progressRef={terrainProgressRef} />
            </InView>
          )}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div style={{ paddingLeft: "max(1.5rem, calc((100vw - 1040px) / 2))", paddingRight: "1.5rem", maxWidth: "560px" }}>
              <Reveal>
                <div className="flex items-baseline gap-3 mb-4" style={{ fontFamily: "var(--font-mono)" }}>
                  <span style={{ color: ACCENT, fontSize: "0.78rem", letterSpacing: "0.12em" }}>{next()}</span>
                  <span className="uppercase" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "0.22em" }}>The world</span>
                </div>
                <H3>The landscape stays the subject</H3>
                <Body>
                  The route is authored so vistas open at a deliberate cadence — vast, but never overwhelming. You read the world by moving through it, not through menus.
                </Body>
              </Reveal>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(10,11,13,0), #0a0b0d)" }} />
        </div>
      </section>

      {/* ⑥ Glide feel (+ interactive curve) & ⑦ Interface */}
      <section className="relative bg-[#0a0b0d]">
        <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: "1080px" }}>
          {c[0] && (
            <SectionRow index={next()} label="Glide feel" anchor="sub-glide">
              <H3>{c[0].title}</H3>
              <Body>{c[0].detail}</Body>
              <GlideCurve />
            </SectionRow>
          )}
          {c[1] && (
            <SectionRow index={next()} label="Interface" anchor="sub-interface">
              <H3>{c[1].title}</H3>
              <Body>{c[1].detail}</Body>
              {/* UI work — the hand-drawn diegetic interface */}
              <UiCarousel
                items={[
                  { src: "/images/sublime/ui-menu.png", caption: "Start menu — hand-drawn type" },
                  { src: "/images/sublime/ui-panel.png", caption: "Dialogue UI + resource crystal" },
                  { src: "/images/sublime/ui-hud.png", caption: "Pause menu" },
                ]}
              />
            </SectionRow>
          )}
        </div>
      </section>

      {/* ⑧ Awe — vista reveal then the pacing note */}
      <div className="relative bg-[#0a0b0d]" style={{ paddingTop: "4rem" }}>
        <VistaReveal src={SPLASH} caption="awe moments, paced — not all at once" />
      </div>
      <section className="relative bg-[#0a0b0d]">
        <div className="mx-auto w-full px-6 md:px-10" style={{ maxWidth: "1080px" }}>
          {c[2] && (
            <SectionRow index={next()} label="Awe" anchor="sub-awe">
              <H3>{c[2].title}</H3>
              <Body>{c[2].detail}</Body>
            </SectionRow>
          )}
        </div>
      </section>

      {/* ⑨ Outcome — special band */}
      {project.outcome && (
        <Reveal
          id="sub-outcome"
          data-sub-section=""
          data-sub-label="Outcome"
          className="scroll-mt-24"
          style={{ position: "relative", width: "100vw", left: "calc(-50vw + 50%)", marginTop: "4rem" }}
        >
          <div
            className="relative flex items-center"
            style={{
              minHeight: "440px",
              backgroundImage: `linear-gradient(90deg, #0a0b0d 0%, #0a0b0d 44%, rgba(10,11,13,0.35) 64%, rgba(10,11,13,0) 82%), url('${OUTCOME_IMG}')`,
              backgroundSize: "cover",
              backgroundPosition: "center right",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div style={{ width: "100%", paddingLeft: "max(1.5rem, calc((100vw - 1040px) / 2))", paddingRight: "1.5rem", paddingTop: "4rem", paddingBottom: "4rem" }}>
              <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-x-10 gap-y-4" style={{ maxWidth: "720px" }}>
                <div className="md:sticky md:top-24 self-start">
                  <div className="flex items-baseline gap-3 md:flex-col md:gap-1" style={{ fontFamily: "var(--font-mono)" }}>
                    <span style={{ color: ACCENT, fontSize: "0.78rem", letterSpacing: "0.12em" }}>{next()}</span>
                    <span className="uppercase" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", letterSpacing: "0.22em" }}>Outcome</span>
                  </div>
                </div>
                <div className="min-w-0">
                  <H3>Where it landed</H3>
                  <Body>{project.outcome}</Body>
                </div>
              </div>
            </div>
            {trailerHref && (
              <div style={{ position: "absolute", top: "50%", left: "75%", transform: "translate(-50%, -50%)", zIndex: 2 }}>
                <TrailerButton href={trailerHref} size={144} />
              </div>
            )}
          </div>
        </Reveal>
      )}

      {/* Credits */}
      <section className="relative bg-[#0a0b0d]">
        <div className="mx-auto w-full px-6 md:px-10 pb-28" style={{ maxWidth: "1080px" }}>
          <Reveal style={{ marginTop: "3.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.10)" }}>
            {project.team && project.team.length > 0 && (
              <div className="text-white/45 mb-6" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", lineHeight: 1.7 }}>
                {project.team.map((t, i) => (
                  <div key={i}>{t}</div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-white/55">
              <button onClick={onBack} className="hover:text-white transition-colors cursor-pointer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                ← all projects
              </button>
              {project.links?.map((l) => (
                <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                  {l.label.toLowerCase()} ↗
                </a>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
