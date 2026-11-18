"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { personalInfo } from "@/lib/detail-content";
import SquiggleOutline from "./SquiggleOutline";

export default function StudioNav({
  page = "home",
}: {
  page?: "home" | "sandbox" | "about";
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const shell = shellRef.current;
    const header = shell?.querySelector<HTMLElement>(".studio-header");
    const nav = header?.querySelector<HTMLElement>("nav");
    const logo = header?.querySelector<HTMLImageElement>(".wordmark img:not(.doggo-ghost)");
    const contact = header?.querySelector<HTMLElement>(".header-contact");
    if (!shell || !header || !nav || !logo || !contact) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0,
      previous = 0,
      current = 0,
      target = 0,
      alive = true;
    let expandedWidth = 0,
      compactWidth = 0,
      mobile = false,
      narrow = false;
    let measuredWidth = -1;
    const mix = (start: number, end: number) => start + (end - start) * current;
    const scrollProgress = () => {
      const progress = Math.max(0, Math.min(1, window.scrollY / 220));
      return progress * progress * (3 - 2 * progress);
    };
    const draw = () => {
      header.style.width = `${mix(expandedWidth, compactWidth)}px`;
      header.style.height = `${mix(mobile ? 86 : 106, mobile ? 56 : 64)}px`;
      header.style.paddingInline = `${mix(mobile ? 7 : 30, mobile ? 14 : 24)}px`;
      header.style.gap = `${mobile ? (narrow ? 11 : 15) : 24}px`;
      nav.style.gap = `${mix(mobile ? (narrow ? 11 : 16) : 36, mobile ? (narrow ? 11 : 15) : 24)}px`;
      logo.style.width = `${mix(mobile ? 44 : 72, mobile ? 34 : 50)}px`;
      logo.style.height = `${mix(mobile ? 29 : 38, mobile ? 23 : 28)}px`;
      shell.style.paddingTop = `${mix(mobile ? 12 : 24, mobile ? 10 : 12)}px`;
    };
    const tick = (now: number) => {
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
      previous = now;
      current = reduced.matches
        ? target
        : current + (target - current) * (1 - Math.exp(-delta * 12));
      if (Math.abs(target - current) < 0.0005) current = target;
      draw();
      if (current !== target) frame = requestAnimationFrame(tick);
      else {
        frame = 0;
        previous = 0;
      }
    };
    const schedule = () => {
      target = scrollProgress();
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const measure = () => {
      mobile = window.innerWidth <= 767;
      narrow = window.innerWidth <= 370;
      const shellStyle = getComputedStyle(shell);
      expandedWidth = Math.min(
        1440,
        shell.clientWidth -
          parseFloat(shellStyle.paddingLeft) -
          parseFloat(shellStyle.paddingRight),
      );
      const labelWidth = Array.from(nav.querySelectorAll("a")).reduce(
        (sum, link) => sum + link.getBoundingClientRect().width,
        0,
      );
      const gap = mobile ? (narrow ? 11 : 15) : 24;
      compactWidth = Math.min(
        expandedWidth,
        (mobile ? 34 : 50) +
          labelWidth +
          gap * 4 +
          contact.getBoundingClientRect().width +
          (mobile ? 28 : 48),
      );
      schedule();
    };
    current = target = scrollProgress();
    measure();
    draw();
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (Math.abs(width - measuredWidth) > 0.5) {
        measuredWidth = width;
        measure();
      }
    });
    observer.observe(shell);
    document.fonts.ready.then(() => {
      if (alive) measure();
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    reduced.addEventListener("change", schedule);
    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      reduced.removeEventListener("change", schedule);
    };
  }, []);
  return (
    <div className="nav-shell" ref={shellRef}>
      <header className="studio-header">
        <SquiggleOutline />
        <Link
          className="wordmark"
          href="/"
          aria-label="Winston Gu home"
          data-doggo-home={page === "home" ? "true" : undefined}
        >
          {page === "home" && (
            <img
              className="doggo-ghost"
              src="/images/cat-mark.png"
              alt=""
              aria-hidden="true"
              width="72"
              height="38"
              draggable="false"
            />
          )}
          <img
            data-nav-doggo={page === "home" ? "true" : undefined}
            src="/images/cat-mark.png"
            alt="Winston’s doggo mark"
            width="72"
            height="38"
          />
        </Link>
        <nav aria-label="Main navigation">
          <Link href={page === "home" ? "#work" : "/#work"}>Work</Link>
          <Link
            href="/sandbox"
            aria-current={page === "sandbox" ? "page" : undefined}
          >
            Sandbox
          </Link>
          <Link href="/about" aria-current={page === "about" ? "page" : undefined}>
            About
          </Link>
        </nav>
        <a className="header-contact" href={`mailto:${personalInfo.email}`}>
          Reach Out
        </a>
      </header>
    </div>
  );
}
