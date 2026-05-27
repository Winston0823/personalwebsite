"use client";

import { useEffect, useRef, useState } from "react";

const TICKER_TEXT =
  "available summer 2026 · ui/ux engineer · creative developer · let's build something · ";
const LOOP_DURATION_MS = 40000;
const RADIUS_RATIO = 0.5;
const RADIUS_MIN = 320;
const RADIUS_MAX = 640;
// Push the circle center below the bottom-right viewport corner so the
// visible curve sits lower on the page.
const CENTER_OFFSET_Y = 120;

export default function CornerTicker() {
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const update = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el || dims.w === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const anim = el.animate(
      [
        { transform: "translate(-50%, -50%) rotate(0deg)" },
        { transform: "translate(-50%, -50%) rotate(-360deg)" },
      ],
      { duration: LOOP_DURATION_MS, iterations: Infinity, easing: "linear" }
    );
    return () => anim.cancel();
  }, [dims]);

  if (dims.w === 0) return null;

  const { w, h } = dims;
  const R = Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, Math.min(w, h) * RADIUS_RATIO));
  // SVG box is slightly larger than the circle so glyph ascenders don't clip.
  const size = R * 2 + 80;

  // Pick a font size proportional to R so the text always feels in scale.
  const fontSize = Math.max(12, Math.min(20, R * 0.045));
  // Estimate width per char (em ≈ 0.55 of font size for sans, plus letter-spacing).
  const estCharWidth = fontSize * 0.6;
  const circumference = 2 * Math.PI * R;
  const charsNeeded = Math.ceil((circumference * 1.4) / estCharWidth);
  const repeatCount = Math.max(4, Math.ceil(charsNeeded / TICKER_TEXT.length));
  const fullText = TICKER_TEXT.repeat(repeatCount);

  // Circle path centered at SVG origin (0,0).
  // CW traversal (sweep=1) means the default textPath "left side" is the
  // OUTSIDE of the circle, so letters' BOTTOMS point toward the center
  // (which is exactly what we want).
  const d = `M ${R} 0 A ${R} ${R} 0 1 1 ${-R} 0 A ${R} ${R} 0 1 1 ${R} 0`;

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="fixed pointer-events-none"
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      style={{
        // The SVG is positioned with its CENTER at the bottom-right corner
        // of the viewport, so the upper-left quadrant of the circle curls
        // visibly through the viewport corner.
        left: w,
        top: h + CENTER_OFFSET_Y,
        transform: "translate(-50%, -50%)",
        transformOrigin: "center center",
        overflow: "visible",
        color: "var(--color-text-secondary)",
        zIndex: 5,
        willChange: "transform",
      }}
    >
      <defs>
        <path id="corner-ticker-path" d={d} fill="none" />
      </defs>
      <text
        fill="currentColor"
        opacity={0.5}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: `${fontSize}px`,
          letterSpacing: "0.08em",
        }}
      >
        <textPath href="#corner-ticker-path" startOffset="0%">
          {fullText}
        </textPath>
      </text>
    </svg>
  );
}
