"use client";

/**
 * BackgroundTitle
 *
 * A pipe-separated role tagline that sits behind the widget grid in the
 * negative-space band running horizontally through the lower-middle of the
 * layout. Inspired by the Figma V2 "Pipe-separated tagline" mock — quiet,
 * Linear-coded, professional. Functions as a recruiter-facing identity cue
 * without competing with the widgets for attention.
 *
 * Stacking: z-0 (above GradientBackground at z-0 by virtue of source order;
 * below widget shells which sit at z-1 via WidgetShell wrapperStyle).
 *
 * pointer-events: none — purely decorative, never blocks interaction.
 * select-none + aria-hidden — keeps it out of the a11y tree and copy buffer.
 */
export default function BackgroundTitle() {
  // Sits at the TOP CENTER of the viewport — viewport-centered, not
  // anchored to widget positions. Reads as the page's identity declaration,
  // pairs with "Winston Gu" as the role-statement subtitle. At default
  // widget layout it clears Name and NowPlaying with ~80–300px on each
  // side; if a layout change ever causes overlap, the tagline shrink
  // takes priority over re-anchoring.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed z-0 select-none"
      style={{
        top: "5%",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <span
        // Matches widget-title typography (semibold, uppercase, wide
        // tracking, sans family). Color uses text/primary so it reads with
        // intent — at the top of the viewport this is the identity
        // statement, not background filler.
        className="font-semibold uppercase tracking-widest"
        style={{
          fontSize: "0.8125rem", // 13px — at the bottom of widget-title range
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-sans)",
          whiteSpace: "nowrap",
          letterSpacing: "0.18em",
        }}
      >
        GAME DESIGNER
        <span style={{ opacity: 0.45, margin: "0 0.7em" }}>|</span>
        UIUX ENGINEER
        <span style={{ opacity: 0.45, margin: "0 0.7em" }}>|</span>
        PRODUCT DESIGNER
      </span>
    </div>
  );
}
