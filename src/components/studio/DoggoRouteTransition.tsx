"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Box = { left: number; top: number; width: number; height: number };
type Spot = { box: Box; kind: string };
type Destination = { element: HTMLImageElement; kind: string };
type Journey = {
  source: Spot;
  url: URL;
  history: boolean;
  positioned: boolean;
  started: number;
  found: number;
  waiting: number;
};
const navSelector = ".nav-shell .wordmark img:not(.doggo-ghost)";
const image = (selector: string) =>
  document.querySelector<HTMLImageElement>(selector);
const visible = (element: HTMLElement) => {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return (
    style.visibility !== "hidden" &&
    Number(style.opacity) > 0.05 &&
    rect.width > 0 &&
    rect.bottom > 0 &&
    rect.top < innerHeight
  );
};

/** A single route-level doggo survives page unmounts; the scroll hop stays local. */
export default function DoggoRouteTransition() {
  const pathname = usePathname();
  const route = useRef(pathname);
  const sync = useRef<(path: string) => void>(() => {});

  useEffect(() => {
    const root = document.documentElement;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let journey: Journey | null = null;
    let flyer: HTMLImageElement | null = null;
    let last: Spot | null = null;
    let frame = 0;
    let watchFrame = 0;
    let initialized = false;
    let alive = true;

    const current = (): Spot | null => {
      if (flyer && flyer.getBoundingClientRect().width > 0)
        return {
          box: flyer.getBoundingClientRect(),
          kind: flyer.dataset.to || flyer.dataset.from || "in-flight",
        };
      const about = image("[data-about-doggo]");
      if (about)
        return { box: about.getBoundingClientRect(), kind: "about-sticker" };
      const scrolling = image(".doggo-flight");
      if (scrolling && visible(scrolling))
        return {
          box: scrolling.getBoundingClientRect(),
          kind: "home-scroll-hop",
        };
      const hero = image("[data-hero-doggo]");
      const nav = image(navSelector);
      if (hero && visible(hero))
        return { box: hero.getBoundingClientRect(), kind: "home-sticker" };
      if (nav)
        return {
          box: nav.getBoundingClientRect(),
          kind: hero ? "work-nav" : "nav",
        };
      return null;
    };
    const remember = () => {
      if (!journey) last = current() || last;
    };
    const size = new ResizeObserver(remember);
    const watch = () => {
      cancelAnimationFrame(watchFrame);
      watchFrame = requestAnimationFrame(() => {
        size.disconnect();
        for (const element of document.querySelectorAll<HTMLElement>(
          `${navSelector},[data-hero-doggo],[data-about-doggo]`,
        ))
          size.observe(element);
        remember();
      });
    };
    const afterScroll = () => {
      cancelAnimationFrame(watchFrame);
      watchFrame = requestAnimationFrame(remember);
    };
    const finish = () => {
      const destination = flyer?.dataset.to;
      journey = null;
      flyer?.remove();
      flyer = null;
      root.removeAttribute("data-doggo-journey");
      root.setAttribute("data-doggo-ready", "true");
      window.dispatchEvent(new Event("studio:doggo-route-landed"));
      if (destination === "about-sticker" && !reduced.matches)
        image("[data-about-doggo]")
          ?.closest("button")
          ?.animate(
            [
              { transform: "rotate(-2deg) scale(1.025,.975)" },
              { transform: "rotate(-2deg) scale(1)" },
            ],
            { duration: 300, easing: "ease-out" },
          );
      remember();
      watch();
    };
    const destination = (trip: Journey): Destination | null => {
      if (location.pathname !== trip.url.pathname) return null;
      if (trip.url.pathname === "/about") {
        const target = image("[data-about-doggo]");
        return target ? { element: target, kind: "about-sticker" } : null;
      }
      // About's old nav is still in the DOM for part of a route commit.
      if (image("[data-about-doggo]")) return null;
      const nav = image(navSelector);
      if (trip.url.pathname === "/") {
        const hero = image("[data-hero-doggo]");
        if (!hero || !nav) return null;
        if (!trip.positioned) {
          trip.positioned = true;
          if (!trip.history) {
            if (trip.url.hash === "#work")
              document
                .getElementById("work")
                ?.scrollIntoView({ behavior: "instant", block: "start" });
            else window.scrollTo({ top: 0, behavior: "instant" });
          }
        }
        const sticker = hero.closest(".doggo-sticker")!.getBoundingClientRect();
        const navBottom = nav.closest("header")!.getBoundingClientRect().bottom;
        const inWork =
          trip.url.hash === "#work" || sticker.top < navBottom + 24;
        return {
          element: inWork ? nav : hero,
          kind: inWork ? "work-nav" : "home-sticker",
        };
      }
      return nav ? { element: nav, kind: "nav" } : null;
    };
    const tick = (now: number) => {
      if (!journey || !flyer || !alive) return;
      const target = destination(journey);
      if (!target) {
        if (now - journey.waiting > 4000) {
          finish();
          return;
        }
        frame = requestAnimationFrame(tick);
        return;
      }
      flyer.dataset.to = target.kind;
      // Allow the new page's hash/history scroll to settle before taking off.
      if (!journey.found) journey.found = now;
      if (now - journey.found < 80) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (reduced.matches) {
        finish();
        return;
      }
      if (!journey.started) journey.started = now;
      const raw = Math.min(1, (now - journey.started) / 850);
      const t = raw * raw * (3 - 2 * raw);
      const source = journey.source.box;
      const end = target.element.getBoundingClientRect();
      const width = source.width + (end.width - source.width) * t;
      const height = source.height + (end.height - source.height) * t;
      const x =
        source.left +
        source.width / 2 +
        (end.left + end.width / 2 - source.left - source.width / 2) * t;
      const y =
        source.top +
        source.height / 2 +
        (end.top + end.height / 2 - source.top - source.height / 2) * t -
        Math.sin(Math.PI * t) *
          Math.min(95, 40 + Math.abs(end.left - source.left) * 0.1);
      const angle = Math.sin(Math.PI * t) * (end.left > source.left ? 12 : -12);
      Object.assign(flyer.style, {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate3d(${x - width / 2}px,${y - height / 2}px,0) rotate(${angle}deg)`,
      });
      if (raw < 1) frame = requestAnimationFrame(tick);
      else finish();
    };
    const begin = (source: Spot | null, url: URL, history = false) => {
      if (!source || !source.box.width) {
        root.setAttribute("data-doggo-ready", "true");
        return;
      }
      cancelAnimationFrame(frame);
      flyer?.remove();
      root.setAttribute("data-doggo-journey", source.kind);
      flyer = document.createElement("img");
      flyer.src = "/images/cat-mark.png";
      flyer.alt = "";
      flyer.setAttribute("aria-hidden", "true");
      flyer.className = "doggo-route-flight";
      flyer.dataset.from = source.kind;
      const box = source.box;
      Object.assign(flyer.style, {
        position: "fixed",
        left: "0",
        top: "0",
        zIndex: "120",
        pointerEvents: "none",
        objectFit: "contain",
        maxWidth: "none",
        width: `${box.width}px`,
        height: `${box.height}px`,
        transform: `translate3d(${box.left}px,${box.top}px,0)`,
        filter: "brightness(0) opacity(0.65)",
        willChange: "transform,width,height",
      });
      if (reduced.matches) flyer.style.visibility = "hidden";
      document.body.appendChild(flyer);
      journey = {
        source,
        url,
        history,
        positioned: false,
        started: 0,
        found: 0,
        waiting: performance.now(),
      };
      frame = requestAnimationFrame(tick);
    };
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href, location.href);
      if (
        url.origin !== location.origin ||
        url.pathname === location.pathname ||
        (url.pathname !== "/about" && location.pathname !== "/about")
      )
        return;
      begin(current() || last, url);
    };
    const pop = () => {
      if (journey?.url.href === location.href) return;
      if (route.current === "/about" || location.pathname === "/about")
        begin(current() || last, new URL(location.href), true);
    };
    const onRoute = (next: string) => {
      const previous = route.current;
      route.current = next;
      if (!journey && next === "/about") {
        const nav = image(navSelector);
        const source = initialized
          ? last
          : nav
            ? { box: nav.getBoundingClientRect(), kind: "nav" }
            : null;
        begin(source, new URL(location.href));
      } else if (
        !journey &&
        initialized &&
        previous === "/about" &&
        next !== "/about"
      )
        begin(last, new URL(location.href), true);
      else if (!journey) root.setAttribute("data-doggo-ready", "true");
      initialized = true;
      watch();
    };
    sync.current = onRoute;
    onRoute(route.current);
    document.addEventListener("click", click, true);
    window.addEventListener("popstate", pop);
    window.addEventListener("scroll", afterScroll, { passive: true });
    window.addEventListener("resize", afterScroll, { passive: true });
    const preference = () => {
      if (reduced.matches && journey && destination(journey)) finish();
    };
    reduced.addEventListener("change", preference);
    return () => {
      alive = false;
      sync.current = () => {};
      cancelAnimationFrame(frame);
      cancelAnimationFrame(watchFrame);
      size.disconnect();
      flyer?.remove();
      root.removeAttribute("data-doggo-journey");
      document.removeEventListener("click", click, true);
      window.removeEventListener("popstate", pop);
      window.removeEventListener("scroll", afterScroll);
      window.removeEventListener("resize", afterScroll);
      reduced.removeEventListener("change", preference);
    };
  }, []);
  useEffect(() => {
    sync.current(pathname);
  }, [pathname]);
  return null;
}
