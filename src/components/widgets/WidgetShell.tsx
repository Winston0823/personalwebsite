"use client";

import { useDraggable } from "@dnd-kit/core";
import { WidgetInstance } from "@/lib/grid-types";
import { ReactNode, useRef, useEffect, useState } from "react";
import anime from "animejs";

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
    if (skipEntrance || !shellRef.current) return;
    const el = shellRef.current;

    el.style.opacity = "0";
    el.style.transform = "translateY(20px) scale(0.95)";

    const animation = anime({
      targets: el,
      opacity: [0, 1],
      translateY: [20, 0],
      scale: [0.95, 1],
      duration: 600,
      delay: index * 80 + 100,
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
        ? "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, filter 0.3s ease"
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
          transition: isDragging ? "none" : "transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
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
