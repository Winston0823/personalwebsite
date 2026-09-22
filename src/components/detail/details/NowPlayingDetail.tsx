"use client";

import { useNowPlaying } from "@/hooks/useNowPlaying";

/* The opened Now Playing widget is a single object: a record player, centered,
 * with the live album art as the spinning disc, and the track title + artist
 * captioned beneath it. No prose column — the record is the subject. Plinth,
 * platter and tonearm are CSS (see .turntable in globals.css). */
export default function NowPlayingDetail() {
  const track = useNowPlaying();

  return (
    <div className="detail-stagger flex flex-col items-center justify-center gap-7 w-full min-h-full py-6">
      <div className="turntable" aria-label={`Now playing: ${track.title} by ${track.artist}`}>
        <div className="turntable__platter">
          <div className="vinyl">
            {track.albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="vinyl__art" src={track.albumArt} alt="" />
            ) : (
              <div className="vinyl__art flex items-center justify-center bg-purple-900/40">
                <svg viewBox="0 0 24 24" className="w-12 h-12 text-purple-200" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
          </div>
        </div>
        <span className="turntable__arm" aria-hidden="true">
          <span className="turntable__arm-shaft" />
        </span>
      </div>

      <div className="flex flex-col gap-1 items-center text-center max-w-xs">
        <h2
          className="text-text-primary tracking-tight leading-[1.05]"
          style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}
        >
          {track.title}
        </h2>
        <p className="text-text-secondary" style={{ fontSize: "var(--text-body)" }}>
          {track.artist}
        </p>
      </div>
    </div>
  );
}
