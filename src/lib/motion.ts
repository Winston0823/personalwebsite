/**
 * Motion tokens — the single source of truth for animation timing and easing.
 *
 * The site has two animation surfaces that must share one vocabulary:
 *   - CSS / WAAPI consumers read the `var(--dur-*)` / `var(--ease-*)` custom
 *     properties defined in globals.css `:root`.
 *   - JS / anime.js consumers import the constants below.
 * The two layers mirror each other — same numbers, two surfaces. Change one,
 * change the other.
 *
 * Naming is by intent, not by value: a "reveal" is always 0.16,1,0.3,1 no
 * matter where it lives, so the whole site reads as one author. Bespoke
 * case-study motion (CRT, curtain, heart-slice) deliberately opts out — those
 * are narrative set-pieces, not system UI.
 */

/** Durations in milliseconds, named by the role they play. */
export const DUR = {
  instant: 120, // pointer tracking, micro-feedback
  fast: 200, // hover, state flips, button feedback
  base: 360, // panels, drawers — the default
  slow: 600, // major transitions, widget entrance
  narrative: 760, // content reveals, hero beats
} as const;

type EaseToken = {
  /** cubic-bezier() form for CSS / Web Animations API. */
  css: string;
  /** anime.js v3 cubicBezier() string form. */
  anime: string;
  /** Raw control points for FLIP math / manual interpolation. */
  points: readonly [number, number, number, number];
};

export const EASE = {
  /** Settle / snap — the site's primary UI curve. */
  pop: {
    css: "cubic-bezier(0.22, 1, 0.36, 1)",
    anime: "cubicBezier(0.22, 1, 0.36, 1)",
    points: [0.22, 1, 0.36, 1],
  },
  /** Content entrances — softer, longer tail. */
  reveal: {
    css: "cubic-bezier(0.16, 1, 0.3, 1)",
    anime: "cubicBezier(0.16, 1, 0.3, 1)",
    points: [0.16, 1, 0.3, 1],
  },
  /** Exits / closes — eases in, then settles. */
  exit: {
    css: "cubic-bezier(0.32, 0, 0.18, 1)",
    anime: "cubicBezier(0.32, 0, 0.18, 1)",
    points: [0.32, 0, 0.18, 1],
  },
} as const satisfies Record<string, EaseToken>;

/** Per-frame lerp factors for rAF follow-motion (~60fps). Higher = snappier. */
export const LERP = {
  cursor: 0.18, // trailing cursor ring
  grid: 0.12, // dot-grid settle toward target
} as const;

/** Stagger steps (ms) for orchestrated entrances. */
export const STAGGER = {
  widget: 80, // grid widgets on load
  detail: 55, // detail-panel content items
} as const;

/**
 * True when the visitor asked for reduced motion. Guard autonomous/ambient
 * motion (drift, loops, ripples) with this. SSR-safe — false on the server.
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}
