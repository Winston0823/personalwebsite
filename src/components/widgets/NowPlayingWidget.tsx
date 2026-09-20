"use client";

import { useNowPlaying } from "@/hooks/useNowPlaying";

export default function NowPlayingWidget() {
  const track = useNowPlaying();

  return (
    // The portrait bleeds past the widget's bottom edge, so the card has to
    // clip it. relative + overflow-hidden is what makes the crop happen.
    <div className="relative flex flex-col justify-center h-full min-h-0 overflow-hidden">
      {/* Headphone portrait — flipped in the asset itself so he faces left,
          into the track info rather than off the card. Purely decorative, so
          it's hidden from assistive tech; the sr-only heading below is what
          actually names this widget now that the visible label is gone. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/listening-portrait.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute right-0 bottom-0 w-auto"
        style={{ height: "128%", transform: "translate(18%, 14%)" }}
      />

      {/* The visible "I'm currently listening to" label is gone — the
          headphone portrait carries that meaning now. Screen readers still
          need it, hence sr-only rather than deletion. */}
      <h2 className="sr-only">I&apos;m currently listening to</h2>

      {/* Right padding keeps the track title clear of the portrait. */}
      <div className="flex items-center gap-3 min-h-0 pr-[19%]">
        <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden bg-accent/10 flex items-center justify-center shadow-sm">
          {track.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.albumArt}
              alt={`${track.title} album art`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-accent" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p
            className="font-semibold text-text-primary truncate leading-tight"
            style={{ fontSize: "var(--text-subheading)" }}
          >
            {track.title}
          </p>
          <p
            className="font-normal text-text-secondary truncate leading-tight mt-1"
            style={{ fontSize: "var(--text-body)" }}
          >
            {track.artist}
          </p>
        </div>
      </div>
    </div>
  );
}
