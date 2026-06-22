"use client";

import NameSignature from "@/components/common/NameSignature";

/**
 * Name widget — a bilingual handwritten signature beneath the role tagline.
 * The handwriting loop itself lives in the shared <NameSignature/> (also used
 * by the mobile hero); this just frames it with the foreground role text.
 */
export default function NameWidget() {
  return (
    <div className="relative h-full w-full overflow-hidden @container">
      <div className="relative z-10 flex flex-col h-full">
        {/* Role tagline — foreground identity, kept from the original poster. */}
        <p
          className="font-semibold uppercase text-text-primary whitespace-nowrap"
          style={{ fontSize: "11px", letterSpacing: "0.14em" }}
        >
          Game Designer
          <span className="opacity-40 mx-2">·</span>
          UIUX Engineer
          <span className="opacity-40 mx-2">·</span>
          Product Designer
        </p>

        {/* Handwriting stage. */}
        <NameSignature className="relative w-full flex-1 min-h-0 overflow-hidden" />
      </div>
    </div>
  );
}
