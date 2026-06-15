"use client";

import { createPortal } from "react-dom";

export type LightboxItem = { image: string; title: string };

/* Full-screen image zoom. Rendered via a portal to <body> so it escapes any
   transformed ancestor (e.g. the detail overlay panel) and truly covers the
   viewport. Used by the mobile gallery preview and the full gallery view. */
export default function ImageLightbox({
  item,
  onClose,
}: {
  item: LightboxItem | null;
  onClose: () => void;
}) {
  if (!item || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-5"
      style={{
        background: "rgba(10,10,12,0.94)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "lb-fade 200ms ease",
      }}
      onClick={onClose}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-5 grid place-items-center rounded-full"
        style={{ width: 44, height: 44, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff" }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt={item.title}
        onClick={(e) => e.stopPropagation()}
        className="block max-w-full rounded-xl object-contain"
        style={{ maxHeight: "80vh", boxShadow: "0 24px 60px -20px rgba(0,0,0,0.7)", animation: "lb-pop 260ms var(--ease-pop)" }}
      />
      <div className="mt-4 text-center" style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", letterSpacing: "0.04em", color: "rgba(255,255,255,0.82)" }}>
        {item.title}
      </div>
    </div>,
    document.body
  );
}
