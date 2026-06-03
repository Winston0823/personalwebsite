"use client";

import { FilmSlate } from "@phosphor-icons/react";

/* The icon is the button: a Phosphor clapperboard at 75% opacity that opens the
   trailer in a new tab. */
export default function TrailerButton({
  href,
  size = 40,
}: {
  href: string;
  size?: number;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Watch trailer"
      title="Watch trailer"
      className="inline-block cursor-pointer hover:opacity-100 hover:scale-105"
      style={{
        color: "#ffffff",
        opacity: 0.75,
        lineHeight: 0,
        transformOrigin: "center",
        transition: "opacity 200ms ease, transform 220ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <FilmSlate size={size} weight="fill" />
    </a>
  );
}
