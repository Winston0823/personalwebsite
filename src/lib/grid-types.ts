export type WidgetType =
  | "name"
  | "about"
  | "projects"
  | "links"
  | "nowPlaying"
  | "resume"
  | "contact"
  | "gallery";

export interface GridPosition {
  col: number;
  row: number;
}

export interface WidgetSize {
  cols: number;
  rows: number;
}

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  position: GridPosition;
  size: WidgetSize;
}

export interface GridState {
  widgets: WidgetInstance[];
  isDragging: boolean;
}

export type GridAction =
  | { type: "MOVE_WIDGET"; id: string; position: GridPosition }
  | { type: "ADD_WIDGET"; widget: WidgetInstance }
  | { type: "REMOVE_WIDGET"; id: string }
  | { type: "SET_DRAGGING"; isDragging: boolean };

export const GRID_COLS = 16;
export const GRID_ROWS = 8;
