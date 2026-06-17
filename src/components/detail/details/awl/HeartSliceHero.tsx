"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { isPerfLite } from "@/lib/perf-tier";

// R3F heart — client-only, kept out of SSR + the main bundle.
const HeartCanvas = dynamic(() => import("./HeartCanvas"), { ssr: false });

// Lite fallback: a flat static heart so weak devices skip the WebGL context +
// per-frame shader entirely (the Three.js chunk never even loads).
function StaticHeart() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <svg width="190" height="190" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="#e0224a"
          style={{ filter: "drop-shadow(0 6px 24px rgba(224,34,74,0.45))" }}
        />
      </svg>
    </div>
  );
}

/* ── Geometry ──────────────────────────────────────────────────────────────
   Split a w×h rectangle by an infinite line through point P with unit normal
   n, returning the polygon of the half where (X−P)·n ≥ 0. We walk the four
   rectangle edges in order, emitting inside-corners and edge crossings, so the
   returned points are already in boundary order — ready for clip-path. */
type Pt = [number, number];

function halfPlanePolygon(w: number, h: number, P: Pt, n: Pt): Pt[] {
  const corners: Pt[] = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const side = (pt: Pt) => (pt[0] - P[0]) * n[0] + (pt[1] - P[1]) * n[1];
  const pts: Pt[] = [];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    const da = side(a);
    const db = side(b);
    if (da >= 0) pts.push(a);
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db);
      pts.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return pts;
}

