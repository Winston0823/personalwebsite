"use client";

import { useEffect, useRef } from "react";

/** A five-drawing line boil, held at roughly three frames per second. */
export default function SquiggleOutline({
  variant = "pill",
}: {
  variant?: "pill" | "sticker";
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0,
      height = 0,
      frame = 0,
      lastPaint = 0,
      visible = true;
    const paint = (time: number) => {
      if (!width || !height) return;
      const inset = 7;
      const w = width - inset * 2,
        h = height - inset * 2;
      const radius = variant === "pill" ? h / 2 : Math.min(w, h) * 0.44;
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
      const drawing = reduced.matches ? 0 : Math.floor(time / 330) % 5;
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
    };
    const resize = new ResizeObserver((entries) => {
      width = entries[0].contentRect.width;
      height = entries[0].contentRect.height;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      paint(performance.now());
    });
    resize.observe(svg);
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    });
    intersection.observe(svg);
    const tick = (time: number) => {
      if (
        visible &&
        !document.hidden &&
        !reduced.matches &&
        time - lastPaint > 315
      ) {
        paint(time);
        lastPaint = time;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onPreference = () => paint(performance.now());
    reduced.addEventListener("change", onPreference);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      reduced.removeEventListener("change", onPreference);
    };
  }, [variant]);
  return (
    <svg
      ref={svgRef}
      className={`squiggle-outline squiggle-${variant}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        ref={pathRef}
        className="contour-surface"
        fill={variant === "sticker" ? "#f6f6f1" : "#ffffff"}
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
