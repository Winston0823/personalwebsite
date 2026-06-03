"use client";

import { useNowPlaying } from "@/hooks/useNowPlaying";
import { DetailHeader } from "./DetailLayout";

export default function NowPlayingDetail() {
  const track = useNowPlaying();

  return (
    <div className="detail-stagger flex flex-col md:flex-row gap-10 md:gap-14 items-center md:items-start max-w-4xl mx-auto w-full">
      {/* Left: voice on what I'm into. Reads as a personality side-bar so
       *  the visitor learns something about taste, not just the current
       *  track. */}
      <div className="flex flex-col gap-4 md:flex-1 md:max-w-md">
        <DetailHeader
          title="On rotation"
          standfirst="What I'm listening to lately — and the music I keep coming back to."
        />
        <p
          className="text-text-primary leading-relaxed"
          style={{ fontSize: "var(--text-body)" }}
        >
          I grew up on older English pop — Justin Bieber, Lady Gaga, the kind of
          songs you can hum without thinking. Lately I&apos;ve been leaning into
          newer pop too: Conan Gray&apos;s discography on loop, and Keshi when I
          need something quieter.
        </p>
        <p
          className="text-text-primary leading-relaxed"
          style={{ fontSize: "var(--text-body)" }}
        >
          On the other side I&apos;m deep into Chinese pop, and I know just
          enough Korean pop to sing the chorus and fake the verses.
        </p>
      </div>

      {/* Right: rotating vinyl with the live track meta. The vinyl class is
       *  defined in globals.css and handles the spin animation + record edge. */}
      <div className="flex flex-col items-center gap-5 md:flex-1">
        <div className="vinyl">
          {track.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="vinyl__art"
              src={track.albumArt}
              alt={`${track.title} — ${track.artist}`}
            />
          ) : (
            <div className="vinyl__art flex items-center justify-center bg-purple-900/40">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-purple-200" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
          )}
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
          {track.album && (
            <p
              className="text-text-secondary opacity-70 mt-1"
              style={{ fontSize: "var(--text-caption)" }}
            >
              {track.album}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
