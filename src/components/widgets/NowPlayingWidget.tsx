"use client";

import { useNowPlaying } from "@/hooks/useNowPlaying";

export default function NowPlayingWidget() {
  const track = useNowPlaying();

  return (
    <div className="flex flex-col h-full gap-2 min-h-0">
      <p
        className="font-semibold uppercase tracking-widest text-accent leading-none"
        style={{ fontSize: "var(--text-widget-title)" }}
      >
        I&apos;m currently listening to
      </p>

      <div className="flex items-center gap-4 flex-1 min-h-0">
        <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-purple-500/15 flex items-center justify-center shadow-sm ring-1 ring-black/5">
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
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-purple-500" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <p
            className="font-semibold text-text-primary truncate leading-tight"
            style={{ fontSize: "var(--text-body)" }}
          >
            {track.title}
          </p>
          <p
            className="font-normal text-text-secondary truncate leading-tight mt-0.5"
            style={{ fontSize: "var(--text-caption)" }}
          >
            {track.artist}
          </p>
        </div>

        <div className="flex items-end gap-[3px] shrink-0 h-6">
          {[4, 7, 3, 6, 5, 2].map((h, i) => (
            <div
              key={i}
              className="w-[3px] bg-accent rounded-full"
              style={{
                height: `${h * 3}px`,
                animation: `pulse 1.${i + 2}s ease-in-out infinite alternate`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
