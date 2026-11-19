"use client";

import { useState } from "react";
import NameSignature from "@/components/common/NameSignature";
import SquiggleOutline from "./SquiggleOutline";

const mark = "/images/cat-mark.png";

export default function AboutDoggo() {
  const [nudged, setNudged] = useState(false);
  return (
    <>
      <button
        className={`doggo-sticker about-doggo-sticker${nudged ? " is-nudged" : ""}`}
        aria-label="Give doggo a nudge"
        onClick={() => {
          if (!document.documentElement.hasAttribute("data-doggo-journey"))
            setNudged(true);
        }}
        onAnimationEnd={() => setNudged(false)}
      >
        <SquiggleOutline variant="sticker" />
        <img
          data-about-doggo
          src={mark}
          alt=""
          className="about-doggo-image"
          width="792"
          height="412"
          draggable={false}
        />
        <NameSignature
          className="sticker-name"
          englishText="Winston Gu"
          ink="#55554f"
        />
        <span className="sticker-role">Designer & builder</span>
      </button>
      <noscript>
        <style>{`.about-doggo-image{opacity:1!important}`}</style>
      </noscript>
    </>
  );
}
