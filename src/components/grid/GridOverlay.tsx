"use client";

import { GRID_COLS, GRID_ROWS } from "@/lib/grid-types";

interface GridOverlayProps {
  visible: boolean;
}

export default function GridOverlay({ visible }: GridOverlayProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
        gap: "var(--grid-gap)",
      }}
    >
      {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
        <div key={i} className="grid-line" />
      ))}
    </div>
  );
}
