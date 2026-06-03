"use client";

/* Shared section kicker used across every detail inspect (About, Resume,
   Contact, Now Playing, Name) AND the project case study, so all panels read
   with the same editorial voice. Inspects are popups over the widget board,
   so the surrounding layout differs — but this accent kicker is the common
   thread that ties them back to the case-study pages.

   Style is the case-study label: uppercase, accent blue, wide 0.22em tracking.
   (.detail-panel .text-accent in globals.css resolves color/glow/size.)

   `rule` adds the editorial leading hairline used by the case-study header —
   opt in where a section wants a touch more weight. */
export default function SectionLabel({
  children,
  rule = false,
  caps = true,
}: {
  children: React.ReactNode;
  rule?: boolean;
  /** Uppercase + wide tracking (case-study default). Set false for the
      lighter sentence-case kicker used in the widget inspects. */
  caps?: boolean;
}) {
  const className = `${caps ? "uppercase " : ""}font-semibold text-accent`;
  const style = {
    fontSize: "0.86rem",
    letterSpacing: caps ? "0.22em" : "0.02em",
  };

  if (rule) {
    return (
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="block h-px bg-accent flex-shrink-0"
          style={{ width: 28 }}
        />
        <p className={className} style={style}>
          {children}
        </p>
      </div>
    );
  }

  return (
    <p className={className} style={style}>
      {children}
    </p>
  );
}
