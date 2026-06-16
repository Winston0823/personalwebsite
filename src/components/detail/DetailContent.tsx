"use client";

import { WidgetType } from "@/lib/grid-types";
import NameDetail from "./details/NameDetail";
import AboutDetail from "./details/AboutDetail";
import ProjectsDetail from "./details/ProjectsDetail";
import ResumeDetail from "./details/ResumeDetail";
import GalleryDetail from "./details/GalleryDetail";
import ContactDetail from "./details/ContactDetail";
import NowPlayingDetail from "./details/NowPlayingDetail";
import HikingDetail from "./details/HikingDetail";

interface DetailContentProps {
  widgetType: WidgetType;
  /* Optional deep-link target — used by mobile project cards to open a
     specific project's case study directly. */
  initialProjectId?: string;
}

const detailMap: Partial<Record<WidgetType, React.ComponentType>> = {
  name: NameDetail,
  about: AboutDetail,
  projects: ProjectsDetail,
  resume: ResumeDetail,
  gallery: GalleryDetail,
  contact: ContactDetail,
  nowPlaying: NowPlayingDetail,
  hiking: HikingDetail,
};

export default function DetailContent({ widgetType, initialProjectId }: DetailContentProps) {
  if (widgetType === "projects") {
    return <ProjectsDetail initialProjectId={initialProjectId} />;
  }

  const Component = detailMap[widgetType];

  if (!Component) return null;

  return <Component />;
}
