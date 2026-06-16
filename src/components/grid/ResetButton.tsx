"use client";

import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { emitGridRipple, RIPPLE } from "@/lib/grid-ripple";

interface ResetButtonProps {
  onReset: () => void;
}

/**
 * Reset control — occupies the top-right corner cell freed when the nowPlaying
 * widget shifted one column left. Restores the default widget layout and sends
 * a ripple from the click point so the grid acknowledges the action. The custom
 * cursor names the affordance ("Reset widgets") via `data-cursor="reset"`.
 */
export default function ResetButton({ onReset }: ResetButtonProps) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    emitGridRipple(rect.left + rect.width / 2, rect.top + rect.height / 2, RIPPLE.open);
    onReset();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      data-cursor="reset"
      aria-label="Reset widgets to default layout"
      className="reset-button"
      style={{
        gridColumn: "16 / span 1",
        gridRow: "1 / span 1",
        zIndex: 1,
      }}
    >
      {/* Glyph fills ~60% of the (square) cell — the button itself spans the
          full cell, so a 60% icon reads as a 60%-diameter control. */}
      <ArrowCounterClockwise size="60%" weight="bold" aria-hidden="true" />
    </button>
  );
}
