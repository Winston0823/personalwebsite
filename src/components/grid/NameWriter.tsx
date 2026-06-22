"use client";

import { useEffect, useState } from "react";

/* Looping "written-out" name for the mobile hero. Alternates between the English
   and Chinese name, each drawn on via an SVG stroke-outline animation (the glyph
   outlines trace in, then the fill fades to solid), then swaps. Remounting the
   <text> on each switch (via `key`) replays the CSS draw. */

// TODO: replace the Chinese placeholder with Winston's actual characters.
const NAMES = [
  { text: "Winston Gu", size: 104, stroke: 1.1 },
  { text: "顾温斯顿", size: 138, stroke: 1.5 },
];

export default function NameWriter() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setI((p) => (p + 1) % NAMES.length), 4400);
    return () => window.clearInterval(id);
  }, []);

  const n = NAMES[i];

  return (
    <div className="w-full" style={{ maxWidth: 540 }}>
      <svg viewBox="0 0 640 180" width="100%" height="auto" aria-label={NAMES[0].text}>
        <text
          key={i}
          x="320"
          y="92"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: n.size,
            fontWeight: 800,
            letterSpacing: "-0.01em",
            fill: "var(--color-text-primary)",
            fillOpacity: 0,
            stroke: "var(--color-text-primary)",
            strokeWidth: n.stroke,
            strokeDasharray: 3000,
            strokeDashoffset: 3000,
            animation:
              "name-draw 2200ms cubic-bezier(0.4,0,0.2,1) forwards, name-fill 700ms ease 1500ms forwards",
          }}
        >
          {n.text}
        </text>
      </svg>
    </div>
  );
}
