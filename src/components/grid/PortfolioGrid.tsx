"use client";

import { GRID_COLS, GRID_ROWS, GridAction, GridState } from "@/lib/grid-types";
import GridOverlay from "./GridOverlay";
import TrashZone from "./TrashZone";
import WidgetShell from "../widgets/WidgetShell";
import { widgetComponents } from "@/lib/widget-components";
import { Dispatch, RefObject, useRef } from "react";
import { WidgetInstance } from "@/lib/grid-types";

interface PortfolioGridProps {
  gridRef: RefObject<HTMLDivElement | null>;
  state: GridState;
  dispatch: Dispatch<GridAction>;
  isOverTrash: boolean;
  isConsuming: boolean;
  onExpand?: (widget: WidgetInstance, rect: DOMRect) => void;
  expandedWidgetId?: string | null;
}

export default function PortfolioGrid({
  gridRef,
  state,
  dispatch,
  isOverTrash,
  isConsuming,
  onExpand,
  expandedWidgetId,
}: PortfolioGridProps) {
  // Track initial widget IDs — only those get entrance animations
  const initialIds = useRef<Set<string> | null>(null);
  if (initialIds.current === null) {
    initialIds.current = new Set(state.widgets.map((w) => w.id));
  }

  return (
    <div
      ref={gridRef}
      className="relative w-full mx-auto"
      style={{
        aspectRatio: `${GRID_COLS} / ${GRID_ROWS}`,
        maxHeight: "100vh",
        padding: "var(--grid-padding)",
      }}
    >
      <div
        className={`relative w-full h-full grid-dimmed ${expandedWidgetId ? "active" : ""}`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          gap: "var(--grid-gap)",
        }}
      >
        <GridOverlay visible={state.isDragging} />
        {state.widgets.map((widget, i) => {
          const Component = widgetComponents[widget.type];
          return (
            <WidgetShell
              key={widget.id}
              widget={widget}
              index={i}
              skipEntrance={!initialIds.current!.has(widget.id)}
              onExpand={onExpand}
              isOverTrash={isOverTrash}
            >
              <Component />
            </WidgetShell>
          );
        })}
      </div>

      <TrashZone
        isDragging={state.isDragging}
        isOver={isOverTrash}
        isConsuming={isConsuming}
      />
    </div>
  );
}
