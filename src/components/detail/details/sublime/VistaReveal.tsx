"use client";

import { useEffect, useRef } from "react";

/* Full-screen "awe moment" — the image pins to fill the viewport and is
   revealed as you scroll through this taller section, panning slower than the
   scroll (true parallax). Driven by a single `--p` (pinned-progress) CSS var. */
export default function VistaReveal({
  src,
  caption,
}: {
  src: string;
  caption?: string;
}) {
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

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100vw",
        left: "calc(-50vw + 50%)",
        height: "170vh", // extra height = how long it stays pinned / parallaxes
        ["--p" as string]: 0,
      } as React.CSSProperties}
    >
      {/* Pinned, full-viewport stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Oversized image pans slower than scroll (parallax) */}
        <div
          className="absolute"
          style={{
            inset: "-16% 0",
            transform: "translateY(calc(7% - var(--p) * 16%))",
            willChange: "transform",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>

        {/* Cinematic top/bottom falloff for legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,11,13,0.5) 0%, rgba(10,11,13,0) 20%, rgba(10,11,13,0) 60%, rgba(10,11,13,0.92) 100%)",
          }}
        />

        {caption && (
          <div
            className="absolute"
            style={{ left: "max(1.5rem, calc((100vw - 1040px) / 2))", bottom: "2.6rem" }}
          >
            <span
              className="uppercase"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.74rem",
                letterSpacing: "0.24em",
                color: "rgba(255,255,255,0.85)",
                textShadow: "0 2px 16px rgba(0,0,0,0.7)",
              }}
            >
              {caption}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
