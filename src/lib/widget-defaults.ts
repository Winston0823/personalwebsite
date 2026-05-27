import { WidgetInstance } from "./grid-types";

export const defaultWidgets: WidgetInstance[] = [
  { id: "name-1", type: "name", position: { col: 0, row: 0 }, size: { cols: 5, rows: 2 } },
  { id: "nowPlaying-1", type: "nowPlaying", position: { col: 12, row: 0 }, size: { cols: 4, rows: 1 } },
  { id: "about-1", type: "about", position: { col: 0, row: 2 }, size: { cols: 3, rows: 2 } },
  { id: "resume-1", type: "resume", position: { col: 7, row: 2 }, size: { cols: 3, rows: 3 } },
  { id: "gallery-1", type: "gallery", position: { col: 10, row: 2 }, size: { cols: 3, rows: 2 } },
  { id: "contact-1", type: "contact", position: { col: 10, row: 4 }, size: { cols: 3, rows: 2 } },
  { id: "projects-1", type: "projects", position: { col: 0, row: 4 }, size: { cols: 4, rows: 3 } },
  { id: "links-1", type: "links", position: { col: 13, row: 7 }, size: { cols: 3, rows: 1 } },
];
