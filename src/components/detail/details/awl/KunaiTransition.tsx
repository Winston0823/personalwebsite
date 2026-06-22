"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import InView from "../../shared/InView";
import { usePrefersStatic } from "@/hooks/usePrefersStatic";

// R3F kept out of SSR + the main bundle.
const KunaiCanvas = dynamic(() => import("./KunaiCanvas"), { ssr: false });

/* A compact, half-height full-bleed band between two case-study sections. It is
   NOT pinned — it scrolls with the page, so the kunai "follows the section" as
   the user scrolls. Progress is the band's pass through the viewport (enters at
   the bottom = 0, exits the top = 1), which throws the kunai right → left while
   it spins on its long axis. */
export default function KunaiTransition() {
  const bandRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const staticMode = usePrefersStatic();

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    const scroller = band.closest(".detail-scroll") as HTMLElement | null;
    if (!scroller) return;

    let raf: number | null = null;
    const update = () => {
      raf = null;
      const sr = scroller.getBoundingClientRect();
      const r = band.getBoundingClientRect();
      const vh = scroller.clientHeight;
      const relTop = r.top - sr.top; // band top relative to the scroll viewport
      const total = r.height + vh; // travel from fully-below to fully-above
      const p = total > 0 ? (vh - relTop) / total : 0;
      progressRef.current = Math.max(0, Math.min(1, p));
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

  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="pointer-events-none"
      style={{
        position: "relative",
        width: "100vw",
        left: "calc(-50vw + 50%)", // break out of the reading column, full-bleed
        height: "55vh", // half-section height, not a full takeover
        marginTop: "5vh", // small gap after Process; Build sits close below
      }}
    >
      {/* Purely decorative (aria-hidden) — dropped entirely on lite. */}
      {!staticMode && (
        <InView className="pointer-events-none" style={{ width: "100%", height: "100%" }}>
          <KunaiCanvas progressRef={progressRef} />
        </InView>
      )}
    </div>
  );
}
