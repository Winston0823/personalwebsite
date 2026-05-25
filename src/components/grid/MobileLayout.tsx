"use client";

import { useEffect, useRef } from "react";
import NameWidget from "../widgets/NameWidget";
import AboutWidget from "../widgets/AboutWidget";
import ProjectsWidget from "../widgets/ProjectsWidget";
import ResumeWidget from "../widgets/ResumeWidget";
import GalleryWidget from "../widgets/GalleryWidget";
import NowPlayingWidget from "../widgets/NowPlayingWidget";
import ContactWidget from "../widgets/ContactWidget";
import LinksWidget from "../widgets/LinksWidget";

// Each widget gets an explicit height (not just min-height) so children
// using `h-full` actually resolve to a real number. minHeight + h-full
// collapses to 0 — that's why the Name poster and Projects cubes were
// invisible on the previous pass.
const widgets = [
  { key: "name", Component: NameWidget, h: 200 },
  { key: "about", Component: AboutWidget, h: 200 },
  { key: "projects", Component: ProjectsWidget, h: 420 },
  { key: "resume", Component: ResumeWidget, h: 280 },
  { key: "gallery", Component: GalleryWidget, h: 380 },
  { key: "nowPlaying", Component: NowPlayingWidget, h: 110 },
  { key: "contact", Component: ContactWidget, h: 180 },
  { key: "links", Component: LinksWidget, h: 72 },
];

export default function MobileLayout() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-in fade so each widget "arrives" as the visitor scrolls.
  // Keeps the dashboard-y feel — every card has presence, none feel
  // forgotten in the stack.
  useEffect(() => {
    if (!containerRef.current) return;
    const cards = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>("[data-mobile-card]")
    );
    cards.forEach((c) => {
      c.style.opacity = "0";
      c.style.transform = "translateY(16px)";
    });

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.transition =
              "opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1), transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            io.unobserve(el);
          }
        }
      },
      { rootMargin: "-8% 0px -8% 0px", threshold: 0.05 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-3 px-4 py-6 max-w-lg mx-auto min-h-dvh"
    >
      {widgets.map(({ key, Component, h }) => (
        <div
          key={key}
          data-mobile-card
          className="glass p-4 flex flex-col"
          style={{ height: `${h}px` }}
        >
          <div className="relative z-10 overflow-hidden w-full flex-1 min-h-0">
            <Component />
          </div>
        </div>
      ))}
    </div>
  );
}
