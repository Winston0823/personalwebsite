"use client";

import { WidgetType } from "@/lib/grid-types";
import NameDetail from "./details/NameDetail";
import AboutDetail from "./details/AboutDetail";
import ProjectsDetail from "./details/ProjectsDetail";
import ResumeDetail from "./details/ResumeDetail";
import GalleryDetail from "./details/GalleryDetail";
import ContactDetail from "./details/ContactDetail";
import NowPlayingDetail from "./details/NowPlayingDetail";

interface DetailContentProps {
  widgetType: WidgetType;
}

const detailMap: Partial<Record<WidgetType, React.ComponentType>> = {
  name: NameDetail,
  about: AboutDetail,
  projects: ProjectsDetail,
  resume: ResumeDetail,
  gallery: GalleryDetail,
  contact: ContactDetail,
  nowPlaying: NowPlayingDetail,
};

export default function DetailContent({ widgetType }: DetailContentProps) {
  const Component = detailMap[widgetType];

  if (!Component) return null;

  return <Component />;
}
