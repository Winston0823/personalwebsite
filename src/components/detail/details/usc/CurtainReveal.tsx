"use client";

import { useEffect, useRef, useState } from "react";
import { isPerfLite } from "@/lib/perf-tier";

/* Act 1 — the interactive gate. Two cardinal-velvet curtain panels hang shut
   over a black stage; the gold wordmark glows through the seam. The visitor
   grabs each panel and drags it toward its outer edge — the panel compresses
   from that edge (scaleX with an outer transform-origin), so the CSS fold
   ribbing bunches tighter exactly like gathered fabric. When BOTH panels pass
   the open threshold they snap fully aside, the hero is revealed behind, and
   `onOpened` fires so the orchestrator can unlock scroll.

   Accessibility: prefers-reduced-motion (or the Skip control) opens instantly
   without requiring the drag. */

const OPEN_THRESHOLD = 0.5; // fraction a panel must be pulled to latch open

export default function CurtainReveal({
  revealSrc,
  onOpened,
}: {
  revealSrc: string;
  onOpened: () => void;
}) {
  const [openL, setOpenL] = useState(0);
  const [openR, setOpenR] = useState(0);
  const [opened, setOpened] = useState(false);
  const firedRef = useRef(false);

  const drag = useRef<{ side: "L" | "R"; startX: number; startOpen: number } | null>(null);
  const widthRef = useRef(1);
  const stageRef = useRef<HTMLDivElement>(null);

  // Open instantly for reduced-motion users — never gate content behind motion.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || isPerfLite()) {
      openAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fireIfOpen(l: number, r: number) {
    if (!firedRef.current && l >= 0.999 && r >= 0.999) {
      firedRef.current = true;
      setOpened(true);
      onOpened();
    }
  }

  function openAll() {
    setOpenL(1);
    setOpenR(1);
    fireIfOpen(1, 1);
  }

  function onPointerDown(side: "L" | "R", e: React.PointerEvent) {
    if (opened) return;
    widthRef.current = stageRef.current?.offsetWidth ?? window.innerWidth;
    drag.current = { side, startX: e.clientX, startOpen: side === "L" ? openL : openR };
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* synthetic/edge-case pointers may lack an active id — capture is a nicety */
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const half = widthRef.current / 2;
    // Pulling a panel toward its own outer edge increases its open fraction.
    const dx = e.clientX - d.startX;
    const delta = d.side === "L" ? -dx / half : dx / half;
    const next = Math.max(0, Math.min(1, d.startOpen + delta));
    if (d.side === "L") setOpenL(next);
    else setOpenR(next);
  }

  function onPointerUp() {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    // Latch open past the threshold, otherwise spring back closed.
    if (d.side === "L") {
      const target = openL >= OPEN_THRESHOLD ? 1 : 0;
      setOpenL(target);
      fireIfOpen(target, openR >= OPEN_THRESHOLD ? 1 : openR);
    } else {
      const target = openR >= OPEN_THRESHOLD ? 1 : 0;
      setOpenR(target);
      fireIfOpen(openL >= OPEN_THRESHOLD ? 1 : openL, target);
    }
  }

  const panel = (side: "L" | "R") => {
    const p = side === "L" ? openL : openR;
    const origin = side === "L" ? "left center" : "right center";
    return (
      <div
        onPointerDown={(e) => onPointerDown(side, e)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="usc-velvet absolute top-0 h-full select-none touch-none"
        style={{
          [side === "L" ? "left" : "right"]: 0,
          width: "52%",
          transform: `scaleX(${1 - p * 0.94})`,
          transformOrigin: origin,
          transition: drag.current ? "none" : "transform 620ms cubic-bezier(0.22,1,0.36,1)",
          cursor: opened ? "default" : "grab",
          pointerEvents: opened ? "none" : "auto",
          zIndex: 20,
          boxShadow:
            side === "L"
              ? "inset -28px 0 50px rgba(0,0,0,0.6)"
              : "inset 28px 0 50px rgba(0,0,0,0.6)",
        }}
      >
        {/* Gold valance + tasseled grip handle near the inner edge */}
        <div className="usc-valance absolute top-0 left-0 right-0" style={{ height: 26 }} />
        {!opened && (
          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            style={{ [side === "L" ? "right" : "left"]: 18 } as React.CSSProperties}
          >
            <span
              className="block rounded-full"
              style={{ width: 10, height: 70, background: "linear-gradient(180deg,#f2cf6a,#b8881f)", boxShadow: "0 0 10px rgba(227,181,61,0.5)" }}
            />
            <span style={{ fontSize: 18, lineHeight: 1 }}>🟡</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={stageRef} className="absolute inset-0 overflow-hidden bg-[#050505]">
      {/* Revealed stage — the live hero behind the curtains */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={revealSrc}
        alt="USC Formula Electric — site hero"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0, transform: opened ? "scale(1)" : "scale(1.06)", transition: "transform 900ms ease-out" }}
        draggable={false}
      />
      {/* Gold ambient glow over the reveal */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 1,
          left: "50%",
          top: "60%",
          transform: "translate(-50%,-50%)",
          width: "70vw",
          height: "26vh",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(227,181,61,0.16) 0%, rgba(139,0,0,0.10) 42%, transparent 72%)",
          filter: "blur(36px)",
        }}
      />

      {/* Glowing gold seam where the panels meet (fades as they open) */}
      <div
        className="usc-seam-pulse absolute top-0 bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          zIndex: 21,
          width: 3,
          background: "linear-gradient(180deg, transparent, #f2cf6a 18%, #fff 50%, #f2cf6a 82%, transparent)",
          boxShadow: "0 0 24px 6px rgba(227,181,61,0.55)",
          opacity: opened ? 0 : Math.max(0, 1 - Math.max(openL, openR) * 1.4),
          animation: "usc-seam-glow 2.6s ease-in-out infinite",
          transition: "opacity 400ms ease-out",
        }}
      />

      {panel("L")}
      {panel("R")}

      {/* Hint + skip — only while closed */}
      {!opened && (
        <>
          <div
            className="absolute inset-x-0 flex flex-col items-center pointer-events-none"
            style={{ bottom: "9%", zIndex: 30 }}
          >
            <span
              className="uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.32em",
                color: "rgba(255,255,255,0.7)",
                textShadow: "0 1px 6px rgba(0,0,0,0.8)",
              }}
            >
              ⟵ drag the curtains apart ⟶
            </span>
          </div>
          <button
            onClick={openAll}
            className="absolute uppercase cursor-pointer hover:text-white transition-colors"
            style={{
              bottom: 22,
              right: 22,
              zIndex: 30,
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            skip ↦
          </button>
        </>
      )}
    </div>
  );
}
