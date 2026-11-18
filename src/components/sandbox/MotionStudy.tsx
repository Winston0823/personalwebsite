"use client";

import { useState, type CSSProperties } from "react";
import {
  ArrowCounterClockwise,
  SlidersHorizontal,
} from "@phosphor-icons/react";

export default function MotionStudy() {
  const [spread, setSpread] = useState(48);
  const [tone, setTone] = useState("lime");
  return (
    <div className={`motion-study tone-${tone}`}>
      <div className="study-top">
        <span>
          <span className="live-dot" /> INTERACTIVE STUDY / 001
        </span>
        <button
          onClick={() => {
            setSpread(48);
            setTone("lime");
          }}
          aria-label="Reset motion study"
        >
          <ArrowCounterClockwise size={17} />
        </button>
      </div>
      <div
        className="study-canvas"
        style={{ "--spread": `${spread}px` } as CSSProperties}
        aria-hidden="true"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} style={{ "--i": i } as CSSProperties} />
        ))}
        <span className="study-cross">+</span>
      </div>
      <div className="study-controls">
        <label htmlFor="spread">
          <SlidersHorizontal size={16} /> Spread
        </label>
        <input
          id="spread"
          type="range"
          min="12"
          max="78"
          value={spread}
          onChange={(e) => setSpread(Number(e.target.value))}
        />
        <div className="swatches" role="group" aria-label="Study color">
          {["lime", "violet", "white"].map((color) => (
            <button
              key={color}
              className={`swatch ${color}`}
              aria-label={`Use ${color}`}
              aria-pressed={tone === color}
              onClick={() => setTone(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
