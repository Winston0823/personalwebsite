"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
 * Learn-then-quiet: "Inspect" / "Pick up" labels show until the visitor has
 * performed each action LEARN_THRESHOLD times (tracked in localStorage via
 * `cursor-action` CustomEvents), then the pill decays to icons only.
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
  | "hidden";

const LEARN_KEY = "winston-cursor-learned-v1";
const LEARN_THRESHOLD = 3;
/** Per-frame lerp factor for the trailing ring (~60fps). */
const RING_EASE = 0.18;

type Learned = { inspect: number; pickup: number };

function readLearned(): Learned {
  try {
    const raw = localStorage.getItem(LEARN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { inspect: parsed.inspect ?? 0, pickup: parsed.pickup ?? 0 };
    }
  } catch {
    /* private mode etc. — labels just stay on */
  }
  return { inspect: 0, pickup: 0 };
}

const ICON_SIZE = 12;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [state, setState] = useState<CursorState>("hidden");
  const [pressed, setPressed] = useState(false);
  const [learned, setLearned] = useState<Learned>({ inspect: 0, pickup: 0 });
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

    setEnabled(true);
    setLearned(readLearned());
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

    // Inspect / pickup completions, dispatched from page.tsx.
    const onAction = (e: Event) => {
      const kind = (e as CustomEvent<keyof Learned>).detail;
      if (kind !== "inspect" && kind !== "pickup") return;
      setLearned((prev) => {
        const next = { ...prev, [kind]: prev[kind] + 1 };
        try {
          localStorage.setItem(LEARN_KEY, JSON.stringify(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("cursor-action", onAction);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("cc-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("cursor-action", onAction);
    };
  }, []);

  if (!enabled) return null;

  const inspectLearned = learned.inspect >= LEARN_THRESHOLD;
  const pickupLearned = learned.pickup >= LEARN_THRESHOLD;

  const content = (() => {
    switch (state) {
      case "widget":
        return (
          <>
            <CursorClick size={ICON_SIZE} weight="fill" />
            {!inspectLearned && <span>Inspect</span>}
            <span className="cc-sep" />
            <HandGrabbing size={ICON_SIZE} weight="fill" />
            {!pickupLearned && <span>Pick up</span>}
          </>
        );
      case "widget-drag":
        return (
          <>
            <HandGrabbing size={ICON_SIZE} weight="fill" />
            {!pickupLearned && <span>Pick up</span>}
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