const toClip = (pts: Pt[]) =>
  `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;

/* Distance from point C to the segment A→B — used to confirm the slash
   actually crossed the heart, not just any random drag on the field. */
function distPointToSegment(c: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(c[0] - a[0], c[1] - a[1]);
  let t = ((c[0] - a[0]) * dx + (c[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(c[0] - (a[0] + t * dx), c[1] - (a[1] + t * dy));
}

/* ── Repeating red text field ────────────────────────────────────────────── */
const PHRASE = "ASSASSINS WEAKNESS IS LOVE";

// Each clipped half is inflated this many px beyond the viewport on every side.
// Larger than the "part" gap so the field still fully covers the screen while
// the halves are only cracked open; only the final snap exposes the demo.
const FIELD_MARGIN = 48;

function RedTextField() {
  // One solid-red wall of repeating type — large and wrapping, so words break at
  // their boundaries (no mid-letter clipping at the edges) and stack into a
  // dense poster. Over-provisioned so it fills past the viewport edges even when
  // the halves are inflated to hide the cut gap. Deterministic + identical width
  // per half, so the two clipped copies wrap the same and read as one field.
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-[#050505] flex flex-col justify-start select-none"
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="whitespace-nowrap"
          style={{
            fontFamily: '"astronef-std-super-normal", var(--font-clash), sans-serif',
            fontWeight: 400,
            fontSize: "clamp(4.5rem, 12vw, 12rem)",
            lineHeight: 0.84,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
            color: "#d40000",
            // Alternate rows shift left so the repeating words interlock; rows
            // overflow both edges so the field fills the screen with no gaps.
            transform: `translateX(${i % 2 === 0 ? "0" : "-4%"})`,
          }}
        >
          {`${PHRASE} `.repeat(10)}
        </div>
      ))}
    </div>
  );
}

interface HeartSliceHeroProps {
  /** Fired once the slash lands — orchestrator reveals Act 2 + unlocks scroll. */
  onSliced: () => void;
}

export default function HeartSliceHero({ onSliced }: HeartSliceHeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [slash, setSlash] = useState<{ a: Pt; b: Pt } | null>(null);
  const [cut, setCut] = useState<{
    clipA: string;
    clipB: string;
    n: Pt;
    nNeg: Pt;
    D: number;
    lineA: Pt;
    lineB: Pt;
  } | null>(null);
  // Slice choreography: none → part (separate a little) → full (snap open).
  const [phase, setPhase] = useState<"none" | "part" | "full">("none");
  const [sliced, setSliced] = useState(false);
  // Mirrors draggingRef for rendering: pauses the looping slice hint while the
  // user is actively holding/dragging.
  const [dragging, setDragging] = useState(false);
  // Heart canvas is unmounted after the reveal to free its WebGL context.
  const [heartMounted, setHeartMounted] = useState(true);
  // Drives the heart's fade + scale entrance.
  const [ready, setReady] = useState(false);
  const draggingRef = useRef(false);
  const startRef = useRef<Pt | null>(null);
  // Keep the latest onSliced without re-running the staged-reveal effect.
  const onSlicedRef = useRef(onSliced);
  onSlicedRef.current = onSliced;

  // Measure the stage so geometry is in real pixels.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Heart entrance: fade + scale up on first paint.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const localPoint = (clientX: number, clientY: number): Pt => {
    const r = stageRef.current!.getBoundingClientRect();
    return [clientX - r.left, clientY - r.top];
  };

  // Commit a cut given two endpoints — shared by a real drag and the skip
  // button (which throws a default diagonal slice so the reveal still plays).
  const commitCut = (a: Pt, b: Pt) => {
    if (!dims) return;
    const center: Pt = [dims.w / 2, dims.h / 2];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const n: Pt = [-Math.sin(ang), Math.cos(ang)];
    const nNeg: Pt = [-n[0], -n[1]];
    const D = Math.hypot(dims.w, dims.h);

    const M = FIELD_MARGIN;
    const boxW = dims.w + 2 * M;
    const boxH = dims.h + 2 * M;
    const boxCenter: Pt = [M + dims.w / 2, M + dims.h / 2];

    // Endpoints of the cut line (along the slash) for the flash glint.
    const dir: Pt = [Math.cos(ang), Math.sin(ang)];
    const FL = Math.hypot(dims.w, dims.h);

    setCut({
      clipA: toClip(halfPlanePolygon(boxW, boxH, boxCenter, n)),
      clipB: toClip(halfPlanePolygon(boxW, boxH, boxCenter, nNeg)),
      n,
      nNeg,
      D,
      lineA: [center[0] - dir[0] * FL, center[1] - dir[1] * FL],
      lineB: [center[0] + dir[0] * FL, center[1] + dir[1] * FL],
    });
    setSliced(true);
    setSlash(null);
  };

  const handleSkip = () => {
    if (sliced || !dims) return;
    draggingRef.current = false;
    setDragging(false);
    startRef.current = null;
    const cx = dims.w / 2;
    const cy = dims.h / 2;
    const L = Math.min(dims.w, dims.h) * 0.4;
    commitCut([cx - L, cy - L], [cx + L, cy + L]);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (sliced || !dims) return;
    draggingRef.current = true;
    setDragging(true);
    const p = localPoint(e.clientX, e.clientY);
    startRef.current = p;
    setSlash({ a: p, b: p });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !startRef.current) return;
    setSlash({ a: startRef.current, b: localPoint(e.clientX, e.clientY) });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current || !startRef.current || !dims) return;
    draggingRef.current = false;
    setDragging(false);
    const a = startRef.current;
    const b = localPoint(e.clientX, e.clientY);
    startRef.current = null;

    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const center: Pt = [dims.w / 2, dims.h / 2];
    const heartRadius = Math.min(dims.w, dims.h) * 0.28;
    const hitsHeart = distPointToSegment(center, a, b) < heartRadius + 30;

    // Too short or missed the heart → discard the slash, let them try again.
    if (len < 90 || !hitsHeart) {
      setSlash(null);
      return;
    }

    // Cut line runs through the heart center at the slash angle; commitCut
    // builds the clipped halves + flash and triggers the staged reveal effect.
    commitCut(a, b);
  };

  // Staged reveal once a valid cut lands:
  //  1. halves part a little along the slice normal,
  //  2. hold for ~0.5s,
  //  3. snap fully apart, revealing the gameplay demo beneath.
  useEffect(() => {
    if (!cut) return;
    const PART_MS = 420;
    const HOLD_MS = 500;
    // Next frame: animate from the seam (0) out to the small "part" offset.
    const raf = requestAnimationFrame(() => setPhase("part"));
    const tFull = window.setTimeout(() => setPhase("full"), PART_MS + HOLD_MS);
    // Unlock scroll + reveal Act 2 just as the halves snap fully open.
    const tReveal = window.setTimeout(
      () => onSlicedRef.current(),
      PART_MS + HOLD_MS + 160,
    );
    // Free the heart's WebGL context once it has faded out of the reveal.
    const tHeart = window.setTimeout(
      () => setHeartMounted(false),
      PART_MS + HOLD_MS + 900,
    );
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tFull);
      clearTimeout(tReveal);
      clearTimeout(tHeart);
    };
  }, [cut]);

  return (
    <div
      ref={stageRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        draggingRef.current = false;
        setDragging(false);
        startRef.current = null;
        setSlash(null);
      }}
      className="absolute inset-0 z-20"
      style={{
        cursor: sliced ? "default" : "crosshair",
        pointerEvents: sliced ? "none" : "auto",
        touchAction: "none",
      }}
    >
      {/* Background field — one piece before the cut, two clipped halves after.
          Both halves render the identical field so the pre-cut state reads as a
          single continuous poster. */}
      {!cut ? (
        <div className="absolute inset-0">
          <RedTextField />
        </div>
      ) : (
        (() => {
          // Offset each half travels along the slice normal, per phase:
          // a small gap first, then all the way off-stage.
          const PART_GAP = 26; // px the halves crack open before the pause
          const dist =
            phase === "full" ? cut.D : phase === "part" ? PART_GAP : 0;
          // Slow, soft crack open; then a fast snap fully apart.
          const transition =
            phase === "full"
              ? "transform 560ms cubic-bezier(0.55,0,0.85,0.25), opacity 560ms ease-in 140ms"
              : "transform 420ms cubic-bezier(0.22,1,0.36,1)";
          const opacity = phase === "full" ? 0 : 1;
          const M = FIELD_MARGIN;
          const halfStyle = (nv: Pt, clip: string): React.CSSProperties => ({
            position: "absolute",
            left: -M,
            top: -M,
            width: dims ? dims.w + 2 * M : `calc(100% + ${2 * M}px)`,
            height: dims ? dims.h + 2 * M : `calc(100% + ${2 * M}px)`,
            clipPath: clip,
            transform: `translate(${(nv[0] * dist).toFixed(1)}px, ${(nv[1] * dist).toFixed(1)}px)`,
            opacity,
            transition,
            willChange: "transform, opacity",
          });
          return (
            <>
              <div style={halfStyle(cut.n, cut.clipA)}>
                <RedTextField />
              </div>
              <div style={halfStyle(cut.nNeg, cut.clipB)}>
                <RedTextField />
              </div>
            </>
          );
        })()
      )}

      {/* Cut-flash glint — a one-shot blue streak along the slice line at the
          moment of the cut, echoing the game's VFX. */}
      {cut && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 22 }}
        >
          <line
            x1={cut.lineA[0]}
            y1={cut.lineA[1]}
            x2={cut.lineB[0]}
            y2={cut.lineB[1]}
            stroke="#dcebff"
            strokeWidth={3}
            strokeLinecap="round"
            style={{
              filter: "drop-shadow(0 0 10px rgba(90,169,255,0.95))",
              animation: "awl-cut-flash 700ms ease-out forwards",
            }}
          />
        </svg>
      )}

      {/* Heart — 3D, glossy, lit. Stays fully intact through the slice and the
          half-second hold, then fades only as the halves snap fully open so the
          gameplay demo reads clean. Non-interactive: the slash drag is handled
          by the stage above, and pointer events pass straight through. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: phase === "full" ? 0 : ready ? 1 : 0,
          transform: ready ? "scale(1)" : "scale(0.9)",
          transition:
            "opacity 700ms ease-out, transform 900ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {heartMounted && (isPerfLite() ? <StaticHeart /> : <HeartCanvas />)}
      </div>

      {/* Live slash feedback */}
      {slash && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <filter id="awl-slash-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <line
            x1={slash.a[0]}
            y1={slash.a[1]}
            x2={slash.b[0]}
            y2={slash.b[1]}
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinecap="round"
            filter="url(#awl-slash-glow)"
          />
          <circle cx={slash.b[0]} cy={slash.b[1]} r={5} fill="#fff" filter="url(#awl-slash-glow)" />
        </svg>
      )}

      {/* CTA — a looping demo of the gesture: a glowing slash draws itself
          across the heart with a fingertip dot tracing the path, then a clear
          label. Both vanish the moment the real cut lands. */}
      {!sliced && (
        <>
          {/* Looping demo swipe — paused while the user is actively holding. */}
          {!dragging && (
          <svg
            aria-hidden="true"
            width="300"
            height="300"
            viewBox="-150 -150 300 300"
            className="absolute pointer-events-none"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              overflow: "visible",
            }}
          >
            <line
              x1="-90"
              y1="-90"
              x2="90"
              y2="90"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 255,
                filter: "drop-shadow(0 0 7px rgba(255,255,255,0.85))",
                animation: "awl-swipe-draw 2.8s ease-in-out infinite",
              }}
            />
            <circle
              r="8"
              fill="#ffffff"
              style={{
                filter: "drop-shadow(0 0 11px rgba(90,169,255,0.98))",
                animation: "awl-swipe-dot 2.8s ease-in-out infinite",
              }}
            />
          </svg>
          )}

          <div className="absolute inset-x-0 bottom-14 flex justify-center pointer-events-none">
            <div
              className="flex flex-col items-center gap-1.5 px-6 py-3 rounded-md"
              style={{
                background: "rgba(0,0,0,0.5)",
                border: "1px solid rgba(255,255,255,0.16)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              <span
                className="uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  letterSpacing: "0.3em",
                  color: "#ffffff",
                }}
              >
                drag across the heart
              </span>
              <span
                className="uppercase"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.64rem",
                  letterSpacing: "0.26em",
                  color: "#3b82f6",
                }}
              >
                slice it to continue
              </span>
            </div>
          </div>

          {/* Skip — for anyone who'd rather not play. Throws a default slice so
              the signature reveal still plays. stopPropagation keeps the click
              from starting a drag on the stage. */}
          <button
            onClick={handleSkip}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute bottom-8 right-8 z-40 uppercase cursor-pointer group flex items-center gap-2 px-4 py-2 rounded-md hover:border-white/40"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.8rem",
              letterSpacing: "0.24em",
              color: "#ffffff",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.22)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              opacity: ready ? 1 : 0,
              transition: "opacity 600ms ease-out 700ms, border-color 200ms ease-out",
            }}
          >
            <span>skip</span>
            <span
              aria-hidden="true"
              className="inline-block group-hover:translate-x-1"
              style={{ color: "#3b82f6", transition: "transform 200ms ease-out" }}
            >
              →
            </span>
          </button>
        </>
      )}
    </div>
  );
}
