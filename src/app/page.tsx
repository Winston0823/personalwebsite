"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { WidgetInstance } from "@/lib/grid-types";
import DetailOverlay from "@/components/detail/DetailOverlay";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import PortfolioGrid from "@/components/grid/PortfolioGrid";
import MobileLayout from "@/components/grid/MobileLayout";
import DrawerHandle from "@/components/drawer/DrawerHandle";
import WidgetDrawer from "@/components/drawer/WidgetDrawer";
import FirstLoadReveal from "@/components/onboarding/FirstLoadReveal";
import { TRASH_ZONE_ID } from "@/components/grid/TrashZone";
import { useGridState } from "@/hooks/useGridState";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { GRID_COLS, WidgetType } from "@/lib/grid-types";
import { widgetRegistry } from "@/lib/widget-registry";
import { widgetComponents } from "@/lib/widget-components";
import anime from "animejs";

const restrictToWindow: Modifier = ({ transform, activeNodeRect, windowRect }) => {
  if (!activeNodeRect || !windowRect) return transform;
  return {
    ...transform,
    x: Math.max(windowRect.left - activeNodeRect.left, Math.min(windowRect.right - activeNodeRect.right, transform.x)),
    y: Math.max(windowRect.top - activeNodeRect.top, Math.min(windowRect.bottom - activeNodeRect.bottom, transform.y)),
  };
};

