"use client";

import { ambitSwatches } from "@/lib/ambit-content";

/* The "design system as content" block: Ambit's real palette tokens as swatch
   cards (Adrian-Z device) plus a compact Zodiak / Plus Jakarta type specimen.
   Dark warm theme; one locked accent (brand tan). */

const ZODIAK = "var(--font-zodiak), Georgia, serif"; // Ambit's real display face
const JAKARTA = "var(--font-jakarta), system-ui, sans-serif";
const MONO = "var(--font-mono)";

export default function AmbitSwatches() {
  return (
    <div className="flex flex-col gap-12">
      {/* Palette */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {ambitSwatches.map((s) => (
          <div key={s.name} className="flex flex-col gap-3">
            <div
              className="relative w-full rounded-xl overflow-hidden"
              style={{
                aspectRatio: "5 / 4",
                background: s.hex,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
              }}
            >
              <span
                className="absolute bottom-2.5 left-2.5"
                style={{
                  fontFamily: MONO,
                  fontSize: "0.72rem",
                  letterSpacing: "0.04em",
                  color: s.ink === "dark" ? "rgba(20,17,13,0.78)" : "rgba(255,255,255,0.86)",
                }}
              >
                {s.hex}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span style={{ fontFamily: JAKARTA, fontSize: "0.85rem", fontWeight: 600, color: "rgba(245,239,228,0.95)" }}>
                {s.name}
              </span>
              <span style={{ fontFamily: MONO, fontSize: "0.62rem", letterSpacing: "0.02em", color: "rgba(245,239,228,0.42)" }}>
                RGB {s.rgb}
              </span>
              <span style={{ fontFamily: JAKARTA, fontSize: "0.74rem", lineHeight: 1.4, color: "rgba(245,239,228,0.55)" }}>
                {s.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Type specimen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl p-6 flex flex-col gap-4" style={{ background: "rgba(245,239,228,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}>
          <span style={{ fontFamily: ZODIAK, fontWeight: 700, fontSize: "clamp(3rem, 7vw, 4.5rem)", lineHeight: 1, color: "#A6C7C2" }}>
            Aa
          </span>
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: JAKARTA, fontSize: "0.95rem", fontWeight: 600, color: "rgba(245,239,228,0.95)" }}>
              Zodiak Bold
            </span>
            <span style={{ fontFamily: JAKARTA, fontSize: "0.8rem", lineHeight: 1.5, color: "rgba(245,239,228,0.55)" }}>
              Display headlines only. A characterful contemporary serif, the Ambit hero voice.
            </span>
          </div>
        </div>

        <div className="rounded-xl p-6 flex flex-col gap-4" style={{ background: "rgba(245,239,228,0.04)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07)" }}>
          <span style={{ fontFamily: JAKARTA, fontWeight: 700, fontSize: "clamp(3rem, 7vw, 4.5rem)", lineHeight: 1, color: "rgba(245,239,228,0.95)" }}>
            Aa
          </span>
          <div className="flex flex-col gap-1">
            <span style={{ fontFamily: JAKARTA, fontSize: "0.95rem", fontWeight: 600, color: "rgba(245,239,228,0.95)" }}>
              Plus Jakarta Sans
            </span>
            <span style={{ fontFamily: JAKARTA, fontSize: "0.8rem", lineHeight: 1.5, color: "rgba(245,239,228,0.55)" }}>
              Body, labels, buttons, chips, helper copy. The product workhorse.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
