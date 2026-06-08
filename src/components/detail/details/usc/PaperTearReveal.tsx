"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/* Act 1 — "Lights out", as a torn-paper reveal.

   The hero (photoreal car) is printed on paper that is ALREADY torn open in the
   TOP-CENTER — a ragged hole through which the full F1 start-light gantry hangs
   (just as it hangs over a real grid). The clip autoplays on load and lights up
   left→right; when it finishes (all five lit) it freezes on its last frame and
   the launch prompt arms. On click the launch fires: the paper lifts away, the
   video clears, and the clean photoreal hero is revealed with a gold bloom +
   speed streaks. `onOpened` then unlocks the page scroll.

   Accessibility: prefers-reduced-motion (or Skip) launches instantly. */

const GOLD = "#e3b53d";

// Ragged top-center hole, in 0–100 viewBox units. Sized to frame the whole
// gantry so every light reads clearly. The video panel behind is a touch larger
// so its edges tuck under the torn paper.
const HOLE = { x0: 15, x1: 85, y0: 5, y1: 49 };

function buildHolePoints(seed: number): string[] {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  const { x0, x1, y0, y1 } = HOLE;
  const jx = 2.4;
  const jy = 2.0;
  const n = 9;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n, y0 + (rnd() * 2 - 1) * jy]); // top L→R
  for (let i = 1; i <= n; i++) pts.push([x1 + (rnd() * 2 - 1) * jx, y0 + ((y1 - y0) * i) / n]); // right T→B
  for (let i = 1; i <= n; i++) pts.push([x1 - ((x1 - x0) * i) / n, y1 + (rnd() * 2 - 1) * jy]); // bottom R→L
  for (let i = 1; i < n; i++) pts.push([x0 + (rnd() * 2 - 1) * jx, y1 - ((y1 - y0) * i) / n]); // left B→T
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`);
}

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

  const holeArr = useMemo(() => buildHolePoints(7), []);
  const points = useMemo(() => holeArr.join(" "), [holeArr]);
  const maskUri = useMemo(() => {
    // Alpha mask: the sheet is opaque white everywhere EXCEPT the hole, which is
    // cut out via an even-odd subpath (transparent → paper hidden → video shows).
    // mask-image defaults to alpha masking, so a transparent hole is the
    // reliable cross-browser way to punch through.
    const holePath = "M " + holeArr.map((p) => p.replace(",", " ")).join(" L ") + " Z";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='M0 0 H100 V100 H0 Z ${holePath}' fill='white' fill-rule='evenodd'/></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [holeArr]);

  const arm = () => setArmed(true);

  const launch = () => {
    if (firedRef.current) return;
    firedRef.current = true;
    setLaunched(true);
    window.setTimeout(() => onOpened(), 780);
  };

  useEffect(() => {
    mountAt.current = performance.now();
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      launch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safety net: if the clip stalls / never ends, arm after a generous timeout.
  useEffect(() => {
    const t = window.setTimeout(() => arm(), 9000);
    return () => clearTimeout(t);
  }, []);

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

      {/* ── Start-light gantry video, seen through the top-center rip ── */}
      <video
        src={videoSrc}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={arm}
        onError={arm}
        style={{
          position: "absolute",
          left: "12%",
          top: "1%",
          width: "76%",
          height: "54%",
          objectFit: "cover",
          objectPosition: "center 60%",
          zIndex: 10,
          opacity: launched ? 0 : 1,
          transform: launched ? "scale(1.08)" : "scale(1)",
          transition: "opacity 520ms ease-out, transform 760ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />

      {/* ── Paper sheet (front), already torn open in the top-center ── */}
      <div className="absolute inset-0" style={{ zIndex: 20, ...paperExit }}>
        {/* masked car print — the hole punches through to the video */}
        <div
          className="absolute inset-0"
          style={{
            WebkitMaskImage: maskUri,
            maskImage: maskUri,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photorealSrc} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 w-full h-full object-cover" style={{ filter: "grayscale(0.3) contrast(0.92) brightness(0.86)" }} />
          {/* warm paper wash so the print reads as matte stock vs. the vivid hero */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: "rgba(244,238,226,0.10)" }} />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: grain, backgroundSize: "120px 120px", mixBlendMode: "overlay", opacity: 0.4 }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(120% 80% at 50% 0%, rgba(0,0,0,0.28), transparent 60%)" }} />
        </div>
        {/* torn-edge paper lip — a faint white stroke tracing the rip */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polygon points={points} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0.5px 0.7px rgba(0,0,0,0.7))" }} />
          <polygon points={points} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="0.18" strokeLinejoin="round" />
        </svg>
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
