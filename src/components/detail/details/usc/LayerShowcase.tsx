"use client";

import Reveal from "../../shared/Reveal";
import PixelLiquidDemo from "./PixelLiquidDemo";

const PHOTOREAL = "/images/usc-racing/hero-photoreal.png";
const HOLOGRAPHIC = "/images/usc-racing/hero-holographic.png";

/* Act 2 — "Two cars, one hero". The two real hero layers shown side by side:
   the photoreal render the world sees, and the holographic wireframe sitting
   underneath. Beside them, a shrunken live demo of the actual liquid-pixel
   dissolve that ships on the site — hover to erase the render and reveal the
   engineering. */

function Panel({
  src,
  kicker,
  caption,
}: {
  src: string;
  kicker: string;
  caption: string;
}) {
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        className="relative w-full overflow-hidden rounded-xl"
        style={{ aspectRatio: "16 / 9", boxShadow: "0 18px 50px -16px rgba(0,0,0,0.7)", outline: "1px solid rgba(227,181,61,0.18)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={caption} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
      </div>
      <figcaption className="flex flex-col gap-0.5">
        <span
          className="uppercase"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.24em", color: "#e3b53d" }}
        >
          {kicker}
        </span>
        <span className="text-white/70" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}

export default function LayerShowcase() {
  return (
    <div className="flex flex-col gap-7 w-full max-w-5xl mx-auto">
      <Reveal>
        <span
          className="uppercase"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.3em", color: "#e3b53d" }}
        >
          The decision · the hero
        </span>
        <h3
          className="text-white mt-2"
          style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "clamp(1.5rem, 3vw, 2.1rem)", letterSpacing: "-0.01em" }}
        >
          Two cars, one hero.
        </h3>
        <p
          className="text-white/70 mt-3 max-w-2xl"
          style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", lineHeight: 1.7 }}
        >
          A render alone says &ldquo;nice car.&rdquo; But this is an <em>engineering</em>{" "}
          team — so the hero is built from two registered layers of the same car. The
          photoreal render the world sees, and a holographic wireframe of the parts
          underneath. As you move across it, the render <em>pixel-dissolves</em> into the
          wireframe — form melting into engineering. Same framing, same camera, so the
          dissolve lands pixel-for-pixel.
        </p>
      </Reveal>

      <Reveal delay={80} className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        <Panel src={PHOTOREAL} kicker="layer 01 · render" caption="what the world sees" />
        <Panel src={HOLOGRAPHIC} kicker="layer 02 · wireframe" caption="the engineering underneath" />

        {/* The live effect — same size as the layer panels, flagged with an arrow */}
        <figure className="relative m-0 flex flex-col gap-2">
          {/* "hover me" callout pointing into the live panel (md+) */}
          <div className="hidden md:flex absolute items-center gap-2 pointer-events-none" style={{ top: -48, left: 12, zIndex: 5 }}>
            <span
              className="uppercase"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.66rem", letterSpacing: "0.18em", color: "#e3b53d" }}
            >
              hover me
            </span>
            {/* curve starts at the text's vertical centre (y=31) and arcs down into the panel */}
            <svg width="58" height="62" viewBox="0 0 58 62" fill="none" aria-hidden="true">
              <path d="M2 31 C 26 24, 48 30, 40 52" stroke="#e3b53d" strokeWidth="2" strokeLinecap="round" />
              <path d="M32 45 L40 54 L48 44" stroke="#e3b53d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div
            className="relative w-full overflow-hidden rounded-xl bg-black"
            style={{ aspectRatio: "16 / 9", boxShadow: "0 18px 50px -16px rgba(0,0,0,0.7)", outline: "1px solid rgba(227,181,61,0.35)" }}
          >
            {/* Wireframe sits behind; the canvas paints the render on top and erases it */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HOLOGRAPHIC} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
            <PixelLiquidDemo photorealSrc={PHOTOREAL} className="absolute inset-0 w-full h-full" />
          </div>
          <figcaption className="flex flex-col gap-0.5">
            <span
              className="uppercase"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.24em", color: "#e3b53d" }}
            >
              live · hover me
            </span>
            <span className="text-white/70" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
              the actual liquid-pixel reveal
            </span>
          </figcaption>
        </figure>
      </Reveal>
    </div>
  );
}
