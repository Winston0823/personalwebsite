"use client";

import { useEffect, useRef, useState } from "react";
import { Project } from "@/lib/detail-types";

/* ① High-res → CRT hero, scroll-scrubbed (no cursor interaction).

   The cover painting fills the screen pristine. As the visitor scrolls, the
   image shrinks and "tunes into" a full-screen CRT sitting in the dark — RGB
   phosphor split, aperture-grille cells, dense scanlines, curvature, bloom and
   flicker all ramp with scroll progress `p` (0→1). Climate framing: the living
   world reduced to a flickering broadcast you can watch but no longer reach.

   The three channel-isolated layers with zero offset reconstruct the original
   exactly, so at p=0 it IS the painting; the CRT is purely additive. Everything
   is driven by a single `--p` CSS var (set on scroll) via calc — no rAF, no
   pointer logic. Respects reduced-motion (pristine painting only). */

const PAINTING = "/images/sublime-splash-web.jpg";
// Prebaked chromatic-aberration (RGB-split) version — cross-faded in with
// opacity so the CRT look costs nothing per frame (no live SVG filters).
const CRT = "/images/sublime-splash-crt.jpg";

function engineName(icon?: string): string | null {
  if (!icon) return null;
  if (icon.includes("unreal")) return "Unreal Engine";
  if (icon.includes("unity")) return "Unity";
  return null;
}

export default function CrtHero({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  const metrics = [
    { label: "Role", value: project.role },
    { label: "Engine", value: engineName(project.engineIcon) },
    { label: "Context", value: project.details?.context },
  ].filter((m) => m.value);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setReduced(true);
  }, []);

  // Scroll scrub → push progress into the `--p` CSS var the visuals read.
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    const scroller = section?.closest(".detail-scroll") as HTMLElement | null;
    if (!section || !scroller) return;

    let raf: number | null = null;
    const update = () => {
      raf = null;
      const sRect = scroller.getBoundingClientRect();
      const secRect = section.getBoundingClientRect();
      const topInScroller = secRect.top - sRect.top + scroller.scrollTop;
      const span = section.offsetHeight - scroller.clientHeight;
      const p = span > 0 ? Math.max(0, Math.min(1, (scroller.scrollTop - topInScroller) / span)) : 0;
      section.style.setProperty("--p", p.toFixed(4));
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
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-black"
      style={{ height: reduced ? "100vh" : "240vh", ["--p" as string]: 0 } as React.CSSProperties}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Screen — shrinks (scale) + gains curvature with p. Children are plain
            (cached) image textures, so the per-frame scale is a pure GPU
            transform with no re-raster. */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            background: "#000",
            transform: "scale(calc(1 - var(--p) * 0.42))",
            borderRadius: "calc(var(--p) * 2.6vw) / calc(var(--p) * 3.4vw)",
            willChange: "transform",
          }}
        >
          {/* Pristine painting (always on) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PAINTING} alt={`${project.title} — splash painting`} className="absolute inset-0 w-full h-full object-cover"
               style={{ transform: "translateZ(0)" }} />
          {/* Prebaked CRT (chromatic aberration) cross-fades in with p — opacity
              only, so it never re-rasterizes per frame. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CRT} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover"
               style={{ opacity: "var(--p)" as unknown as number, transform: "translateZ(0)", willChange: "opacity" }} />

          {/* CRT treatment in ONE composited layer (normal blend, no isolation):
              dense scanlines + curvature vignette, fading in with p. */}
          <div className="absolute inset-0 pointer-events-none" style={{
            opacity: "var(--p)" as unknown as number,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px), radial-gradient(125% 125% at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.96) 100%)",
            transform: "translateZ(0)", willChange: "opacity",
          }} />

          {/* Rolling bright scanline (transform-animated — own layer) */}
          <div className="absolute left-0 right-0 pointer-events-none" style={{
            top: 0, height: "16vh", opacity: "var(--p)" as unknown as number,
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.10), transparent)",
            animation: "crt-scanroll 6s linear infinite", willChange: "transform",
          }} />
        </div>

        {/* Back */}
        <button onClick={onBack} className="cs-back-top absolute top-5 left-6 z-40 text-white/75 hover:text-white transition-colors"
                style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", cursor: "pointer" }}>
          ← all projects
        </button>

        {/* Title lockup — fades in as the CRT forms */}
        <div className="absolute left-0 right-0 bottom-[12%] z-20 flex flex-col items-center text-center px-6 pointer-events-none"
             style={{ opacity: "clamp(0, calc((var(--p) - 0.6) * 2.6), 1)" as unknown as number, transform: "translateY(calc((1 - var(--p)) * 14px))" }}>
          <h1 className="text-white" style={{
            fontFamily: "var(--font-display, serif)", fontSize: "clamp(2.6rem, 7vw, 6rem)", fontWeight: 600,
            letterSpacing: "-0.02em", lineHeight: 1, textShadow: "0 4px 34px rgba(0,0,0,0.6)", margin: 0,
          }}>
            {project.title}
          </h1>
          <p className="text-white/85 mt-4" style={{
            fontFamily: "var(--font-mono)", fontSize: "clamp(0.85rem, 1.4vw, 1.05rem)", lineHeight: 1.6,
            maxWidth: "46ch", textShadow: "0 2px 16px rgba(0,0,0,0.7)",
          }}>
            An open world you fall in love with — built so you&apos;ll feel what it costs to lose it.
          </p>
          {metrics.length > 0 && (
            <dl className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-7"
                style={{ borderTop: "1px solid rgba(255,255,255,0.18)", paddingTop: "1.1rem" }}>
              {metrics.map((m) => (
                <div key={m.label} className="text-center">
                  <dt className="uppercase" style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.22em", color: "rgba(255,255,255,0.6)", marginBottom: "0.3rem" }}>{m.label}</dt>
                  <dd className="text-white/90" style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", margin: 0 }}>{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {/* Scroll cue — invites the scrub, fades as it starts */}
        <div className="absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-2 pointer-events-none"
             style={{ opacity: "clamp(0, calc(1 - var(--p) * 5), 1)" as unknown as number }}>
          <span className="uppercase text-white/60" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.3em" }}>scroll to tune in</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "sublime-bob 2s ease-in-out infinite" }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </section>
  );
}
