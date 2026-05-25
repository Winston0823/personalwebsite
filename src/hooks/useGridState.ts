"use client";

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import {
  GridState,
  GridAction,
  WidgetInstance,
  GridPosition,
  WidgetSize,
  GRID_COLS,
  GRID_ROWS,
} from "@/lib/grid-types";
import { defaultWidgets } from "@/lib/widget-defaults";

const STORAGE_KEY = "portfolio-grid-state";

function isInBounds(position: GridPosition, size: WidgetSize): boolean {
  return (
    position.col >= 0 &&
    position.row >= 0 &&
    position.col + size.cols <= GRID_COLS &&
    position.row + size.rows <= GRID_ROWS
  );
}

function isOverlapping(
  widgets: WidgetInstance[],
  candidate: WidgetInstance
): boolean {
  return widgets.some((w) => {
    if (w.id === candidate.id) return false;
    const noOverlap =
      candidate.position.col >= w.position.col + w.size.cols ||
      w.position.col >= candidate.position.col + candidate.size.cols ||
      candidate.position.row >= w.position.row + w.size.rows ||
      w.position.row >= candidate.position.row + candidate.size.rows;
    return !noOverlap;
  });
}

function gridReducer(state: GridState, action: GridAction): GridState {
  switch (action.type) {
    case "MOVE_WIDGET": {
      const widget = state.widgets.find((w) => w.id === action.id);
      if (!widget) return state;
      const moved: WidgetInstance = {
        ...widget,
        position: action.position,
      };
      if (!isInBounds(moved.position, moved.size)) return state;
      if (isOverlapping(state.widgets, moved)) return state;
      return {
        ...state,
        widgets: state.widgets.map((w) => (w.id === action.id ? moved : w)),
      };
    }
    case "ADD_WIDGET": {
      if (!isInBounds(action.widget.position, action.widget.size)) return state;
      if (isOverlapping(state.widgets, action.widget)) return state;
      return { ...state, widgets: [...state.widgets, action.widget] };
    }
    case "REMOVE_WIDGET":
      return {
        ...state,
        widgets: state.widgets.filter((w) => w.id !== action.id),
      };
    case "SET_DRAGGING":
      return { ...state, isDragging: action.isDragging };
    default:
      return state;
  }
}

// Always initialize with defaults — load localStorage in useEffect to avoid hydration mismatch
const initialState: GridState = { widgets: defaultWidgets, isDragging: false };

export function useGridState() {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const [hydrated, setHydrated] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage after hydration
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WidgetInstance[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Replace all widgets with stored ones
          for (const w of initialState.widgets) {
            dispatch({ type: "REMOVE_WIDGET", id: w.id });
          }
          for (const w of parsed) {
            dispatch({ type: "ADD_WIDGET", widget: w });
          }
        }
      }
    } catch {
      // Use defaults
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage (debounced), only after hydration
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.widgets));
      } catch {
        // Storage full or unavailable
      }
    }, 500);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state.widgets, hydrated]);

  const findOpenPosition = useCallback(
    (size: WidgetSize): GridPosition | null => {
      for (let row = 0; row <= GRID_ROWS - size.rows; row++) {
        for (let col = 0; col <= GRID_COLS - size.cols; col++) {
          const candidate: WidgetInstance = {
            id: "__test__",
            type: "name",
            position: { col, row },
            size,
          };
          if (!isOverlapping(state.widgets, candidate)) {
            return { col, row };
          }
        }
      }
      return null;
    },
    [state.widgets]
  );

  return { state, dispatch, findOpenPosition };
}
