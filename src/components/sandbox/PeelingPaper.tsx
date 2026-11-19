"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { paperFold } from "@/lib/sticky-paper";

export default function PeelingPaper({
  dx,
  dy,
  grip,
  active,
}: {
  dx: number;
  dy: number;
  grip: number;
  active: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const current = useRef({ x: 0, y: 0, grip: 0.5 });
  const [recovery, setRecovery] = useState(current.current);
  useLayoutEffect(() => {
    if (active) {
      current.current = { x: dx, y: dy, grip };
      return;
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      current.current = { x: 0, y: 0, grip };
      setRecovery(current.current);
      return;
    }
    setRecovery(current.current);
    let frame = 0,
      previous = performance.now();
    const tick = (now: number) => {
      const decay = Math.exp(-18 * Math.min((now - previous) / 1000, 0.05));
      previous = now;
      current.current = {
        ...current.current,
        x: current.current.x * decay,
        y: current.current.y * decay,
      };
      if (Math.hypot(current.current.x, current.current.y) < 0.1)
        current.current = { ...current.current, x: 0, y: 0 };
      setRecovery(current.current);
      if (current.current.x || current.current.y)
        frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, dx, dy, grip]);
  const shape = active ? { x: dx, y: dy, grip } : recovery;
  const fold = paperFold(shape.x, shape.y, shape.grip);
  const points = (vertices: { x: number; y: number }[]) =>
    vertices.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg className="peeling-paper" viewBox="0 0 106 106" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-front`} x2="0" y2="1">
          <stop stopColor="#efe5a0" />
          <stop offset=".25" stopColor="#fff4b6" />
        </linearGradient>
        <linearGradient
          id={`${id}-back`}
          x1={shape.grip < 0.5 ? "0" : "1"}
          y1="1"
          x2={shape.grip < 0.5 ? "1" : "0"}
          y2="0"
        >
          <stop stopColor="#d8c978" />
          <stop offset=".35" stopColor="#f6e9a4" />
          <stop offset="1" stopColor="#fff8ca" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <polygon points={points(fold.flat)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="106" height="106" fill={`url(#${id}-front)`} />
        <text x="13" y="33" className="paper-lettering">
          <tspan x="13">Leave a</tspan>
          <tspan x="13" dy="17">
            thought.
          </tspan>
        </text>
        <path
          d="M53 91V77m-5 5 5-5 5 5"
          fill="none"
          stroke="#a4995e"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {fold.folded.length > 0 && (
        <polygon
          className="paper-fold"
          points={points(fold.folded)}
          fill={`url(#${id}-back)`}
          style={{
            filter: `drop-shadow(${dx * 0.025}px ${2 + fold.strength * 4}px ${1 + fold.strength * 3}px #75652c35)`,
          }}
        />
      )}
    </svg>
  );
}
