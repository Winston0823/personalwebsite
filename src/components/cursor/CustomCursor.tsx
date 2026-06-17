"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LERP } from "@/lib/motion";
import { isPerfLite } from "@/lib/perf-tier";
import {
  CursorClick,
  HandGrabbing,
  ArrowUpRight,
  Trash,
  CaretLeft,
  CaretRight,
  Eye,
  Play,
  ArrowsLeftRight,
  X,
  Copy,
  DownloadSimple,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";

/**
 * Custom cursor — the site's onboarding layer.
 *
 * Two-part cursor in the azumbrunnen.me tradition: a precise accent dot at
 * the true pointer position, plus a larger ring that trails it with eased
 * lag (rAF lerp). Over interactive targets the ring expands into a frosted
 * pill naming the available actions; on press everything contracts slightly.
 *
 * Targets opt in via `data-cursor="<state>"` attributes. Regions that should
 * keep the native cursor (text-heavy detail panels) opt out via
 * `data-cursor-native`. The nearest ancestor with either attribute wins.
 *
 * Drag state is driven by `document.body.dataset.ccDragging` / `ccTrash`,
 * set by the DndContext handlers in page.tsx (the pointermove target during
 * a dnd-kit drag is the dragged element itself, so attributes can't be
 * trusted mid-drag).
 *
 * Pills always carry their label — the affordance text is the whole point of
 * the cursor, so it stays predictable rather than decaying per-visitor.
 *
 * Touch devices: `(pointer: fine)` gates everything — no class on <html>,
 * no rendered cursor, native behavior untouched.
 */

type CursorState =
  | "default"
  | "widget"
  | "widget-drag"
  | "link"
  | "drawer-handle"
  | "drawer-item"
  | "button"
  | "grabbing"
  | "trash"
  // Detail-view affordances — see the detail/ subtree for the targets.
  | "view" // project cards, gallery images
  | "play" // trailer / video triggers
  | "prev" // carousel previous
  | "next" // carousel next
  | "compare" // image-compare drag slider
  | "close" // close buttons, overlay backdrop
  | "copy" // copy-to-clipboard (reserved — no target ships yet)
  | "download" // résumé / file download triggers
  | "reset" // reset-widgets control in the grid's top-right corner
  | "text" // body text — dot collapses into a caret-like vertical line
  | "hidden";

/** Tags that read as body text and get the caret-line cursor (azumbrunnen
 *  tradition). Interactive text (links, buttons) carries its own data-cursor,
 *  so closest() claims it first and it never reaches this check. */
const TEXT_TAGS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "LI",
  "BLOCKQUOTE",
  "FIGCAPTION",
  "EM",
  "STRONG",
]);

function isTextTarget(el: Element | null): boolean {
  return (
    !!el && TEXT_TAGS.has(el.tagName) && (el.textContent?.trim().length ?? 0) > 0
  );
}

/** Per-frame lerp factor for the trailing ring (~60fps). */
const RING_EASE = LERP.cursor;

const ICON_SIZE = 12;

