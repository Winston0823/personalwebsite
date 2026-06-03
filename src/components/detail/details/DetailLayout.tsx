"use client";

/* Shared editorial scaffolding for the widget inspects so they read like the
   project case-study pages: a strong title block, a centered reading measure,
   plain accent kickers, and hairline section breaks. Inspects stay dark glass
   popups — this just brings the typographic system across.

   - DetailHeader: kicker (optional) → display-font title → standfirst, the
     same opening hierarchy a case study uses.
   - Hairline: quiet section divider matching the editorial header rules. */

export function DetailHeader({
  kicker,
  title,
  standfirst,
}: {
  kicker?: string;
  title: string;
  standfirst?: string;
}) {
  return (
    <header className="flex flex-col gap-2">
      {kicker && (
        <span
          className="uppercase font-semibold text-accent"
          style={{ fontSize: "0.86rem", letterSpacing: "0.22em" }}
        >
          {kicker}
        </span>
      )}
      <h1
        className="font-semibold text-text-primary"
        style={{
          fontSize: "clamp(1.9rem, 3.4vw, 2.7rem)",
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h1>
      {standfirst && (
        <p
          className="text-text-secondary leading-relaxed"
          style={{ fontSize: "var(--text-body)", maxWidth: "46ch" }}
        >
          {standfirst}
        </p>
      )}
    </header>
  );
}

export function Hairline({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-px w-full bg-white/10 ${className}`}
    />
  );
}
