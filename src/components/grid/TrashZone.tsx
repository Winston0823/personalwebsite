"use client";

import { useDroppable } from "@dnd-kit/core";
import { useRef, useEffect } from "react";
import anime from "animejs";

export const TRASH_ZONE_ID = "trash-zone";

interface TrashZoneProps {
  isDragging: boolean;
  isOver: boolean;
  isConsuming: boolean;
}

export default function TrashZone({ isDragging, isOver, isConsuming }: TrashZoneProps) {
  const { setNodeRef } = useDroppable({ id: TRASH_ZONE_ID });
  const zoneRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  // Merge refs
  const mergedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (zoneRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  // Consume ripple animation
  useEffect(() => {
    if (!isConsuming || !rippleRef.current) return;

    anime({
      targets: rippleRef.current,
      scale: [0.5, 2.5],
      opacity: [0.6, 0],
      duration: 800,
      easing: "easeOutExpo",
    });
  }, [isConsuming]);

  // Awake pulse animation
  useEffect(() => {
    if (!zoneRef.current) return;
    if (isOver && !isConsuming) {
      anime({
        targets: zoneRef.current,
        scale: [1, 1.02, 1],
        duration: 1200,
        easing: "easeInOutSine",
        loop: true,
      });
    } else {
      anime.remove(zoneRef.current);
      if (zoneRef.current) {
        zoneRef.current.style.transform = "";
      }
    }
  }, [isOver, isConsuming]);

  return (
    <div
      className="absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center pointer-events-auto"
      style={{
        // Position over bottom-center 2 grid columns
        width: `${(2 / 16) * 100}%`,
        // Dormant: 1/3 of one row height. Awake: full row height
        height: isOver ? `${(1 / 8) * 100}%` : `${(1 / 8 / 3) * 100}%`,
        zIndex: 45,
        opacity: isDragging ? 1 : 0,
        pointerEvents: isDragging ? "auto" : "none",
        transition: "height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
      }}
    >
      {/* SVG gooey filter definition */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="goo-consume">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* The droppable zone */}
      <div
        ref={mergedRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{
          borderRadius: isOver ? "16px 16px 0 0" : "12px 12px 0 0",
          background: isOver
            ? "rgba(255, 59, 48, 0.25)"
            : "rgba(255, 59, 48, 0.12)",
          backdropFilter: "blur(12px)",
          // Split into individual sides so React doesn't warn about mixing
          // `border` (shorthand) with `borderBottom: none`.
          borderTopWidth: "1px",
          borderLeftWidth: "1px",
          borderRightWidth: "1px",
          borderBottomWidth: "0",
          borderStyle: "solid",
          borderColor: isOver ? "rgba(255, 59, 48, 0.4)" : "rgba(255, 59, 48, 0.2)",
          boxShadow: isOver
            ? "0 -8px 32px rgba(255, 59, 48, 0.2), inset 0 0 24px rgba(255, 59, 48, 0.1)"
            : "0 -4px 16px rgba(255, 59, 48, 0.08)",
          transition: "background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease, border-radius 0.3s ease",
          filter: isConsuming ? "url(#goo-consume)" : undefined,
        }}
      >
        {/* Ripple element for consume animation */}
        <div
          ref={rippleRef}
          className="absolute rounded-full"
          style={{
            width: "60px",
            height: "60px",
            background: "rgba(255, 59, 48, 0.3)",
            opacity: 0,
            pointerEvents: "none",
          }}
        />

        {/* X icon */}
        <svg
          width={isOver ? "24" : "16"}
          height={isOver ? "24" : "16"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 59, 48, 0.8)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "all 0.3s ease",
            opacity: isOver ? 1 : 0.6,
          }}
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>

        {/* "Remove" label — only when awake */}
        {isOver && (
          <span
            className="ml-2 text-xs font-medium tracking-wider uppercase"
            style={{
              color: "rgba(255, 59, 48, 0.9)",
              animation: "fadeIn 0.2s ease",
            }}
          >
            Remove
          </span>
        )}
      </div>
    </div>
  );
}
