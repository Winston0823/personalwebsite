"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Project } from "@/lib/detail-types";
import HeartSliceHero from "./HeartSliceHero";
import AwlProse from "./AwlProse";
import Reveal from "../../shared/Reveal";
import InView from "../../shared/InView";
import { isPerfLite } from "@/lib/perf-tier";

// R3F must stay out of SSR (and the main bundle). Loaded only once the AWL
// page mounts.
const KatanaCanvas = dynamic(() => import("./KatanaCanvas"), { ssr: false });

const ACCENT = "#3b82f6";

function engineName(icon?: string): string | null {
  if (!icon) return null;
  if (icon.includes("unreal")) return "Unreal Engine";
  if (icon.includes("unity")) return "Unity";
  return null;
}

/* Masked, word-by-word headline reveal. Each word rides up from behind a clip
   edge, staggered, the moment the cut lands. */
function MaskedHeadline({ shown, lines }: { shown: boolean; lines: string[][] }) {
  let idx = 0;
  return (
    <h2
      className="text-center uppercase"
      style={{
        fontFamily: '"astronef-std-super-normal", var(--font-clash), sans-serif',
        fontWeight: 400,
        fontSize: "clamp(2.4rem, 7.5vw, 6.4rem)",
        lineHeight: 0.98,
        letterSpacing: "-0.02em",
        color: "rgba(255,255,255,0.5)",
        margin: 0,
      }}
    >
      {lines.map((words, li) => (
        <span key={li} className="block">
          {words.map((w) => {
            const delay = 200 + idx * 80;
            idx += 1;
            return (
              <span
                key={`${li}-${w}-${delay}`}
                className="inline-block overflow-hidden align-bottom"
                style={{ marginRight: "0.28em" }}
              >
                <span
                  className="inline-block"
                  style={{
                    transform: shown ? "translateY(0)" : "translateY(110%)",
                    opacity: shown ? 1 : 0,
                    transition: `transform 760ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, opacity 760ms ease-out ${delay}ms`,
                  }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </h2>
  );
}

export default function AwlCinematic({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const katSectionRef = useRef<HTMLDivElement>(null);
  const proseSectionRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0); // katana travel (0..1)
  const barRef = useRef<HTMLDivElement>(null);
  const navElsRef = useRef<{ id: string; label: string; el: HTMLElement }[]>([]);
  const [sliced, setSliced] = useState(false);
  const [navItems, setNavItems] = useState<{ id: string; label: string }[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  const metrics = [
    { label: "Role", value: project.role },
    { label: "Timeline", value: project.details?.devPeriod },
    { label: "Team", value: project.details?.teamSize },
    { label: "Engine", value: engineName(project.engineIcon) },
  ].filter((m) => m.value);

  // Take over the panel: fullscreen + solid-black "awl" theme.
  useEffect(() => {
    document.body.setAttribute("data-detail-theme", "awl");
    window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: true }));
    return () => {
      document.body.removeAttribute("data-detail-theme");
      window.dispatchEvent(new CustomEvent("detail-panel:fullscreen", { detail: false }));
    };
  }, []);

  // Lock scrolling until the heart is sliced; the heart "gates" progress.
  useEffect(() => {
    const scroller = rootRef.current?.closest(".detail-scroll") as HTMLElement | null;
    scrollerRef.current = scroller;
    if (!scroller) return;
    scroller.scrollTop = 0;
    scroller.style.overflow = sliced ? "" : "hidden";
    return () => {
      scroller.style.overflow = "";
    };
  }, [sliced]);

  // Single scroll loop: drives katana travel + top progress bar + active
  // section / marker positions. Refs for the hot path, state only when the
  // discrete section index or marker layout actually changes.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let raf: number | null = null;
    const update = () => {
      raf = null;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const st = scroller.scrollTop;
      const prog = max > 0 ? st / max : 0;
      if (barRef.current) barRef.current.style.width = `${(prog * 100).toFixed(2)}%`;

      const kat = katSectionRef.current;
      if (kat) {
        const span = kat.offsetHeight - scroller.clientHeight;
        const kp = span > 0 ? (st - kat.offsetTop) / span : 0;
        progressRef.current = Math.max(0, Math.min(1, kp));
      }

      // Active section = the last tagged section whose top has crossed the
      // probe line (40% down the viewport).
      const probe = st + scroller.clientHeight * 0.4;
      const sTop = scroller.getBoundingClientRect().top;
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
  }, [sliced]);

  // Build the right-rail nav from sections tagged with [data-awl-section].
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-awl-section]"));
    const items = els.map((el) => ({
      id: el.id,
      label: el.getAttribute("data-awl-label") || "",
      el,
    }));
    navElsRef.current = items;
    setNavItems(items.map(({ id, label }) => ({ id, label })));
  }, []);

  const scrollToId = (id: string) => {
    const scroller = scrollerRef.current;
    const el = document.getElementById(id);
    if (!scroller || !el) return;
    const top =
      el.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop -
      72;
    scroller.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  return (
    <div ref={rootRef} className="relative w-full text-white" data-cursor-theme="awl">
      {/* ── Reading-progress hairline — pinned to top of the scroll viewport ── */}
      <div
        className="sticky top-0 z-50 pointer-events-none"
        style={{ height: 0, opacity: sliced ? 1 : 0, transition: "opacity 500ms ease-out 400ms" }}
      >
        <div className="relative" style={{ height: 0 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.12)" }} />
          <div ref={barRef} style={{ position: "absolute", top: 0, left: 0, height: 2, width: "0%", background: ACCENT }} />
        </div>
      </div>

      {/* ── Clickable section nav — right rail, built from tagged sections.
          Click smooth-scrolls to the section; active item is highlighted. ── */}
      <nav
        className="hidden md:flex fixed z-50 flex-col gap-3 items-end"
        style={{
          right: 26,
          top: "50%",
          transform: "translateY(-50%)",
          opacity: sliced && navItems.length ? 1 : 0,
          pointerEvents: sliced ? "auto" : "none",
          transition: "opacity 500ms ease-out 500ms",
        }}
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
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.16em",
                  color: on ? "#ffffff" : "rgba(255,255,255,0.4)",
                  transition: "color 200ms ease-out",
                }}
              >
                {it.label}
              </span>
              <span
                style={{
                  display: "block",
                  height: 1,
                  width: on ? 30 : 14,
                  background: on ? ACCENT : "rgba(255,255,255,0.35)",
                  transition: "width 250ms ease-out, background 250ms ease-out",
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* ── Act 1 + 2: sticky stage. Demo reel underneath; heart-slice overlay
          covers it until the cut reveals it. Act 3 parallax-scrolls over it. ── */}
      <section className="sticky top-0 overflow-hidden bg-[#050505]" style={{ height: "100vh", zIndex: 0 }}>
        <video
          src="/awl-demo.mp4"
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          style={{
            pointerEvents: "none",
            // Cinematic push-in as the cut reveals the reel.
            transform: sliced ? "scale(1)" : "scale(1.08)",
            transition: "transform 1500ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {/* Cinematic gradient overlay (richer than a flat scrim) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 35%, rgba(0,0,0,0.28) 65%, rgba(0,0,0,0.72) 100%)",
            opacity: sliced ? 1 : 0,
            transition: "opacity 900ms ease-out",
          }}
        />
        {/* Half-opaque overlay headline (masked word reveal) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-6">
          <MaskedHeadline
            shown={sliced}
            lines={[
              ["Love", "only", "gets"],
              ["in", "the", "way"],
            ]}
          />
        </div>

        {/* Act 1 — heart-slice overlay (removes itself after the cut) */}
        <HeartSliceHero onSliced={() => setSliced(true)} />

        <button
          onClick={onBack}
          className="cs-back-top absolute top-5 left-6 z-40 text-white/70 hover:text-white transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}
        >
          ← all projects
        </button>

        {/* Scroll cue — appears once the gate is open */}
        <div
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 pointer-events-none"
          style={{ opacity: sliced ? 1 : 0, transition: "opacity 700ms ease-out 900ms" }}
        >
          <span className="uppercase text-white/60" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.3em" }}>
            scroll
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "awl-bob 2s ease-in-out infinite" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </section>

      {/* ── Act 3a: katana beat. Tall section so the pinned blade has travel; it
          spins and drifts from the right edge to just past center. The title
          lockup + metrics sit in the left column, pinned alongside it. ── */}
      <section
        ref={katSectionRef}
        id="awl-blade"
        data-awl-section=""
        data-awl-label="The blade"
        className="relative bg-[#050505]"
        style={{ height: "190vh", zIndex: 10 }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* 3D katana (background, non-interactive). Lazy-mounted so its WebGL
              context + render loop only exist while the section is near view. */}
          {/* Lite skips the 3D katana (WebGL loop) — the dark stage + label
              still carry the section. */}
          {!isPerfLite() && (
            <InView className="absolute inset-0 pointer-events-none">
              <KatanaCanvas progressRef={progressRef} />
            </InView>
          )}

          {/* Vertical section label on the far edge */}
          <div
            className="absolute right-5 top-1/2 hidden md:block uppercase pointer-events-none"
            style={{
              transform: "translateY(-50%) rotate(90deg)",
              transformOrigin: "right center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.4em",
              color: "rgba(255,255,255,0.35)",
            }}
          >
            <span style={{ color: ACCENT }}>—</span> &nbsp; the blade
          </div>

          {/* Left-column title lockup */}
          <div className="absolute inset-0 flex items-center">
            <div className="px-7 md:px-14 w-full md:max-w-[52%]">
              <Reveal delay={80}>
                <h1
                  className="font-extrabold text-white"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
                    lineHeight: 1.02,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  {project.title}
                </h1>
              </Reveal>
              {project.description && (
                <Reveal delay={160}>
                  <p
                    className="text-white/70"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "clamp(0.92rem, 1.1vw, 1.05rem)",
                      lineHeight: 1.65,
                      marginTop: "1.4rem",
                      maxWidth: "42ch",
                    }}
                  >
                    {project.description}
                  </p>
                </Reveal>
              )}

              {metrics.length > 0 && (
                <Reveal delay={240}>
                  <dl
                    className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5"
                    style={{ marginTop: "2.6rem", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "1.6rem" }}
                  >
                    {metrics.map((m) => (
                      <div key={m.label}>
                        <dt
                          className="uppercase"
                          style={{ fontFamily: "var(--font-mono)", fontSize: "0.64rem", letterSpacing: "0.2em", color: "rgba(255,255,255,0.45)", marginBottom: "0.4rem" }}
                        >
                          {m.label}
                        </dt>
                        <dd
                          className="text-white"
                          style={{ fontFamily: "var(--font-mono)", fontSize: "0.92rem", margin: 0 }}
                        >
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Act 3b: editorial case study — full-width dark reading section. ── */}
      <section ref={proseSectionRef} className="relative bg-[#050505]" style={{ zIndex: 10 }}>
        <div className="px-6 md:px-10 pt-10 pb-28">
          <AwlProse project={project} onBack={onBack} />
        </div>
      </section>
    </div>
  );
}
