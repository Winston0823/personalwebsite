"use client";

import { useEffect, useRef } from "react";

/* Scroll-glide descent — a quiet full-bleed beat that echoes the core mechanic.
   As you scroll, parallax ridge layers drift down past you (atmospheric
   perspective: far ridges are hazier), fog bands slide, and a small glider
   silhouette banks down into the vista. Driven by a single `--p` CSS var set on
   scroll (no per-frame React), like the CRT hero. */
export default function GlideDescent() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const scroller = section?.closest(".detail-scroll") as HTMLElement | null;
    if (!section || !scroller) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const sRect = scroller.getBoundingClientRect();
      const r = section.getBoundingClientRect();
      const top = r.top - sRect.top + scroller.scrollTop;
      const span = section.offsetHeight - scroller.clientHeight;
      const p = span > 0 ? Math.max(0, Math.min(1, (scroller.scrollTop - top) / span)) : 0;
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
  }, []);

  // Ridge silhouettes (far → near). Each parallaxes down at its own rate.
  const ridges = [
    { d: "M0,150 L160,90 L320,130 L520,70 L760,120 L1000,80 L1200,130 L1440,95 L1440,300 L0,300 Z", fill: "#2b3b52", rate: 22, y: "62%" },
    { d: "M0,170 L220,110 L430,160 L640,100 L900,150 L1150,105 L1440,150 L1440,300 L0,300 Z", fill: "#243245", rate: 40, y: "70%" },
    { d: "M0,190 L180,140 L360,185 L600,120 L860,180 L1120,130 L1340,180 L1440,150 L1440,300 L0,300 Z", fill: "#18222f", rate: 64, y: "78%" },
    { d: "M0,210 L260,150 L520,205 L820,140 L1120,200 L1440,160 L1440,300 L0,300 Z", fill: "#0d141d", rate: 92, y: "86%" },
  ];

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      className="relative w-full"
      style={{ height: "220vh", ["--p" as string]: 0 } as React.CSSProperties}
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {/* Sky — deep indigo aloft warming toward a low horizon */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #070a12 0%, #14202f 46%, #355063 74%, #b98a55 96%)",
          }}
        />
        {/* Sun glow on the horizon, swells as you descend toward it */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            bottom: "6%",
            height: "60%",
            background:
              "radial-gradient(60% 80% at 50% 100%, rgba(245,200,140,0.55), rgba(245,200,140,0) 70%)",
            opacity: "calc(0.35 + var(--p) * 0.5)" as unknown as number,
          }}
        />

        {/* Fog bands drifting across, thickening with depth */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            bottom: "30%",
            height: "20vh",
            background: "linear-gradient(180deg, rgba(180,200,220,0), rgba(180,200,220,0.18), rgba(180,200,220,0))",
            filter: "blur(8px)",
            transform: "translateX(calc(var(--p) * -60px))",
            opacity: "calc(0.4 + var(--p) * 0.4)" as unknown as number,
          }}
        />

        {/* Ridge layers — parallax down past the viewer */}
        {ridges.map((rg, i) => (
          <svg
            key={i}
            className="absolute inset-x-0 w-full pointer-events-none"
            viewBox="0 0 1440 300"
            preserveAspectRatio="none"
            style={{
              bottom: 0,
              height: rg.y,
              transform: `translateY(calc(var(--p) * ${rg.rate}px))`,
              willChange: "transform",
            }}
          >
            <path d={rg.d} fill={rg.fill} />
          </svg>
        ))}

        {/* Atmospheric haze over the far ridges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(53,80,99,0) 50%, rgba(53,80,99,0.25) 78%, rgba(185,138,85,0.18) 100%)",
          }}
        />

        {/* Glider — banks down + drifts + shrinks as it descends into the vista */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "26%",
            transform:
              "translate(calc(-50% + var(--p) * 16vw), calc(var(--p) * 34vh)) rotate(calc(8deg + var(--p) * 10deg)) scale(calc(1 - var(--p) * 0.45))",
            opacity: "calc(0.9 - var(--p) * 0.25)" as unknown as number,
            willChange: "transform",
          }}
        >
          {/* Cheap glow — a radial gradient that rides the same transform, so no
              per-frame filter re-raster (drop-shadow under rotate/scale was the lag). */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 240,
              height: 150,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(50% 50% at 50% 48%, rgba(232,58,138,0.38), rgba(232,58,138,0) 70%)",
              pointerEvents: "none",
            }}
          />
          <svg
            width="170"
            height="106"
            viewBox="0 0 240 150"
            fill="none"
            className="relative"
          >
            {/* contrail trailing from the tail */}
            <line x1="74" y1="96" x2="-44" y2="34" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
            {/* keel — the underside fold (darkest) */}
            <path d="M230 68 L74 96 L120 118 Z" fill="#9aa3b0" />
            {/* near wing (mid tone) */}
            <path d="M230 68 L74 96 L52 140 Z" fill="#cdd4de" />
            {/* far / top wing (brightest) */}
            <path d="M230 68 L16 26 L74 96 Z" fill="#f4f5f7" />
            {/* center crease */}
            <path d="M230 68 L74 96" stroke="#8b94a1" strokeWidth="1.4" />
            {/* crisp outer fold edges */}
            <path d="M230 68 L16 26 L74 96 L52 140 Z" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Quiet kicker, fades in early then out */}
        <div
          className="absolute inset-x-0 flex justify-center pointer-events-none"
          style={{
            top: "16%",
            opacity: "clamp(0, calc((var(--p)) * 3 * (1 - var(--p) * 1.6)), 1)" as unknown as number,
          }}
        >
          <span
            className="uppercase"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.4em",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            you glide
          </span>
        </div>
      </div>
    </section>
  );
}
