import { WidgetSize, WidgetType } from "./grid-types";

export interface WidgetMeta {
  label: string;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
}

export const widgetRegistry: Record<WidgetType, WidgetMeta> = {
  name: { label: "Name", defaultSize: { cols: 5, rows: 2 }, minSize: { cols: 3, rows: 2 }, maxSize: { cols: 8, rows: 3 } },
  about: { label: "Skills", defaultSize: { cols: 3, rows: 2 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 5, rows: 3 } },
  projects: { label: "Projects", defaultSize: { cols: 4, rows: 3 }, minSize: { cols: 3, rows: 2 }, maxSize: { cols: 6, rows: 4 } },
  links: { label: "Links", defaultSize: { cols: 2, rows: 1 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 4, rows: 1 } },
  nowPlaying: { label: "Now Playing", defaultSize: { cols: 4, rows: 1 }, minSize: { cols: 3, rows: 1 }, maxSize: { cols: 5, rows: 2 } },
  resume: { label: "Experience", defaultSize: { cols: 3, rows: 3 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 4, rows: 5 } },
  contact: { label: "Contact", defaultSize: { cols: 3, rows: 2 }, minSize: { cols: 2, rows: 1 }, maxSize: { cols: 3, rows: 3 } },
  gallery: { label: "Gallery", defaultSize: { cols: 3, rows: 2 }, minSize: { cols: 2, rows: 2 }, maxSize: { cols: 5, rows: 4 } },
};
