"use client";

import { useEffect, useId, useRef } from "react";

/** Five held drawings for hero, nav, and drawers; project crops keep one drawing. */
export default function SquiggleOutline({
  variant = "pill",
  imageSrc,
}: {
  variant?: "pill" | "sticker" | "project" | "drawer";
  imageSrc?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGPathElement>(null);
  const clipId = `project-boil-${useId().replace(/:/g, "")}`;
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      visible = false;
    let timer: number | null = null;
    const paint = (time: number) => {
      if (!width || !height) return;
      const inset = 7;
      const w = width - inset * 2,
        h = height - inset * 2;
      const radius =
        variant === "pill"
          ? h / 2
          : variant === "drawer"
            ? Math.min(24, w * 0.25, h * 0.25)
            : variant === "project"
              ? Math.min(46, Math.min(w, h) * 0.11)
              : Math.min(w, h) * 0.44;
      const straightX = w - radius * 2,
        straightY = h - radius * 2;
      const arc = (Math.PI * radius) / 2;
      const lengths = [
        straightX,
        arc,
        straightY,
        arc,
        straightX,
        arc,
        straightY,
        arc,
      ];
      const perimeter = lengths.reduce((a, b) => a + b, 0);
      const cycles = Math.max(5, Math.round(perimeter / 70));
      // Hold distinct drawings instead of sliding a wave around the edge.
      const drawing =
        variant === "project" || reduced.matches
          ? 0
          : Math.floor(time / 330) % 5;
      const phase = [0.3, 2.1, 4.4, 1.2, 3.5][drawing];
      const points = Array.from({ length: 180 }, (_, index) => {
        const distance = (index / 180) * perimeter;
        let remaining = distance,
          segment = 0;
        while (segment < 7 && remaining > lengths[segment])
          remaining -= lengths[segment++];
        let x = 0,
          y = 0,
          nx = 0,
          ny = 0;
        const u = lengths[segment] ? remaining / lengths[segment] : 0;
        if (segment === 0) {
          x = radius + u * straightX;
          y = 0;
          ny = -1;
        } else if (segment === 2) {
          x = w;
          y = radius + u * straightY;
          nx = 1;
        } else if (segment === 4) {
          x = w - radius - u * straightX;
          y = h;
          ny = 1;
        } else if (segment === 6) {
          x = 0;
          y = h - radius - u * straightY;
          nx = -1;
        } else {
          const angle =
            (((segment - 1) / 2 - 1) * Math.PI) / 2 + (u * Math.PI) / 2;
          const cx = segment === 1 || segment === 3 ? w - radius : radius;
          const cy = segment === 1 || segment === 7 ? radius : h - radius;
          nx = Math.cos(angle);
          ny = Math.sin(angle);
          x = cx + radius * nx;
          y = cy + radius * ny;
        }
        const position = (distance / perimeter) * Math.PI * 2;
        const wave =
          Math.sin(position * cycles) * 1.1 +
          Math.sin(position * (cycles + 3) + phase) * 0.7 +
          Math.cos(position * (cycles + 7) - phase * 1.3) * 0.35;
        return `${(x + inset + nx * wave).toFixed(2)},${(y + inset + ny * wave).toFixed(2)}`;
      });
      const contour = `M${points.join(" L")} Z`;
      pathRef.current?.setAttribute("d", contour);
      clipRef.current?.setAttribute("d", contour);
    };
    const resize = new ResizeObserver((entries) => {
      width = entries[0].contentRect.width;
      height = entries[0].contentRect.height;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      paint(performance.now());
    });
    resize.observe(svg);
    if (variant === "project") return () => resize.disconnect();
    const syncAnimation = () => {
      if (visible && !document.hidden && !reduced.matches) {
        if (timer === null)
          timer = window.setInterval(() => paint(performance.now()), 330);
      } else if (timer !== null) {
        window.clearInterval(timer);
        timer = null;
      }
    };
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      syncAnimation();
    });
    intersection.observe(svg);
    const onPreference = () => {
      paint(performance.now());
      syncAnimation();
    };
    document.addEventListener("visibilitychange", syncAnimation);
    reduced.addEventListener("change", onPreference);
    return () => {
      if (timer !== null) window.clearInterval(timer);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", syncAnimation);
      reduced.removeEventListener("change", onPreference);
    };
  }, [variant]);
  const outline = (
    <svg
      ref={svgRef}
      className={`squiggle-outline squiggle-${variant}`}
      aria-hidden="true"
      focusable="false"
    >
      {variant === "project" && (
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path ref={clipRef} />
          </clipPath>
        </defs>
      )}
      <path
        ref={pathRef}
        className="contour-surface"
        fill={
          variant === "project"
            ? "none"
            : variant === "sticker"
              ? "#f6f6f1"
              : "#ffffff"
        }
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
    </svg>
  );
  if (variant !== "project") return outline;
  return (
    <>
      <div
        className="project-image-crop"
        style={{ clipPath: `url(#${clipId})` }}
      >
        <img src={imageSrc} alt="" loading="lazy" decoding="async" />
      </div>
      {outline}
    </>
  );
}
