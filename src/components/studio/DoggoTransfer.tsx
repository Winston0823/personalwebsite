"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** One decorative copy bridges the hero and the live, resizing navbar slot. */
export default function DoggoTransfer() {
  const [mounted, setMounted] = useState(false);
  const flyerRef = useRef<HTMLImageElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const hero = document.querySelector<HTMLImageElement>("[data-hero-doggo]");
    const sticker = hero?.closest<HTMLElement>(".doggo-sticker");
    const destination =
      document.querySelector<HTMLImageElement>("[data-nav-doggo]");
    const ghost = document.querySelector<HTMLImageElement>(".doggo-ghost");
    const flyer = flyerRef.current;
    if (!hero || !sticker || !destination || !ghost || !flyer) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      alive = true,
      initialized = false;
    let progress = 0,
      from = 0,
      to = 0,
      started = 0,
      wantsNav = false;
    let launchBox: DOMRect | null = null;
    let lastVisibleBox: DOMRect | null = null;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const render = (now: number) => {
      frame = 0;
      const liveSource = hero.getBoundingClientRect();
      const targetBox = destination.getBoundingClientRect();
      const stickerBox = sticker.getBoundingClientRect();
      const navBottom = destination
        .closest("header")!
        .getBoundingClientRect().bottom;
      // Hysteresis prevents hovering near the exit edge from retriggering the hop.
      const shouldDock = stickerBox.top < navBottom + (wantsNav ? 64 : 24);
      if (!initialized) {
        initialized = true;
        wantsNav = shouldDock;
        progress = from = to = shouldDock ? 1 : 0;
      } else if (shouldDock !== wantsNav) {
        wantsNav = shouldDock;
        from = progress;
        to = shouldDock ? 1 : 0;
        started = now;
        if (shouldDock)
          launchBox =
            liveSource.bottom > navBottom
              ? liveSource
              : (lastVisibleBox ?? liveSource);
      }
      const elapsed = clamp((now - started) / 720);
      const eased = elapsed * elapsed * (3 - 2 * elapsed);
      progress = reduced.matches ? to : from + (to - from) * eased;
      const atHome = progress <= 0.0001;
      const docked = progress >= 0.9999;
      const sourceBox = wantsNav && launchBox ? launchBox : liveSource;
      if (atHome && liveSource.top > navBottom) lastVisibleBox = liveSource;
      if (reduced.matches) {
        const inNav = progress >= 0.5;
        hero.style.opacity = inNav ? "0" : "1";
        destination.style.opacity = inNav ? "1" : "0";
        ghost.style.opacity = inNav ? "0" : "1";
        flyer.style.visibility = "hidden";
      } else {
        hero.style.opacity = atHome ? "1" : "0";
        destination.style.opacity = docked ? "1" : "0";
        ghost.style.opacity = `${1 - progress}`;
        flyer.style.visibility = atHome || docked ? "hidden" : "visible";
        if (!atHome && !docked) {
          const startX = sourceBox.left + sourceBox.width / 2;
          const startY = sourceBox.top + sourceBox.height / 2;
          const endX = targetBox.left + targetBox.width / 2;
          const endY = targetBox.top + targetBox.height / 2;
          const width =
            sourceBox.width + (targetBox.width - sourceBox.width) * progress;
          const height =
            sourceBox.height + (targetBox.height - sourceBox.height) * progress;
          const hopHeight = Math.min(
            66,
            Math.max(15, (startY + endY) / 2 - sourceBox.height * 0.25 - 18),
          );
          const x = startX + (endX - startX) * progress;
          const y =
            startY +
            (endY - startY) * progress -
            Math.sin(Math.PI * progress) * hopHeight;
          const drift = hero.closest(".doggo-drift");
          const transform = drift ? getComputedStyle(drift).transform : "none";
          const matrix =
            transform === "none" ? null : new DOMMatrixReadOnly(transform);
          const sourceAngle = matrix
            ? (Math.atan2(matrix.b, matrix.a) * 180) / Math.PI
            : 0;
          const angle =
            sourceAngle * (1 - progress) - Math.sin(Math.PI * progress) * 15;
          flyer.style.width = `${width}px`;
          flyer.style.height = `${height}px`;
          flyer.style.transform = `translate3d(${x - width / 2}px,${y - height / 2}px,0) rotate(${angle}deg)`;
        }
      }
      // Finish the hop even if scrolling stops; continue tracking the live nav slot.
      if (progress !== to) frame = requestAnimationFrame(render);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(destination);
    observer.observe(sticker);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    document.fonts.ready.then(() => {
      if (alive) schedule();
    });
    schedule();
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      hero.style.removeProperty("opacity");
      destination.style.removeProperty("opacity");
      ghost.style.removeProperty("opacity");
    };
  }, [mounted]);

  return mounted
    ? createPortal(
        <img
          ref={flyerRef}
          className="doggo-flight"
          src="/images/cat-mark.png"
          alt=""
          aria-hidden="true"
          draggable="false"
        />,
        document.body,
      )
    : null;
}
