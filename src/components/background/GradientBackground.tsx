"use client";

import { useEffect, useRef } from "react";

interface BlobConfig {
  className: string;
  style: React.CSSProperties;
  parallaxMultiplier: number;
  /** Phase offset (radians) and per-blob radius for autonomous drift. The
   *  blob's resting position slowly orbits this radius so the background
   *  feels alive even when the cursor is idle. */
  driftPhaseX: number;
  driftPhaseY: number;
  driftRadiusX: number;
  driftRadiusY: number;
  comment: string;
}

const blobs: BlobConfig[] = [
  {
    comment: "Blue wash — upper left",
    className: "absolute rounded-full",
    style: {
      width: "65vw",
      height: "65vw",
      top: "-15%",
      left: "-10%",
      background:
        "radial-gradient(circle, rgba(0,122,255,0.18) 0%, rgba(0,122,255,0) 70%)",
      filter: "blur(40px)",
      opacity: 1,
    },
    parallaxMultiplier: 0.02,
    driftPhaseX: 0,
    driftPhaseY: 1.2,
    driftRadiusX: 36,
    driftRadiusY: 28,
  },
  {
    comment: "Lavender wash — upper right",
    className: "absolute rounded-full",
    style: {
      width: "55vw",
      height: "55vw",
      top: "-5%",
      right: "-10%",
      background:
        "radial-gradient(circle, rgba(160,120,220,0.14) 0%, rgba(160,120,220,0) 70%)",
      filter: "blur(45px)",
      opacity: 1,
    },
    parallaxMultiplier: -0.015,
    driftPhaseX: 2.1,
    driftPhaseY: 3.4,
    driftRadiusX: 32,
    driftRadiusY: 30,
  },
  {
    comment: "Peach wash — center right",
    className: "absolute rounded-full",
    style: {
      width: "50vw",
      height: "50vw",
      top: "35%",
      right: "0%",
      background:
        "radial-gradient(circle, rgba(255,160,120,0.12) 0%, rgba(255,160,120,0) 70%)",
      filter: "blur(45px)",
      opacity: 1,
    },
    parallaxMultiplier: 0.025,
    driftPhaseX: 4.5,
    driftPhaseY: 0.7,
    driftRadiusX: 40,
    driftRadiusY: 26,
  },
  {
    comment: "Sky wash — lower left",
    className: "absolute rounded-full",
    style: {
      width: "60vw",
      height: "60vw",
      bottom: "-15%",
      left: "-5%",
      background:
        "radial-gradient(circle, rgba(90,180,250,0.15) 0%, rgba(90,180,250,0) 70%)",
      filter: "blur(40px)",
      opacity: 1,
    },
    parallaxMultiplier: -0.02,
    driftPhaseX: 1.8,
    driftPhaseY: 5.2,
    driftRadiusX: 34,
    driftRadiusY: 32,
  },
  {
    comment: "Mint wash — bottom center",
    className: "absolute rounded-full",
    style: {
      width: "50vw",
      height: "50vw",
      bottom: "0%",
      left: "30%",
      background:
        "radial-gradient(circle, rgba(120,220,200,0.12) 0%, rgba(120,220,200,0) 70%)",
      filter: "blur(42px)",
      opacity: 1,
    },
    parallaxMultiplier: 0.018,
    driftPhaseX: 3.3,
    driftPhaseY: 2.6,
    driftRadiusX: 38,
    driftRadiusY: 24,
  },
];

/** Angular speed of the autonomous drift (radians/ms). Tuned so each blob
 *  completes one full orbit roughly every 35–45 seconds. */
const DRIFT_SPEED_X = 0.00016;
const DRIFT_SPEED_Y = 0.00013;

export default function GradientBackground() {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef(blobs.map(() => ({ x: 0, y: 0 })));
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Autonomous drift runs continuously now so the background feels alive
    // even when the cursor is still. Mouse parallax is layered on top of
    // the drift baseline. Respect prefers-reduced-motion: skip the drift
    // entirely and only respond to direct cursor input.
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lerp = 0.08;
    // The drift is a ~40s orbit, so updating at 30fps is visually identical to
    // 60 while halving the per-frame trig + style writes. Compositing the move
    // is cheap because each blurred blob is promoted to its own GPU layer
    // (will-change: transform) and only its transform changes — the expensive
    // blur bitmap stays cached rather than re-rasterizing every frame.
    const FRAME_MS = 1000 / 30;
    let lastTick = 0;

    // Promote each blob to its own compositor layer once.
    blobRefs.current.forEach((el) => {
      if (el) el.style.willChange = "transform";
    });

    const tick = (now: number) => {
      rafId.current = requestAnimationFrame(tick);
      if (now - lastTick < FRAME_MS) return;
      lastTick = now;

      blobs.forEach((blob, i) => {
        const el = blobRefs.current[i];
        if (!el) return;

        // Autonomous orbit: Lissajous-style drift around the resting point.
        const driftX = reduceMotion
          ? 0
          : Math.sin(now * DRIFT_SPEED_X + blob.driftPhaseX) * blob.driftRadiusX;
        const driftY = reduceMotion
          ? 0
          : Math.cos(now * DRIFT_SPEED_Y + blob.driftPhaseY) * blob.driftRadiusY;

        const targetX =
          mousePos.current.x * blob.parallaxMultiplier * window.innerWidth +
          driftX;
        const targetY =
          mousePos.current.y * blob.parallaxMultiplier * window.innerHeight +
          driftY;

        currentPos.current[i].x += (targetX - currentPos.current[i].x) * lerp;
        currentPos.current[i].y += (targetY - currentPos.current[i].y) * lerp;
        el.style.transform = `translate3d(${currentPos.current[i].x}px, ${currentPos.current[i].y}px, 0)`;
      });
    };

    rafId.current = requestAnimationFrame(tick);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    // Don't burn cycles animating a tab nobody's looking at.
    const handleVisibility = () => {
      cancelAnimationFrame(rafId.current);
      if (!document.hidden) {
        lastTick = 0;
        rafId.current = requestAnimationFrame(tick);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {blobs.map((blob, i) => (
        <div
          key={i}
          ref={(el) => { blobRefs.current[i] = el; }}
          className={blob.className}
          style={blob.style}
        />
      ))}
    </div>
  );
}
