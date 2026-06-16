"use client";

import { ambitScreens } from "@/lib/ambit-content";

/* Category-labeled screen flow (Adrian-Z device). A horizontal scroll-snap row
   of honest placeholder frames: each renders the real screen headline in
   Ambit's type + tokens with a single primary action, clearly marked as a
   preview. Real Figma exports replace the frame interiors later. */

const ZODIAK = "var(--font-zodiak), Georgia, serif"; // Ambit's real display face
const JAKARTA = "var(--font-jakarta), system-ui, sans-serif";
const MONO = "var(--font-mono)";

export default function AmbitScreens() {
  return (
    <div
      className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 md:-mx-10 md:px-10 hide-scrollbar"
      style={{ scrollSnapType: "x mandatory" }}
    >
      {ambitScreens.map((s) => (
        <figure key={s.headline} className="shrink-0 flex flex-col gap-4" style={{ scrollSnapAlign: "start", width: "min(74vw, 248px)" }}>
          {/* honest placeholder device frame — real tokens, real headline */}
          <div
            className="relative w-full rounded-[28px] overflow-hidden"
            style={{ aspectRatio: "9 / 19", background: "#F2EEE4", boxShadow: "0 24px 60px -28px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.1)" }}
          >
            <div className="absolute inset-0 flex flex-col p-5">
              {/* status hint */}
              <div className="flex justify-between" style={{ fontFamily: JAKARTA, fontSize: "0.62rem", color: "#737373" }}>
                <span>9:41</span>
                <span>Ambit</span>
              </div>
              {/* headline in the real display face */}
              <div className="flex-1 flex items-start pt-10">
                <h4 style={{ fontFamily: ZODIAK, fontWeight: 700, fontSize: "1.7rem", lineHeight: 1.05, color: "#1C1C1A", letterSpacing: "-0.01em" }}>
                  {s.headline}
                </h4>
              </div>
              {/* the real signature button: teal full-pill, ink border + label,
                  hard 4px offset edge straight below (Ambit atoms/Button.tsx) */}
              <div
                className="text-center"
                style={{ background: "#A6C7C2", fontFamily: JAKARTA, fontSize: "0.85rem", fontWeight: 600, color: "#1C1C1A", border: "1.5px solid #1C1C1A", borderRadius: 999, padding: "11px 0", marginBottom: 4, boxShadow: "0 4px 0 #1C1C1A" }}
              >
                Continue
              </div>
            </div>
            {/* honest preview marker so the frame never poses as a finished screen */}
            <span
              className="absolute top-3 right-3 uppercase"
              style={{ fontFamily: MONO, fontSize: "0.5rem", letterSpacing: "0.16em", color: "rgba(0,0,0,0.32)", background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: 999 }}
            >
              preview
            </span>
          </div>

          <figcaption className="flex flex-col gap-1">
            <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "#A6C7C2" }}>
              {s.category}
            </span>
            <span style={{ fontFamily: JAKARTA, fontSize: "0.82rem", lineHeight: 1.5, color: "rgba(245,239,228,0.6)" }}>
              {s.caption}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
