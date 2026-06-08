"use client";

import { useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

const ACCENT = "#e83a8a";

/* A small stacked image carousel for the UI work — one screen at a time with
   prev/next controls, clickable dots, and a crossfade. Fixed 16:9 frame so the
   layout doesn't jump between differently-sized screenshots. */
export default function UiCarousel({
  items,
}: {
  items: { src: string; caption: string }[];
}) {
  const [i, setI] = useState(0);
  const n = items.length;
  const go = (d: number) => setI((p) => (p + d + n) % n);

  const arrow: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.22)",
    color: "#fff",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
  };

  return (
    <div style={{ marginTop: "1.6rem" }}>
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16 / 9", borderRadius: 10, border: "1px solid rgba(255,255,255,0.10)", background: "#0b0c0e" }}
      >
        {items.map((it, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={it.src}
            src={it.src}
            alt={it.caption}
            className="absolute inset-0 w-full h-full object-contain"
            loading="lazy"
            decoding="async"
            style={{ opacity: idx === i ? 1 : 0, transition: "opacity 400ms ease" }}
          />
        ))}

        <button type="button" aria-label="Previous" onClick={() => go(-1)} className="hover:border-white/45" style={{ ...arrow, left: 12 }}>
          <CaretLeft size={18} weight="bold" />
        </button>
        <button type="button" aria-label="Next" onClick={() => go(1)} className="hover:border-white/45" style={{ ...arrow, right: 12 }}>
          <CaretRight size={18} weight="bold" />
        </button>
      </div>

      {/* Caption + dots */}
      <div className="flex items-center justify-between mt-3" style={{ fontFamily: "var(--font-mono)" }}>
        <span className="text-white/55" style={{ fontSize: "0.74rem", letterSpacing: "0.04em" }}>
          {items[i].caption}
        </span>
        <div className="flex items-center gap-2">
          {items.map((it, idx) => (
            <button
              key={it.src}
              type="button"
              aria-label={`Go to ${it.caption}`}
              onClick={() => setI(idx)}
              style={{
                width: idx === i ? 18 : 7,
                height: 7,
                borderRadius: 4,
                border: 0,
                padding: 0,
                cursor: "pointer",
                background: idx === i ? ACCENT : "rgba(255,255,255,0.3)",
                transition: "width 250ms ease, background 250ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
