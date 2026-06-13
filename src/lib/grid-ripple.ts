/**
 * Dot-grid ripple bus.
 *
 * The ambient dot grid (DotGridBackground) reacts to the cursor spotlight. This
 * bus lets major interactions — opening a detail panel, discarding a widget,
 * dropping a widget into the grid — send a one-shot wavefront through the same
 * grid, so the background reads as one reactive surface that answers what you
 * do rather than three independent ambient effects.
 *
 * Decoupled via a window CustomEvent: producers anywhere in the tree call
 * emitGridRipple(); the single DotGridBackground instance listens. No refs to
 * thread, and it no-ops cleanly on the server / before the grid mounts.
 */

export const GRID_RIPPLE_EVENT = "dotgrid:ripple";

export type RGB = readonly [number, number, number];

export interface GridRippleDetail {
  /** Origin in viewport (client) coordinates. */
  x: number;
  y: number;
  /** Relative amplitude; 1 is the default event. Clamped grid-side. */
  strength?: number;
  /** Wavefront tint as [r,g,b]; omitted = the grid's warm-grey base. */
  color?: RGB;
  /** Wavefront expansion rate in px/ms (default ~0.95). Higher = snappier. */
  speed?: number;
  /** Ring thickness in px (default ~70). Lower = sharper, tighter ring. */
  width?: number;
  /** Lifetime in ms before the ripple is pruned (default ~1100). */
  life?: number;
}

export type RippleOpts = Omit<GridRippleDetail, "x" | "y">;

/**
 * Ripple personalities — each interaction speaks with its own character so the
 * grid reads as intentional, not a single repeated wave.
 *  - open: a confident accent-tinted bloom as a detail panel emerges.
 *  - drop / move: soft, quiet — a widget landed or shifted, nothing created.
 *  - discard: a fast, tight, RED collapse — destruction, not creation.
 *  - cold: the first-paint "wake".
 * Themed case studies ripple in their own accent via themeRipple().
 */
export const RIPPLE = {
  open: { strength: 1.2, color: [56, 132, 255] as RGB },
  drop: { strength: 0.9 },
  move: { strength: 0.8 },
  discard: { strength: 1.15, color: [255, 59, 48] as RGB, speed: 1.35, width: 48, life: 850 },
  cold: { strength: 1.3 },
} as const satisfies Record<string, RippleOpts>;

/** Per-project accents for case-study entrance ripples (keyed by data-cursor-theme). */
export const THEME_RIPPLE: Record<string, RGB> = {
  sublime: [232, 58, 138], // pink crystal
  usc: [227, 181, 61], // USC gold
  awl: [196, 42, 52], // assassin red
};

/** A themed entrance ripple for a case study, or a strong accent bloom if the
 *  theme isn't one we color. */
export function themeRipple(theme: string | null | undefined): RippleOpts {
  const color = (theme && THEME_RIPPLE[theme]) || RIPPLE.open.color;
  return { strength: 1.35, color, speed: 1.05, width: 78, life: 1200 };
}

/** Send a ripple from a viewport point. Safe to call anywhere. */
export function emitGridRipple(x: number, y: number, opts: RippleOpts = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<GridRippleDetail>(GRID_RIPPLE_EVENT, {
      detail: { x, y, ...opts },
    }),
  );
}

// ---------------------------------------------------------------------------
// Drag-follow glow — a sustained, moving pool of light under a dragged widget,
// distinct from the one-shot ripples. The grid keeps a single active glow; set
// it each drag-move, clear it on drop (the drop ripple then takes over).
// ---------------------------------------------------------------------------

export const GRID_GLOW_EVENT = "dotgrid:glow";

/** Warm near-white — the grid catching light under the widget, NOT the blue
 *  accent. Tweak here to retune the drag glow's hue. */
export const GLOW_WARM: RGB = [236, 228, 212];

export interface GridGlowDetail {
  /** false tells the grid to fade the glow out. */
  active: boolean;
  x?: number;
  y?: number;
  /** Pool radius in px (default grid-side). Usually the dragged widget's reach. */
  radius?: number;
  /** Peak amplitude of the pool (default grid-side). */
  strength?: number;
  color?: RGB;
}

/** Position/light the drag glow at a viewport point. Call on each drag move. */
export function setGridGlow(
  x: number,
  y: number,
  opts: { radius?: number; strength?: number; color?: RGB } = {},
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<GridGlowDetail>(GRID_GLOW_EVENT, {
      detail: { active: true, x, y, ...opts },
    }),
  );
}

/** Release the drag glow (fades out grid-side). */
export function clearGridGlow(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<GridGlowDetail>(GRID_GLOW_EVENT, { detail: { active: false } }),
  );
}
