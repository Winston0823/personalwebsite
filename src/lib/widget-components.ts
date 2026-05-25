import { WidgetType } from "./grid-types";
import NameWidget from "@/components/widgets/NameWidget";
import AboutWidget from "@/components/widgets/AboutWidget";
import ProjectsWidget from "@/components/widgets/ProjectsWidget";
import LinksWidget from "@/components/widgets/LinksWidget";
import NowPlayingWidget from "@/components/widgets/NowPlayingWidget";
import ResumeWidget from "@/components/widgets/ResumeWidget";
import ContactWidget from "@/components/widgets/ContactWidget";
import GalleryWidget from "@/components/widgets/GalleryWidget";

export const widgetComponents: Record<WidgetType, React.ComponentType> = {
  name: NameWidget,
  about: AboutWidget,
  projects: ProjectsWidget,
  links: LinksWidget,
  nowPlaying: NowPlayingWidget,
  resume: ResumeWidget,
  contact: ContactWidget,
  gallery: GalleryWidget,
};
