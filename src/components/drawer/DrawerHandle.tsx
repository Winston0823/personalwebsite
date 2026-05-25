"use client";

interface DrawerHandleProps {
  onClick: () => void;
  isOpen?: boolean;
}

/**
 * Vertical "Widgets" tab pinned to the right edge.
 *
 * At rest it's a slim accent-tinted bar (~10px) with a faint glow so it sits
 * at the periphery of vision without dominating the page. On hover/focus it
 * smoothly expands to ~44px and reveals a vertically-rotated "Widgets" label
 * plus a chevron — the label is the discoverability layer for recruiters
 * scanning the page.
 *
 * Stacking: z-40 sits above the grid (default) and above the drawer panel
 * (z-30) so the handle remains the persistent affordance — it doubles as
 * the close control when the drawer is open (chevron flips to `›`). The
 * detail overlay (z-60+) still wins and visually buries it, as required.
 *
 * Mobile: this component is only mounted on the desktop layout (`MobileLayout`
 * short-circuits in page.tsx), so no mobile-specific branches needed here.
 */
export default function DrawerHandle({ onClick, isOpen = false }: DrawerHandleProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Toggle widget drawer"
      aria-expanded={isOpen}
      className={[
        // positioning
        "group fixed right-0 top-1/2 -translate-y-1/2 z-40",
        // sizing — slim at rest, expands on hover/focus
        "h-32 w-[10px] hover:w-11 focus-visible:w-11",
        // shape — only round the left edge (pinned to right viewport edge)
        "rounded-l-xl rounded-r-none",
        // layout for label + chevron
        "flex items-center justify-center gap-2",
        // surface — accent-tinted glass at rest, more saturated on hover
        "bg-accent/45 hover:bg-accent/85 focus-visible:bg-accent/85",
        "backdrop-blur-md",
        // border — hairline on the left edge to feel like a real tab
        "border border-r-0 border-white/25",
        // soft accent glow so it's visible against the bg without shouting
        "shadow-[0_0_18px_-2px_rgba(0,122,255,0.45),0_2px_10px_rgba(0,0,0,0.12)]",
        "hover:shadow-[0_0_28px_-2px_rgba(0,122,255,0.7),0_4px_16px_rgba(0,0,0,0.18)]",
        // motion — restrained Google-style ease, no spring
        "transition-[width,background-color,box-shadow] duration-[220ms] ease-[cubic-bezier(0.2,0,0,1)]",
        // focus ring — 2px accent halo, no offset (tab is flush to viewport edge)
        "outline-none focus-visible:ring-2 focus-visible:ring-accent",
        // cursor
        "cursor-pointer overflow-hidden",
      ].join(" ")}
    >
      {/* Vertical "Widgets" label — hidden at rest, revealed on hover/focus.
          writing-mode rotates the glyphs so they read bottom-to-top along the
          tab. We pre-render it (not display:none) so width transition + fade
          stay in sync and the layout doesn't jump. */}
      <span
        className={[
          "text-white font-medium tracking-[0.18em] uppercase",
          "text-[11px] leading-none select-none",
          "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
          "transition-opacity duration-150 ease-out delay-[80ms]",
          "whitespace-nowrap",
        ].join(" ")}
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        Widgets
      </span>

      {/* Chevron — flips direction based on drawer state. Single-character
          glyph stays crisp at small sizes and matches the label weight. */}
      <span
        aria-hidden="true"
        className={[
          "text-white text-[13px] leading-none font-semibold select-none",
          "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
          "transition-opacity duration-150 ease-out delay-[80ms]",
        ].join(" ")}
      >
        {isOpen ? "›" : "‹"}
      </span>
    </button>
  );
}
