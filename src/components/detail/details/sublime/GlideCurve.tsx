"use client";

import { useEffect, useRef, useState } from "react";

/* Interactive, diegetic glide-curve chart for the "glide feel" contribution.
   Glide speed over a flight: a quick climb to terminal velocity, then two
   recovery dips (the cadence after maneuvers). The line draws itself when it
   scrolls in; drag/hover across it to scrub a readout (phase + speed). */

const ACCENT = "#e0aa5a";
const N = 90;
const W = 600;
const H = 300;
const PX0 = 60;
const PX1 = 560;
const PY0 = 26;
const PY1 = 250;

const sx = (t: number) => PX0 + t * (PX1 - PX0);
const sy = (s: number) => PY1 - s * (PY1 - PY0);

function speed(t: number) {
  const base = 0.92 * (1 - Math.exp(-t * 9)); // climb to terminal
  const dip1 = -0.12 * Math.exp(-((t - 0.5) ** 2) / 0.002);
  const dip2 = -0.1 * Math.exp(-((t - 0.8) ** 2) / 0.0016);
  return Math.max(0.05, Math.min(0.98, base + dip1 + dip2));
}

function phase(t: number) {
  if (t < 0.16) return "Accelerate";
  if (Math.abs(t - 0.5) < 0.06 || Math.abs(t - 0.8) < 0.05) return "Recovery";
  return "Terminal velocity";
}

export default function GlideCurve() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const [drawn, setDrawn] = useState(false);
  const [hx, setHx] = useState(0.34);

  let line = `M ${sx(0)} ${sy(speed(0))}`;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    line += ` L ${sx(t).toFixed(1)} ${sy(speed(t)).toFixed(1)}`;
  }
  const area = `${line} L ${sx(1)} ${sy(0)} L ${sx(0)} ${sy(0)} Z`;

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const root = el.closest(".detail-scroll") as HTMLElement | null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { root, threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onScrub = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const xv = ((e.clientX - r.left) / r.width) * W;
    setHx(Math.max(0, Math.min(1, (xv - PX0) / (PX1 - PX0))));
  };

  const s = speed(hx);
  const termY = sy(0.92);

  return (
    <div ref={wrapRef} style={{ marginTop: "1.6rem" }}>
      {/* Readout */}
      <div className="flex items-baseline gap-4 mb-2" style={{ fontFamily: "var(--font-mono)" }}>
        <span style={{ color: ACCENT, fontSize: "1.4rem", fontWeight: 600 }}>
          {Math.round(s * 100)}
          <span style={{ fontSize: "0.7rem", opacity: 0.6 }}> %v</span>
        </span>
        <span
          className="uppercase"
          style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.7rem", letterSpacing: "0.22em" }}
        >
          {phase(hx)}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ touchAction: "none", cursor: "crosshair", display: "block" }}
        onPointerDown={onScrub}
        onPointerMove={onScrub}
      >
        <defs>
          <linearGradient id="glide-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.28" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Baseline + terminal-velocity reference */}
        <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <line
          x1={PX0}
          y1={termY}
          x2={PX1}
          y2={termY}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
          strokeDasharray="3 5"
        />
        <text
          x={PX1}
          y={termY - 6}
          textAnchor="end"
          style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em" }}
          fill="rgba(255,255,255,0.4)"
        >
          TERMINAL VELOCITY
        </text>

        {/* Area + line */}
        <path d={area} fill="url(#glide-fill)" style={{ opacity: drawn ? 1 : 0, transition: "opacity 900ms ease 300ms" }} />
        <path
          ref={pathRef}
          d={line}
          fill="none"
          stroke={ACCENT}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: len || undefined,
            strokeDashoffset: drawn ? 0 : len,
            transition: "stroke-dashoffset 1500ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />

        {/* Scrub guide + handle */}
        <line x1={sx(hx)} y1={PY0} x2={sx(hx)} y2={PY1} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <circle cx={sx(hx)} cy={sy(s)} r="6" fill="#fff" stroke={ACCENT} strokeWidth="2" />

        {/* Axis labels */}
        <text x={PX0} y={PY1 + 18} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.18em" }} fill="rgba(255,255,255,0.4)">
          LAUNCH
        </text>
        <text x={PX1} y={PY1 + 18} textAnchor="end" style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.18em" }} fill="rgba(255,255,255,0.4)">
          LANDING
        </text>
      </svg>

      <p
        className="uppercase"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.24em",
          color: "rgba(255,255,255,0.35)",
          marginTop: "0.5rem",
        }}
      >
        drag across the curve
      </p>
    </div>
  );
}
