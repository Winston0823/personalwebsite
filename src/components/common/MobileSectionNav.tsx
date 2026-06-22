"use client";

import { useState } from "react";
import { CaretUp } from "@phosphor-icons/react";

/* Mobile section nav (md:hidden) — a thumb-zone pill showing the current section
   + a progress underline, doubling as the toggle: tap to expand a compact sheet
   of all sections, tap one to jump and collapse. Used by the dark case studies
   and the light home page (via the `variant` prop). */

const THEMES = {
  dark: {
    pillBg: "rgba(10,10,12,0.85)",
    border: "rgba(255,255,255,0.18)",
    text: "#ffffff",
    inactive: "rgba(255,255,255,0.6)",
    sheetBg: "rgba(10,10,12,0.92)",
    sheetBorder: "rgba(255,255,255,0.14)",
    rowBorder: "rgba(255,255,255,0.06)",
    activeBg: "rgba(255,255,255,0.06)",
    caret: "rgba(255,255,255,0.7)",
    scrim: "rgba(0,0,0,0.45)",
  },
  light: {
    pillBg: "rgba(255,255,255,0.88)",
    border: "rgba(0,0,0,0.12)",
    text: "var(--color-text-primary)",
    inactive: "rgba(46,51,54,0.55)",
    sheetBg: "rgba(255,255,255,0.96)",
    sheetBorder: "rgba(0,0,0,0.1)",
    rowBorder: "rgba(0,0,0,0.06)",
    activeBg: "rgba(0,0,0,0.04)",
    caret: "rgba(46,51,54,0.5)",
    scrim: "rgba(0,0,0,0.22)",
  },
} as const;

export default function MobileSectionNav({
  items,
  activeId,
  onJump,
  accent = "#ffffff",
  show = true,
  variant = "dark",
}: {
  items: { id: string; label: string }[];
  activeId: string;
  onJump: (id: string) => void;
  accent?: string;
  show?: boolean;
  variant?: "dark" | "light";
}) {
  const [open, setOpen] = useState(false);
  const t = THEMES[variant];
  if (!items.length) return null;

  const idx = Math.max(0, items.findIndex((i) => i.id === activeId));
  const active = items[idx] ?? items[0];
  const total = items.length;
  const pct = ((idx + 1) / total) * 100;

  const jump = (id: string) => {
    onJump(id);
    setOpen(false);
  };

  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-50 flex justify-center px-4"
      style={{
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transition: "opacity 400ms ease",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
    >
      {open && (
        <div
          className="fixed inset-0"
          style={{ zIndex: -1, background: t.scrim }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col items-stretch w-full" style={{ maxWidth: 360 }}>
        {open && (
          <div
            className="mb-2 rounded-2xl overflow-hidden"
            style={{
              background: t.sheetBg,
              border: `1px solid ${t.sheetBorder}`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 20px 50px -16px rgba(0,0,0,0.45)",
            }}
          >
            {items.map((it, i) => {
              const on = it.id === active.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => jump(it.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer"
                  style={{
                    borderBottom: i < total - 1 ? `1px solid ${t.rowBorder}` : "none",
                    background: on ? t.activeBg : "transparent",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: accent, width: 22 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="uppercase"
                    style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.14em", color: on ? t.text : t.inactive }}
                  >
                    {it.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Sections"
          className="relative flex items-center gap-3 rounded-full cursor-pointer overflow-hidden"
          style={{
            background: t.pillBg,
            border: `1px solid ${t.border}`,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding: "0.6rem 1rem",
            boxShadow: "0 12px 30px -14px rgba(0,0,0,0.45)",
          }}
        >
          <span aria-hidden="true" style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: `${pct}%`, background: accent, transition: "width 300ms ease" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: accent }}>
            {String(idx + 1).padStart(2, "0")}
            <span style={{ opacity: 0.5 }}>/{String(total).padStart(2, "0")}</span>
          </span>
          <span
            className="uppercase flex-1 truncate text-left"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", letterSpacing: "0.14em", color: t.text }}
          >
            {active.label}
          </span>
          <CaretUp size={14} weight="bold" color={t.caret} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
        </button>
      </div>
    </div>
  );
}
