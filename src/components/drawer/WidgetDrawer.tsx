"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { useDraggable } from "@dnd-kit/core";
import { WidgetType } from "@/lib/grid-types";
import { widgetRegistry } from "@/lib/widget-registry";
import { widgetComponents } from "@/lib/widget-components";
import React, { useState, useCallback } from "react";

interface WidgetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_COLS = 5;
const UNIT = 100; // Reference px per grid cell

function DrawerWidgetPreview({ type }: { type: WidgetType }) {
  const meta = widgetRegistry[type];
  const Component = widgetComponents[type];
  const { cols, rows } = meta.defaultSize;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drawer-${type}`,
    data: { type, fromDrawer: true },
  });

  const widthPercent = Math.max((cols / MAX_COLS) * 100, 45);
  const aspectRatio = cols / rows;

  // Reference size the widget renders at (before scaling)
  const refWidth = cols * UNIT;
  const refHeight = rows * UNIT;

  // Measure actual container width and compute scale
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    setNodeRef(node);
    containerRef.current = node;
    if (node) {
      const observer = new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        setScale(w / refWidth);
      });
      observer.observe(node);
    }
  }, [setNodeRef, refWidth]);

  return (
    <div
      ref={measureRef}
      {...listeners}
      {...attributes}
      className="glass rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
      style={{
        flexBasis: `calc(${widthPercent}% - 4px)`,
        aspectRatio: `${aspectRatio}`,
        opacity: isDragging ? 0.4 : 1,
        touchAction: "none",
        position: "relative",
      }}
    >
      <div
        className="origin-top-left pointer-events-none absolute top-0 left-0"
        style={{
          width: `${refWidth}px`,
          height: `${refHeight}px`,
          transform: `scale(${scale})`,
          padding: "12px",
        }}
      >
        <div className="w-full h-full overflow-hidden">
          <Component />
        </div>
      </div>
    </div>
  );
}

const widgetTypes = Object.keys(widgetRegistry) as WidgetType[];

export default function WidgetDrawer({ isOpen, onClose }: WidgetDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerRef.current) return;
    anime.remove(drawerRef.current);
    const width = drawerRef.current.offsetWidth;
    anime({
      targets: drawerRef.current,
      translateX: isOpen ? 0 : width,
      easing: isOpen ? "spring(1, 80, 12, 0)" : "easeInOutQuart",
      duration: isOpen ? undefined : 350,
    });
  }, [isOpen]);

  return (
    <div
      ref={drawerRef}
      className="fixed top-0 right-0 h-full z-30 glass-plain p-4 flex flex-col"
      style={{ width: "clamp(260px, 28vw, 320px)", transform: "translateX(100%)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-text-primary" style={{ fontSize: "var(--text-subheading)" }}>
          Widgets
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full ghost-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-2 flex-1 overflow-y-auto content-start">
        {widgetTypes.map((type) => (
          <DrawerWidgetPreview key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
