"use client";

export default function NameWidget() {
  return (
    <div className="relative h-full w-full overflow-hidden @container">
      {/* Background: oversized name stacked on two lines so it can scale
       *  much larger than a single-line treatment while staying inside the
       *  widget. Reads as poster art, not a watermark. */}
      <h1
        aria-label="Winston Gu"
        className="pointer-events-none absolute inset-0 flex flex-col items-start justify-center text-text-primary font-bold select-none leading-[0.85] name-poster"
        style={{
          letterSpacing: "-0.045em",
          opacity: 0.13,
        }}
      >
        <span>Winston</span>
        <span>Gu</span>
      </h1>

      {/* Foreground: role tagline at top, one line. CTAs live in the
       *  dedicated Links widget at the bottom-right of the dashboard. */}
      <div className="relative z-10 flex flex-col h-full">
        <p
          className="font-semibold uppercase text-text-primary whitespace-nowrap"
          style={{
            fontSize: "11px",
            letterSpacing: "0.14em",
          }}
        >
          Game Designer
          <span className="opacity-40 mx-2">·</span>
          UIUX Engineer
          <span className="opacity-40 mx-2">·</span>
          Product Designer
        </p>
      </div>
    </div>
  );
}
