"use client";

import { useEffect, useRef, useState } from "react";

/* Act 1 — "Lights out", as a torn-paper reveal.

   The hero (photoreal car) is printed on paper that is torn open in the
   TOP-CENTER — a ragged scrap of real torn paper through which the full F1
   start-light gantry shows (just as it hangs over a real grid). The torn shape
   is a photographed paper texture (torn-paper.png), so every edge is authentic
   rather than a synthetic polygon. The clip autoplays on load and lights up
   left→right; when it finishes (all five lit) it freezes on its last frame and
   the launch prompt arms. On click the launch fires: the paper lifts away, the
   video clears, and the clean photoreal hero is revealed with a gold bloom +
   speed streaks. `onOpened` then unlocks the page scroll.

   Accessibility: prefers-reduced-motion (or Skip) launches instantly. */

const GOLD = "#e3b53d";

// Real torn-paper texture (transparent margins, opaque scrap). Its alpha is the
// mask: the start-lights video shows only where the paper is, so the video
// inherits the photo's authentic ragged/crumpled silhouette.
const PAPER = "/images/usc-racing/torn-paper.png";

// Top-center placement of the torn scrap, matching the old gantry framing so
// every light still reads clearly.
const SCRAP = { left: "12%", top: "1%", width: "76%", height: "54%" } as const;

// Playback rate for the start-lights clip — 1.5× tightens the intro.
const CLIP_RATE = 1.5;
// Marks that the cinematic has been seen this tab/session, so reopening it in
// the same tab skips the buildup. Stored in sessionStorage (not localStorage),
// so it's tab-specific: a fresh tab/window always gets the full intro once.
const SEEN_KEY = "usc-lights-seen-v1";