export default function CustomCursor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  // Last text element the caret-line was sized to. getComputedStyle forces a
  // sync layout, so we only re-measure when the pointer crosses into new text.
  const lastTextEl = useRef<Element | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>("hidden");
  const [pressed, setPressed] = useState(false);
  // Per-project palette — mirrors the nearest [data-cursor-theme] ancestor so
  // the cursor can recolor itself to match a case study (e.g. USC gold).
  const [theme, setTheme] = useState<string | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    // Mouse/trackpad only — touch gets native behavior.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    // Weak devices: skip the custom cursor entirely. It runs a permanent rAF
    // lerp loop and repaints a portaled layer on every pointer move — pure
    // overhead the native cursor avoids. Restores the OS cursor on perf-lite.
    if (isPerfLite()) return;

    setEnabled(true);
    document.documentElement.classList.add("cc-active");

    // Reduced motion: ring snaps to the pointer instead of trailing.
    const ease = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 1
      : RING_EASE;

    const target = { x: -100, y: -100 }; // true pointer position
    const ring = { x: -100, y: -100 }; // lagged ring position
    let settled = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      // First movement: teleport the ring so it doesn't fly in from offscreen.
      if (!settled) {
        ring.x = target.x;
        ring.y = target.y;
        settled = true;
      }

      let next: CursorState;
      if (document.body.dataset.ccDragging) {
        next = document.body.dataset.ccTrash === "true" ? "trash" : "grabbing";
      } else {
        const t = e.target as Element | null;
        const hit = t?.closest?.("[data-cursor],[data-cursor-native]") ?? null;
        if (!hit) {
          next = "default";
        } else if (hit.hasAttribute("data-cursor-native")) {
          next = "hidden"; // let the browser cursor take over
        } else {
          next = (hit.getAttribute("data-cursor") as CursorState) || "default";
        }
        // No explicit affordance claimed the pointer, but we're over body text:
        // collapse the dot into a caret-line sized to that text (clamped).
        // Re-measure only when entering a NEW text element — measuring every
        // move would force a layout flush per frame and lag the cursor.
        if (next === "default" && isTextTarget(t)) {
          next = "text";
          if (t !== lastTextEl.current) {
            lastTextEl.current = t;
            const fs = parseFloat(getComputedStyle(t as Element).fontSize) || 18;
            const h = Math.max(14, Math.min(40, fs * 1.1));
            layerRef.current?.style.setProperty("--cc-text-h", `${h}px`);
          }
        } else {
          lastTextEl.current = null;
        }
      }
      if (next !== stateRef.current) setState(next);

      // Resolve the active palette from the nearest themed ancestor. Case-study
      // roots set [data-cursor-theme]; outside one this returns null and the
      // cursor falls back to the site accent.
      const t = e.target as Element | null;
      const themed = t?.closest?.("[data-cursor-theme]") ?? null;
      const nextTheme = themed?.getAttribute("data-cursor-theme") || null;
      if (nextTheme !== themeRef.current) setTheme(nextTheme);
    };

    // Trailing ring: lerp toward the pointer every frame.
    let raf = 0;
    const tick = () => {
      ring.x += (target.x - ring.x) * ease;
      ring.y += (target.y - ring.y) * ease;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onLeave = () => setState("hidden");
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cc-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
    };
  }, []);

  if (!enabled) return null;

  const content = (() => {
    switch (state) {
      case "widget":
        return (
          <>
            <CursorClick size={ICON_SIZE} weight="fill" />
            <span>Inspect</span>
            <span className="cc-sep" />
            <HandGrabbing size={ICON_SIZE} weight="fill" />
            <span>Pick up</span>
          </>
        );
      case "widget-drag":
        return (
          <>
            <HandGrabbing size={ICON_SIZE} weight="fill" />
            <span>Pick up</span>
          </>
        );
      case "link":
        return (
          <>
            <ArrowUpRight size={ICON_SIZE} weight="bold" />
            <span>Open</span>
          </>
        );
      case "drawer-handle":
        return (
          <>
            <CaretLeft size={ICON_SIZE} weight="bold" />
            <span>Widgets</span>
          </>
        );
      case "drawer-item":
        return (
          <>
            <HandGrabbing size={ICON_SIZE} weight="fill" />
            <span>Drag to grid</span>
          </>
        );
      case "trash":
        return (
          <>
            <Trash size={ICON_SIZE} weight="fill" />
            <span>Discard</span>
          </>
        );
      case "view":
        return (
          <>
            <Eye size={ICON_SIZE} weight="fill" />
            <span>View</span>
          </>
        );
      case "play":
        return (
          <>
            <Play size={ICON_SIZE} weight="fill" />
            <span>Play</span>
          </>
        );
      case "compare":
        return (
          <>
            <ArrowsLeftRight size={ICON_SIZE} weight="bold" />
            <span>Drag</span>
          </>
        );
      case "copy":
        return (
          <>
            <Copy size={ICON_SIZE} weight="fill" />
            <span>Copy</span>
          </>
        );
      case "download":
        return (
          <>
            <DownloadSimple size={ICON_SIZE} weight="bold" />
            <span>Download</span>
          </>
        );
      case "reset":
        return (
          <>
            <ArrowCounterClockwise size={ICON_SIZE} weight="bold" />
            <span>Reset widgets</span>
          </>
        );
      // Icon-only rings — no label, glyph centered (styled like `button`).
      case "prev":
        return <CaretLeft size={ICON_SIZE + 2} weight="bold" />;
      case "next":
        return <CaretRight size={ICON_SIZE + 2} weight="bold" />;
      case "close":
        return <X size={ICON_SIZE + 2} weight="bold" />;
      default:
        return null;
    }
  })();

  // Portal to <body> so the cursor lives in the root stacking context. If it
  // renders inside the page tree, an ancestor with its own z-index (the
  // .relative.z-10 wrapper) traps cc-layer's z-9999 inside that context, and
  // body-level overlays — the detail backdrop (z-60) and filter sidebar
  // (z-80) — paint *over* the cursor, hiding it whenever a detail view is open.
  return createPortal(
    <div
      ref={layerRef}
      className="cc-layer"
      data-state={state}
      data-theme={theme || undefined}
      data-pressed={pressed || undefined}
      aria-hidden="true"
    >
      {/* Trailing ring — lagged position, morphs into pills over targets.
          key remounts it on state change so the pop animation replays. */}
      <div ref={ringRef} className="cc-pos">
        <div key={state} className="cc-ring">
          {content}
        </div>
      </div>
      {/* Precise dot — always at the true pointer position. */}
      <div ref={dotRef} className="cc-pos">
        <div className="cc-dot" />
      </div>
    </div>,
    document.body
  );
}
