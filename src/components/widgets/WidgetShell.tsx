"use client";

import { useDraggable } from "@dnd-kit/core";
import { WidgetInstance } from "@/lib/grid-types";
import { ReactNode, useRef, useEffect, useState } from "react";
import anime from "animejs";
import { DUR, EASE, STAGGER } from "@/lib/motion";
import { takeDrop } from "@/lib/flip-drops";

interface WidgetShellProps {
  widget: WidgetInstance;
  children: ReactNode;
  index?: number;
  skipEntrance?: boolean;
  onExpand?: (widget: WidgetInstance, rect: DOMRect) => void;
  /** True when the drag is hovering the trash zone. Only meaningful for the
   *  widget that's currently being dragged. */
  isOverTrash?: boolean;
}

const NON_EXPANDABLE: Set<string> = new Set(["links"]);

export default function WidgetShell({
  widget,
  children,
  index = 0,
  skipEntrance = false,
  onExpand,
  isOverTrash = false,
}: WidgetShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [hasEntered, setHasEntered] = useState(skipEntrance);
  // Cached drop-origin rect for the FLIP entrance. `undefined` = not yet
  // checked; once checked it holds the rect (or null). Caching in a ref so the
  // one-shot takeDrop() isn't lost to React StrictMode's double effect invoke —
  // the first invoke consumes the rect, the second re-runs the FLIP from cache.
  const flipFrom = useRef<{ left: number; top: number; width: number; height: number } | null | undefined>(undefined);
  const wasDragging = useRef(false);
  const [justDropped, setJustDropped] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: widget.id });

  // Suppress transition for one frame after drop to prevent slide-back
  useEffect(() => {
    if (isDragging) {
      wasDragging.current = true;
    } else if (wasDragging.current) {
      wasDragging.current = false;
      setJustDropped(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setJustDropped(false));
      });
    }
  }, [isDragging]);

  // Entrance animation — only on initial page load
  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    // Spatial continuity: a widget just dropped from the drawer FLIPs from the
    // drop point into its settled cell, instead of popping in. Takes priority
    // over (and replaces) the skip-entrance no-op for added widgets.
    //
    // Consume the one-shot drop rect exactly once, then cache it — so the FLIP
    // still runs on StrictMode's second effect invoke (where takeDrop would
    // otherwise return undefined and leave the widget frozen mid-shrink).
    if (flipFrom.current === undefined) {
      flipFrom.current = takeDrop(widget.id) ?? null;
    }
    const dropFrom = flipFrom.current;
    if (dropFrom) {
      const cell = el.getBoundingClientRect();
      if (cell.width && cell.height) {
        const tx = dropFrom.left - cell.left;
        const ty = dropFrom.top - cell.top;
        const sx = dropFrom.width / cell.width;
        const sy = dropFrom.height / cell.height;
        setHasEntered(true); // let anime's transform own the element (no wrapper transform)
        const animation = anime({
          targets: el,
          translateX: [tx, 0],
          translateY: [ty, 0],
          scaleX: [sx, 1],
          scaleY: [sy, 1],
          opacity: [0.4, 1],
          duration: DUR.slow,
          easing: EASE.pop.anime,
          // Hand the element back to React: clear the inline transform/opacity
          // so a paused or completed FLIP never leaves it stuck scaled/faded.
          complete: () => {
            el.style.transform = "";
            el.style.opacity = "";
          },
        });
        return () => {
          animation.pause();
          el.style.transform = "";
          el.style.opacity = "";
        };
      }
    }

    if (skipEntrance) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(20px) scale(0.95)";

    const animation = anime({
      targets: el,
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.95, 1],
      duration: DUR.slow,
      delay: index * STAGGER.widget + 100,
      easing: "easeOutExpo",
      complete: () => setHasEntered(true),
    });

    return () => animation.pause();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Merge refs
  const mergedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (shellRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const isExpandable = !NON_EXPANDABLE.has(widget.type) && !!onExpand;
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    pointerStart.current = { x: e.clientX, y: e.clientY };
    // Let dnd-kit's listener fire too
    listeners?.onPointerDown?.(e as unknown as React.PointerEvent<Element>);
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!isExpandable || isDragging) return;
    const start = pointerStart.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // Only fire if pointer barely moved (not a drag)
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) {
      const el = shellRef.current;
      if (el) onExpand(widget, el.getBoundingClientRect());
    }
    pointerStart.current = null;
  }

  const wrapperStyle: React.CSSProperties = {
    gridColumn: `${widget.position.col + 1} / span ${widget.size.cols}`,
    gridRow: `${widget.position.row + 1} / span ${widget.size.rows}`,
    transform: hasEntered && transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : hasEntered ? undefined : "translateY(20px) scale(0.95)",
    opacity: hasEntered ? undefined : 0,
    zIndex: isDragging ? 50 : 1,
    // No cursor property here — the custom cursor handles grab/grabbing
    // states, and competing declarations make the native cursor flash in
    // Chrome. Non-cc fallback lives in globals.css.
    touchAction: "none",
    transition: isDragging || justDropped
      ? "box-shadow 0.2s ease"
      : hasEntered
        ? "transform 0.4s var(--ease-pop), box-shadow 0.3s ease, filter 0.3s ease"
        : "none",
  };

  // Subtle cursor-aware tilt on the glass shell — ambient "life" signal
  // that doesn't compete with content. Suppressed during drag so it
  // doesn't fight the drag transform.
  //
  // The transform write is deferred to rAF rather than run inside the
  // mousemove handler. Mutating the element directly under the pointer
  // *during* the move event makes Chromium recompute the cursor mid-event
  // and flash the native arrow over the custom cursor; applying it on the
  // next frame (no associated pointer event) keeps the cursor stable.
  const tiltRaf = useRef<number | null>(null);
  function handleGlassMove(e: React.MouseEvent<HTMLDivElement>) {
    if (isDragging) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    const MAX_TILT = 3;
    const SCALE = 1.012;
    if (tiltRaf.current !== null) cancelAnimationFrame(tiltRaf.current);
    tiltRaf.current = requestAnimationFrame(() => {
      tiltRaf.current = null;
      el.style.transform = `perspective(900px) rotateX(${ny * -MAX_TILT * 2}deg) rotateY(${nx * MAX_TILT * 2}deg) scale(${SCALE})`;
    });
  }
  function handleGlassLeave(e: React.MouseEvent<HTMLDivElement>) {
    if (tiltRaf.current !== null) {
      cancelAnimationFrame(tiltRaf.current);
      tiltRaf.current = null;
    }
    e.currentTarget.style.transform = "";
  }

  return (
    <div
      ref={mergedRef}
      data-widget-id={widget.id}
      data-cursor={isExpandable ? "widget" : "widget-drag"}
      {...attributes}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      style={wrapperStyle}
    >
      <div
        className={`glass w-full h-full ${isDragging ? "widget-dragging" : "glass-hover"}${
          isDragging && isOverTrash ? " is-discarding" : ""
        }`}
        onMouseMove={handleGlassMove}
        onMouseLeave={handleGlassLeave}
        style={{
          padding: "clamp(8px, 1vw, 16px)",
          transition: isDragging ? "none" : "transform 0.18s var(--ease-pop)",
          willChange: "transform",
          ...(isDragging ? { animation: "widget-jiggle 0.25s ease-in-out infinite" } : {}),
        }}
      >
        <div className="relative z-10 overflow-hidden w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