export default function PaperTearReveal({
  photorealSrc,
  videoSrc,
  onOpened,
}: {
  photorealSrc: string;
  videoSrc: string;
  onOpened: () => void;
}) {
  const [armed, setArmed] = useState(false); // clip finished — awaiting click
  const [launched, setLaunched] = useState(false);
  const firedRef = useRef(false);
  const mountAt = useRef(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const returningRef = useRef(false);

  // Clip the start-lights video to the torn-paper silhouette via the photo's
  // alpha — a raster mask defaults to alpha masking, so the video is visible
  // only where the paper scrap is opaque.
  const videoMask: React.CSSProperties = {
    WebkitMaskImage: `url(${PAPER})`,
    maskImage: `url(${PAPER})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  };

  const arm = () => setArmed(true);

  const launch = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    // Mark this tab as having entered, so a reopen/reload skips the buildup.
    // Written here (on consume) — not at mount — so React StrictMode's double
    // effect invocation in dev can't read back its own write and false-skip.
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked — no persistence, every open replays */
    }
    setLaunched(true);
    window.setTimeout(() => onOpened(), 780);
  };

  useEffect(() => {
    mountAt.current = performance.now();
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      launch();
      return;
    }
    // If this tab has already entered once, skip the buildup: jump straight to
    // the armed end-frame (lights at "lights out") so a single press enters.
    // The flag lives in sessionStorage, so a new tab/window replays the full
    // intro. (Read only here; the write happens in launch(), see above.)
    try {
      if (window.sessionStorage.getItem(SEEN_KEY)) {
        returningRef.current = true;
        setArmed(true);
      }
    } catch {
      /* private mode / storage blocked — fall back to the full intro */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safety net: if the clip stalls / never ends, arm after a timeout (scaled to
  // the faster playback rate).
  useEffect(() => {
    const t = window.setTimeout(() => arm(), 6500);
    return () => clearTimeout(t);
  }, []);

  // Once armed, any key enters the page — mirrors the click-to-launch affordance.
  useEffect(() => {
    if (!armed || launched) return;
    const onKey = () => {
      if (performance.now() - mountAt.current > 500) launch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed, launched]);

  const grain =
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

  const paperExit: React.CSSProperties = {
    transform: launched ? "translateY(-6%) scale(1.06)" : "none",
    opacity: launched ? 0 : 1,
    transition: "transform 820ms cubic-bezier(0.7,0,0.84,0), opacity 680ms ease-in 60ms",
  };

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-[#050505]"
      onClick={() => {
        if (armed && !launched && performance.now() - mountAt.current > 500) launch();
      }}
      style={{ cursor: armed && !launched ? "pointer" : "default" }}
    >
      {/* ── Hero (revealed behind the paper) ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photorealSrc}
        alt="USC Formula Electric — site hero"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          zIndex: 0,
          transform: launched ? "scale(1)" : "scale(1.06)",
          transition: "transform 1000ms cubic-bezier(0.16,1,0.3,1)",
        }}
        draggable={false}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 1,
          left: "50%",
          top: "58%",
          transform: "translate(-50%,-50%)",
          width: "72vw",
          height: "30vh",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(227,181,61,0.18) 0%, rgba(139,0,0,0.12) 42%, transparent 72%)",
          filter: "blur(40px)",
          opacity: launched ? 1 : 0,
          transition: "opacity 900ms ease-out",
        }}
      />

      {/* ── Paper sheet (front) — the hero printed on matte stock ── */}
      <div className="absolute inset-0" style={{ zIndex: 20, ...paperExit }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photorealSrc} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(0.3) contrast(0.92) brightness(0.86)" }} />
        {/* warm paper wash so the print reads as matte stock vs. the vivid hero */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(244,238,226,0.10)" }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: grain, backgroundSize: "120px 120px", mixBlendMode: "overlay", opacity: 0.4 }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(0,0,0,0.28), transparent 60%)" }} />
      </div>

      {/* ── Start-light gantry, clipped to a real torn-paper scrap, laid over
              the print in the top-center. The video inherits the photo's torn
              silhouette; a faint multiply of the paper sells the crumpled stock
              without dimming the lights. Sits above the sheet (z22) so it reads
              as a separate scrap, and peels away with it on launch. ── */}
      <div
        className="absolute"
        style={{
          left: SCRAP.left,
          top: SCRAP.top,
          width: SCRAP.width,
          height: SCRAP.height,
          zIndex: 22,
          filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.5))",
          opacity: launched ? 0 : 1,
          transform: launched ? "translateY(-5%) scale(1.06)" : "none",
          transition: "opacity 520ms ease-out, transform 760ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.playbackRate = CLIP_RATE;
            // Return visit: snap to the final "lights out" frame instead of replaying.
            if (returningRef.current) {
              try {
                v.pause();
                v.currentTime = Math.max(0, v.duration - 0.1);
              } catch {
                /* seeking unsupported — leave it to play through */
              }
            }
          }}
          onEnded={arm}
          onError={arm}
          className="absolute inset-0 w-full h-full"
          style={{ objectFit: "cover", objectPosition: "center 60%", ...videoMask }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PAPER}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "fill", mixBlendMode: "multiply", opacity: 0.3 }}
        />
      </div>

      {/* ── One-shot launch effects ── */}
      {launched && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 25, background: "radial-gradient(circle at 50% 50%, rgba(242,207,106,0.55), rgba(242,207,106,0) 55%)", animation: "usc-launch-bloom 900ms ease-out forwards" }}
          />
          {[40, 52, 64].map((top, i) => (
            <div
              key={top}
              className="absolute pointer-events-none"
              style={{ zIndex: 25, top: `${top}%`, left: 0, width: "62%", height: 2, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)", animation: `usc-streak 650ms ease-out ${i * 70}ms forwards` }}
            />
          ))}
        </>
      )}

      {/* ── Prompt (arms once the lights finish) ── */}
      {!launched && (
        <div className="absolute inset-x-0 flex flex-col items-center pointer-events-none" style={{ bottom: "11%", zIndex: 30 }}>
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.74rem",
              letterSpacing: "0.34em",
              color: armed ? GOLD : "rgba(255,255,255,0.55)",
              textShadow: "0 1px 8px rgba(0,0,0,0.85)",
              animation: armed ? "usc-pulse 1.4s ease-in-out infinite" : undefined,
              transition: "color 300ms ease",
            }}
          >
            {armed ? "lights out — click to launch" : "the grid is forming…"}
          </span>
        </div>
      )}

      {/* ── Skip ── */}
      {!launched && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            launch();
          }}
          className="absolute uppercase cursor-pointer hover:text-white transition-colors"
          style={{ bottom: 22, right: 22, zIndex: 40, fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.5)" }}
        >
          skip →
        </button>
      )}
    </div>
  );
}
