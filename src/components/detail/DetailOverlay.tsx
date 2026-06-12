"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { WidgetInstance } from "@/lib/grid-types";
import DetailContent from "./DetailContent";
import anime from "animejs";

interface DetailOverlayProps {
  widget: WidgetInstance;
  originRect: DOMRect;
  onClose: () => void;
}

export default function DetailOverlay({ widget, originRect, onClose }: DetailOverlayProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const isAnimating = useRef(false);
  const didOpen = useRef(false);

  // Target panel dimensions — generous so the panel feels like it "pops out" past the widget
  const targetWidth = Math.min(window.innerWidth * 0.92, 1200);
  const targetHeight = Math.min(window.innerHeight * 0.9, 900);
  const targetLeft = (window.innerWidth - targetWidth) / 2;
  const targetTop = (window.innerHeight - targetHeight) / 2;

  // Hide the source widget
  useEffect(() => {
    const sourceEl = document.querySelector(`[data-widget-id="${widget.id}"]`) as HTMLElement;
    if (sourceEl) sourceEl.setAttribute("data-widget-expanded", "true");
    return () => {
      if (sourceEl) sourceEl.removeAttribute("data-widget-expanded");
    };
  }, [widget.id]);

  // Open animation
  useEffect(() => {
    if (!panelRef.current || !backdropRef.current || !contentRef.current) return;
    if (didOpen.current) return; // guard against StrictMode double-invoke
    didOpen.current = true;
    isAnimating.current = true;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const content = contentRef.current;
    const contentItems = content.querySelectorAll(".detail-stagger > *");

    // Lock panel at final rect; animate via transform (no layout thrash)
    panel.style.left = `${targetLeft}px`;
    panel.style.top = `${targetTop}px`;
    panel.style.width = `${targetWidth}px`;
    panel.style.height = `${targetHeight}px`;
    panel.style.borderRadius = "24px";

    const tx = originRect.left - targetLeft;
    const ty = originRect.top - targetTop;
    const sx = originRect.width / targetWidth;
    const sy = originRect.height / targetHeight;

    // Prime starting transform via anime + hide content until it fades in
    anime.set(panel, { translateX: tx, translateY: ty, scaleX: sx, scaleY: sy });
    content.style.opacity = "0";

    const tl = anime.timeline();

    // Backdrop: gentle ease-out, matched to the panel's settle time
    tl.add({
      targets: backdrop,
      opacity: [0, 1],
      duration: 420,
      easing: "easeOutQuad",
    }, 0);

    // Panel: smooth cubic ease-out (no spring bounce) — feels more refined
    tl.add({
      targets: panel,
      translateX: 0,
      translateY: 0,
      scaleX: 1,
      scaleY: 1,
      duration: 700,
      easing: "cubicBezier(0.16, 1, 0.3, 1)",
    }, 0);

    // Content wrapper fades in once on open. Subsequent in-panel swaps
    // (grid ↔ case study) keep opacity:1 so they never re-fade or flash.
    tl.add({
      targets: content,
      opacity: [0, 1],
      duration: 480,
      easing: "cubicBezier(0.22, 1, 0.36, 1)",
    }, 220);

    // Per-item stagger (only views with .detail-stagger get this — extra polish)
    if (contentItems.length > 0) {
      tl.add({
        targets: contentItems,
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 460,
        delay: anime.stagger(55),
        easing: "cubicBezier(0.16, 1, 0.3, 1)",
      }, 320);
    }

    tl.finished.then(() => {
      isAnimating.current = false;
      panel.classList.add("is-settled");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => {
    if (isAnimating.current || isClosing) return;
    setIsClosing(true);
    isAnimating.current = true;

    const panel = panelRef.current;
    const backdrop = backdropRef.current;

    // Drop blur + heavy shadows immediately so nothing is re-rasterising during the fade
    if (panel) {
      panel.classList.remove("is-settled");
      panel.classList.add("is-closing");
    }

    // Reveal the source widget right away — panel is still on top and opaque
    const sourceEl = document.querySelector(`[data-widget-id="${widget.id}"]`) as HTMLElement;
    if (sourceEl) sourceEl.removeAttribute("data-widget-expanded");

    const tl = anime.timeline({
      easing: "cubicBezier(0.32, 0, 0.18, 1)",
    });

    // Content fades out first and faster than the panel, so by the time the
    // panel itself starts shrinking the "stuff inside" has already softened.
    const content = contentRef.current;
    if (content) {
      tl.add({
        targets: content,
        opacity: [1, 0],
        duration: 200,
        easing: "easeInQuad",
      }, 0);
    }

    // Panel: gentle scale-down + slight drop. Longer than before (320ms) so
    // it reads as a settle rather than a snap. Opacity tail covers the last
    // 60% of the duration to avoid the abrupt cut.
    if (panel) {
      tl.add({
        targets: panel,
        scaleX: [1, 0.965],
        scaleY: [1, 0.965],
        translateY: [0, 6],
        opacity: [1, 0],
        duration: 360,
      }, 60);
    }

    if (backdrop) {
      tl.add({
        targets: backdrop,
        opacity: [1, 0],
        duration: 340,
        easing: "easeOutQuad",
      }, 80);
    }

    tl.finished.then(() => {
      isAnimating.current = false;
      onClose();
    });
  }, [isClosing, widget.id, onClose]);

  // Escape key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  // Track whether a child has asked for the case-study layout. When true the
  // panel goes fullscreen AND we hide the standard header so the hero image
  // can paint to the very top of the panel.
  const [caseStudyMode, setCaseStudyMode] = useState(false);

  // Listen for child components requesting a fullscreen panel (used by the
  // project case-study view). Animates panel between popup rect and full
  // viewport with anime.js so dimensions interpolate smoothly.
  useEffect(() => {
    const handleFullscreen = (e: Event) => {
      const evt = e as CustomEvent<boolean>;
      const panel = panelRef.current;
      if (!panel || isAnimating.current) return;

      const goFull = evt.detail === true;
      setCaseStudyMode(goFull);
      anime.remove(panel);
      anime({
        targets: panel,
        left: goFull ? 0 : targetLeft,
        top: goFull ? 0 : targetTop,
        width: goFull ? window.innerWidth : targetWidth,
        height: goFull ? window.innerHeight : targetHeight,
        borderRadius: goFull ? 0 : 24,
        duration: 520,
        easing: "cubicBezier(0.22, 1, 0.36, 1)",
      });
    };

    window.addEventListener("detail-panel:fullscreen", handleFullscreen);
    return () => window.removeEventListener("detail-panel:fullscreen", handleFullscreen);
  }, [targetLeft, targetTop, targetWidth, targetHeight]);

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="detail-backdrop active"
        data-cursor="close"
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="detail-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-10 w-full h-full flex flex-col">
          {/* Header bar — hidden in case-study mode so the hero reaches the top */}
          {!caseStudyMode && (
            <div className="flex items-center justify-between p-5 pb-0 shrink-0">
              <span
                className="uppercase tracking-wider text-accent font-medium"
                style={{ fontSize: "var(--text-caption)" }}
              >
                {widget.type === "nowPlaying" ? "Now Playing" : widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}
              </span>
              <button onClick={handleClose} className="detail-close-btn" data-cursor="close">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Floating close button shown only in case-study mode (header is gone) */}
          {caseStudyMode && (
            <button
              onClick={handleClose}
              className="detail-close-btn absolute top-5 right-5 z-30"
              data-cursor="close"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "white",
              }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Content. In case-study mode drop top padding so the hero starts at y=0. */}
          <div
            ref={contentRef}
            className={`detail-scroll flex-1 px-10 pb-16 min-h-0 ${caseStudyMode ? "pt-9" : "pt-5"}`}
          >
            <DetailContent widgetType={widget.type} />
          </div>
        </div>
      </div>
    </>
  );
}