export default function Home() {
  const { state, dispatch, findNearestOpenPosition } = useGridState();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);
  const [activeDragType, setActiveDragType] = useState<WidgetType | null>(null);
  const [expandedWidget, setExpandedWidget] = useState<WidgetInstance | null>(null);
  const [expandOriginRect, setExpandOriginRect] = useState<DOMRect | null>(null);
  const breakpoint = useBreakpoint();
  const gridRef = useRef<HTMLDivElement>(null);

  const handleExpand = useCallback((widget: WidgetInstance, rect: DOMRect) => {
    setExpandedWidget(widget);
    setExpandOriginRect(rect);
  }, []);

  const handleCollapse = useCallback(() => {
    setExpandedWidget(null);
    setExpandOriginRect(null);
  }, []);

  const sensor = useSensor(PointerSensor, { activationConstraint: { distance: 8 } });
  const sensors = useSensors(sensor);
  const modifiers = useMemo(() => [restrictToWindow], []);

  const getCellSize = useCallback(() => {
    if (!gridRef.current) return 0;
    return gridRef.current.offsetWidth / GRID_COLS;
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const id = String(event.active.id);
    if (id.startsWith("drawer-")) {
      const type = id.replace("drawer-", "") as WidgetType;
      setActiveDragType(type);
      setDrawerOpen(false);
    } else {
      setActiveDragType(null);
    }
    dispatch({ type: "SET_DRAGGING", isDragging: true });
  }

  function handleDragOver(event: DragOverEvent) {
    setIsOverTrash(event.over?.id === TRASH_ZONE_ID);
  }

  function handleDragEnd(event: DragEndEvent) {
    const wasOverTrash = event.over?.id === TRASH_ZONE_ID;
    setIsOverTrash(false);
    setActiveDragType(null);
    dispatch({ type: "SET_DRAGGING", isDragging: false });

    const { active, delta } = event;
    const id = String(active.id);
    const cellSize = getCellSize();
    if (!cellSize) return;

    // Drawer-to-grid drop
    if (id.startsWith("drawer-")) {
      const type = id.replace("drawer-", "") as keyof typeof widgetRegistry;
      const meta = widgetRegistry[type];
      if (!meta || !gridRef.current) return;

      // Calculate grid position from the drop point
      const gridRect = gridRef.current.getBoundingClientRect();
      const activeRect = active.rect.current.translated;
      if (!activeRect) return;

      const dropCenterX = activeRect.left + activeRect.width / 2;
      const dropCenterY = activeRect.top + activeRect.height / 2;

      const col = Math.round((dropCenterX - gridRect.left) / cellSize - meta.defaultSize.cols / 2);
      const row = Math.round((dropCenterY - gridRect.top) / cellSize - meta.defaultSize.rows / 2);

      dispatch({
        type: "ADD_WIDGET",
        widget: {
          id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type,
          position: { col: Math.max(0, col), row: Math.max(0, row) },
          size: meta.defaultSize,
        },
      });
      return;
    }

    // Trash zone drop
    if (wasOverTrash) {
      const widgetEl = document.querySelector(`[data-widget-id="${id}"]`) as HTMLElement | null;
      if (widgetEl) {
        setIsConsuming(true);
        const clipStages = [
          "polygon(0% 0%, 12% 0%, 25% 0%, 37% 0%, 50% 0%, 62% 0%, 75% 0%, 87% 0%, 100% 0%, 100% 100%, 0% 100%)",
          "polygon(0% 35%, 12% 30%, 25% 40%, 37% 33%, 50% 38%, 62% 31%, 75% 42%, 87% 34%, 100% 35%, 100% 100%, 0% 100%)",
          "polygon(0% 70%, 12% 64%, 25% 75%, 37% 68%, 50% 73%, 62% 65%, 75% 76%, 87% 69%, 100% 70%, 100% 100%, 0% 100%)",
          "polygon(0% 100%, 12% 100%, 25% 100%, 37% 100%, 50% 100%, 62% 100%, 75% 100%, 87% 100%, 100% 100%, 100% 100%, 0% 100%)",
        ];
        anime({
          targets: widgetEl,
          translateY: [0, 30],
          duration: 180,
          easing: "easeInQuad",
          complete: () => {
            anime({
              targets: widgetEl,
              clipPath: clipStages,
              scaleY: [1, 0.6],
              scaleX: [1, 1.12],
              opacity: [1, 0],
              filter: ["blur(0px)", "blur(6px)"],
              duration: 450,
              easing: "easeInCubic",
              complete: () => {
                widgetEl.style.clipPath = "";
                widgetEl.style.filter = "";
                dispatch({ type: "REMOVE_WIDGET", id });
                setIsConsuming(false);
              },
            });
          },
        });
      } else {
        dispatch({ type: "REMOVE_WIDGET", id });
      }
      return;
    }

    // Normal grid move
    const colDelta = Math.round(delta.x / cellSize);
    const rowDelta = Math.round(delta.y / cellSize);
    if (colDelta === 0 && rowDelta === 0) return;

    const widget = state.widgets.find((w) => w.id === id);
    if (!widget) return;

    const desired = {
      col: widget.position.col + colDelta,
      row: widget.position.row + rowDelta,
    };

    // If the drop lands on another widget (or off-grid), settle into the
    // nearest open slot instead of snapping back to the original position.
    const target =
      findNearestOpenPosition(desired, widget.size, widget.id) ?? desired;

    dispatch({
      type: "MOVE_WIDGET",
      id: widget.id,
      position: target,
    });
  }

  if (breakpoint === "mobile") {
    return (
      <main>
        <MobileLayout />
      </main>
    );
  }

  return (
    <DndContext
      id="portfolio-grid"
      sensors={sensors}
      modifiers={modifiers}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <main className="h-screen w-screen flex items-center justify-center">
        <PortfolioGrid
          gridRef={gridRef}
          state={state}
          dispatch={dispatch}
          isOverTrash={isOverTrash}
          isConsuming={isConsuming}
          onExpand={handleExpand}
          expandedWidgetId={expandedWidget?.id}
        />
        <DrawerHandle isOpen={drawerOpen} onClick={() => setDrawerOpen((prev) => !prev)} />
        {drawerOpen && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <WidgetDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        {expandedWidget && expandOriginRect && (
          <DetailOverlay
            widget={expandedWidget}
            originRect={expandOriginRect}
            onClose={handleCollapse}
          />
        )}
        <FirstLoadReveal />
      </main>

      {/* Drag overlay for drawer-to-grid dragging */}
      <DragOverlay dropAnimation={null}>
        {activeDragType ? (() => {
          const meta = widgetRegistry[activeDragType];
          const Component = widgetComponents[activeDragType];
          const cellSize = getCellSize();
          const fullWidth = meta.defaultSize.cols * cellSize;
          const fullHeight = meta.defaultSize.rows * cellSize;
          return (
            <div
              className="glass p-3 pointer-events-none"
              style={{
                width: `${fullWidth}px`,
                height: `${fullHeight}px`,
                transform: "scale(1)",
                transformOrigin: "center center",
                opacity: 0.85,
                animation: "overlay-scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <div className="relative z-10 overflow-hidden w-full h-full">
                <Component />
              </div>
            </div>
          );
        })() : null}
      </DragOverlay>
    </DndContext>
  );
}
