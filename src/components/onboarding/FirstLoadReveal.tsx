"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs";

/**
 * FirstLoadReveal
 *
 * A one-time, ~7s teaching overlay that runs on a visitor's first ever load
 * to communicate the two non-obvious interactions on the site:
 *   1. Widgets are clickable for an expanded detail view.
 *   2. There's a drawer at the right edge that holds more widgets.
 *
 * Gated by localStorage key `winston-reveal-v1`. The flag is set at mount
 * START (not end), so an early-abort still prevents replay on next visit.
 *
 * Pointer events on the overlay are disabled — any pointerdown/keydown on
 * the page aborts the reveal and unmounts in 200ms. The visitor's intent to
 * interact always wins over teaching.
 *
 * Respects `prefers-reduced-motion: reduce`: degrades to a single static
 * caption for 4s, no cursor/ripples.
 */

const STORAGE_KEY = "winston-reveal-v1";

// Stage timings (ms from mount). Tweak here to retime the sequence.
const T = {
  dimFadeIn: 0,
  caption1In: 500,
  cursorFlyIn: 2000,
  cursorFlyDuration: 1200,
  cornerGlyphIn: 3000,
  clickRipple1: 3400,
  captionSwap2: 3700,
  captionSwap3: 5000,
  cursorFlyToDrawer: 5000,
  cursorFlyToDrawerDuration: 1300,
  clickRipple2: 6500,
  fadeOut: 7000,
  fadeOutDuration: 350,
  unmount: 7400,
} as const;

const REDUCED_MOTION_DURATION = 4000;

type Phase = "running" | "aborting" | "done";

export default function FirstLoadReveal() {
  // Decide once on mount whether to render at all. Returning null before
  // hooks would be inconsistent across renders, so we gate render via state.
  const [shouldRender, setShouldRender] = useState(false);
  const [phase, setPhase] = useState<Phase>("running");
  const [reducedMotion, setReducedMotion] = useState(false);

  // Refs to elements anime.js mutates directly (avoid React state in hot path).
  const overlayRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null);
  const caption1Ref = useRef<HTMLDivElement>(null);
  const caption2Ref = useRef<HTMLDivElement>(null);
  const caption3Ref = useRef<HTMLDivElement>(null);
  const captionStaticRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cornerGlyphRef = useRef<HTMLDivElement>(null);
  const ripple1Ref = useRef<HTMLDivElement>(null);
  const ripple2Ref = useRef<HTMLDivElement>(null);
  const drawerHaloRef = useRef<HTMLDivElement>(null);

  // Timeout handles so we can clear them on abort/unmount.
  const timeoutsRef = useRef<number[]>([]);
  // Track all anime.js instances so we can stop them cleanly on abort.
  const animationsRef = useRef<anime.AnimeInstance[]>([]);
  const abortedRef = useRef(false);

  // Decide whether to render. Runs once after mount on the client.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // localStorage may be unavailable (Safari private mode, etc.). Skip
      // the reveal rather than risk an infinite-replay loop.
      return;
    }
    // Flag is written by the sequence-running effect via a cancelable
    // 250ms timer. Dev StrictMode mount→unmount→mount cancels it on the
    // throwaway first mount; a real mount completes it. Abort path also
    // writes the flag synchronously as a safety.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    setShouldRender(true);
    // Signal to other components (DrawerHandle, etc.) that the reveal is live.
    document.body.setAttribute("data-reveal-pulse", "true");
  }, []);

  // Run the animation sequence after the overlay has mounted.
  useEffect(() => {
    if (!shouldRender) return;
    if (typeof window === "undefined") return;

    const cleanup = () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
      animationsRef.current.forEach((a) => {
        try {
          a.pause();
        } catch {
          /* noop */
        }
      });
      animationsRef.current = [];
      document.body.removeAttribute("data-reveal-pulse");
    };

    const abort = () => {
      if (abortedRef.current) return;
      abortedRef.current = true;
      // Safety: if the user aborts BEFORE the 250ms deferred flag-write
      // fires, write it synchronously here so the reveal doesn't replay.
      try {
        window.localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* noop */
      }
      // Stop everything in flight, then run a quick fade-out.
      animationsRef.current.forEach((a) => {
        try {
          a.pause();
        } catch {
          /* noop */
        }
      });
      animationsRef.current = [];
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
      setPhase("aborting");
      const overlay = overlayRef.current;
      if (overlay) {
        const fade = anime({
          targets: overlay,
          opacity: [overlay.style.opacity || 1, 0],
          duration: 200,
          easing: "easeOutQuad",
          complete: () => setPhase("done"),
        });
        animationsRef.current.push(fade);
      } else {
        setPhase("done");
      }
      document.body.removeAttribute("data-reveal-pulse");
    };

    const onPointerDown = () => abort();
    const onKeyDown = () => abort();
    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("keydown", onKeyDown, { capture: true });

    // Deferred flag write: 250ms after this effect starts. StrictMode's
    // throwaway first mount runs cleanup well before this fires (so the
    // flag isn't written and the real mount can render the reveal). A
    // real mount completes the timer normally.
    timeoutsRef.current.push(
      window.setTimeout(() => {
        try {
          window.localStorage.setItem(STORAGE_KEY, "1");
        } catch {
          /* noop */
        }
      }, 250)
    );

    // Reduced-motion path: a single static caption, then fade out.
    if (reducedMotion) {
      const staticEl = captionStaticRef.current;
      if (staticEl) {
        const fadeIn = anime({
          targets: staticEl,
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 300,
          easing: "easeOutQuad",
        });
        animationsRef.current.push(fadeIn);
      }
      const fadeOutId = window.setTimeout(() => {
        const overlay = overlayRef.current;
        if (!overlay || abortedRef.current) return;
        const out = anime({
          targets: overlay,
          opacity: [1, 0],
          duration: 400,
          easing: "easeOutQuad",
          complete: () => setPhase("done"),
        });
        animationsRef.current.push(out);
      }, REDUCED_MOTION_DURATION);
      timeoutsRef.current.push(fadeOutId);

      return () => {
        window.removeEventListener("pointerdown", onPointerDown, { capture: true } as EventListenerOptions);
        window.removeEventListener("keydown", onKeyDown, { capture: true } as EventListenerOptions);
        cleanup();
      };
    }

    // Locate the Projects widget. If it's missing (mobile layout, etc.), bail.
    const projectsWidget = document.querySelector<HTMLElement>(
      '[data-widget-id^="projects-"]'
    );

    // Compute target positions. We re-derive these once at sequence start.
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let widgetCenterX = winW / 2;
    let widgetCenterY = winH / 2;
    let widgetTopRightX = winW / 2 + 80;
    let widgetTopRightY = winH / 2 - 80;
    if (projectsWidget) {
      const rect = projectsWidget.getBoundingClientRect();
      widgetCenterX = rect.left + rect.width / 2;
      widgetCenterY = rect.top + rect.height / 2;
      // Inset the corner glyph slightly inside the widget edge.
      widgetTopRightX = rect.right - 18;
      widgetTopRightY = rect.top + 18;
    }

    const drawerX = winW - 18;
    const drawerY = winH / 2;

    // --- Stage 1: dim fade in ---
    if (dimRef.current) {
      const a = anime({
        targets: dimRef.current,
        opacity: [0, 1],
        duration: 500,
        easing: "easeOutQuad",
      });
      animationsRef.current.push(a);
    }

    // --- Stage 2: caption 1 in ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (!caption1Ref.current) return;
        const a = anime({
          targets: caption1Ref.current,
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 380,
          easing: "easeOutExpo",
        });
        animationsRef.current.push(a);
      }, T.caption1In)
    );

    // --- Stage 3: cursor flies in to widget center ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (!cursorRef.current) return;
        // Start off-screen top-right.
        anime.set(cursorRef.current, {
          translateX: winW + 60,
          translateY: -60,
          opacity: 1,
        });
        const a = anime({
          targets: cursorRef.current,
          translateX: widgetCenterX - 6,
          translateY: widgetCenterY - 6,
          duration: T.cursorFlyDuration,
          easing: "easeInOutQuad",
        });
        animationsRef.current.push(a);
      }, T.cursorFlyIn)
    );

    // --- Stage 4: corner glyph fades in on widget top-right ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (!cornerGlyphRef.current) return;
        anime.set(cornerGlyphRef.current, {
          translateX: widgetTopRightX - 11,
          translateY: widgetTopRightY - 11,
        });
        const a = anime({
          targets: cornerGlyphRef.current,
          opacity: [0, 1],
          scale: [0.6, 1],
          duration: 320,
          easing: "easeOutBack",
        });
        animationsRef.current.push(a);
      }, T.cornerGlyphIn)
    );

    // --- Stage 5: click ripple at widget center ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (!ripple1Ref.current) return;
        anime.set(ripple1Ref.current, {
          translateX: widgetCenterX - 45,
          translateY: widgetCenterY - 45,
          scale: 0,
          opacity: 0.6,
        });
        const a = anime({
          targets: ripple1Ref.current,
          scale: [0, 1],
          opacity: [0.6, 0],
          duration: 600,
          easing: "easeOutQuad",
        });
        animationsRef.current.push(a);
      }, T.clickRipple1)
    );

    // --- Stage 6: caption swap to "Click any widget…" ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (caption1Ref.current) {
          const out = anime({
            targets: caption1Ref.current,
            opacity: [1, 0],
            duration: 200,
            easing: "easeInQuad",
          });
          animationsRef.current.push(out);
        }
        window.setTimeout(() => {
          if (!caption2Ref.current) return;
          const inn = anime({
            targets: caption2Ref.current,
            opacity: [0, 1],
            translateY: [8, 0],
            duration: 200,
            easing: "easeOutQuad",
          });
          animationsRef.current.push(inn);
        }, 200);
      }, T.captionSwap2)
    );

    // --- Stage 7a: caption swap to "Or drag more widgets from the drawer →" ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (caption2Ref.current) {
          const out = anime({
            targets: caption2Ref.current,
            opacity: [1, 0],
            duration: 200,
            easing: "easeInQuad",
          });
          animationsRef.current.push(out);
        }
        window.setTimeout(() => {
          if (!caption3Ref.current) return;
          const inn = anime({
            targets: caption3Ref.current,
            opacity: [0, 1],
            translateY: [8, 0],
            duration: 200,
            easing: "easeOutQuad",
          });
          animationsRef.current.push(inn);
        }, 200);
      }, T.captionSwap3)
    );

    // --- Stage 7b: cursor flies to drawer handle + halo ring pulses in ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (cursorRef.current) {
          const a = anime({
            targets: cursorRef.current,
            translateX: drawerX - 6,
            translateY: drawerY - 6,
            duration: T.cursorFlyToDrawerDuration,
            easing: "easeInOutQuad",
          });
          animationsRef.current.push(a);
        }
        if (drawerHaloRef.current) {
          anime.set(drawerHaloRef.current, {
            translateX: drawerX - 36,
            translateY: drawerY - 36,
          });
          const a = anime({
            targets: drawerHaloRef.current,
            opacity: [0, 0.85, 0.5],
            scale: [0.7, 1.1, 1],
            duration: T.cursorFlyToDrawerDuration,
            easing: "easeOutQuad",
          });
          animationsRef.current.push(a);
        }
      }, T.cursorFlyToDrawer)
    );

    // --- Stage 8: click ripple at drawer handle ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (!ripple2Ref.current) return;
        anime.set(ripple2Ref.current, {
          translateX: drawerX - 45,
          translateY: drawerY - 45,
          scale: 0,
          opacity: 0.6,
        });
        const a = anime({
          targets: ripple2Ref.current,
          scale: [0, 1],
          opacity: [0.6, 0],
          duration: 600,
          easing: "easeOutQuad",
        });
        animationsRef.current.push(a);
      }, T.clickRipple2)
    );

    // --- Stage 9: fade out overlay ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (!overlayRef.current || abortedRef.current) return;
        const a = anime({
          targets: overlayRef.current,
          opacity: [1, 0],
          duration: T.fadeOutDuration,
          easing: "easeOutQuad",
        });
        animationsRef.current.push(a);
      }, T.fadeOut)
    );

    // --- Unmount ---
    timeoutsRef.current.push(
      window.setTimeout(() => {
        if (abortedRef.current) return;
        setPhase("done");
      }, T.unmount)
    );

    return () => {
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as EventListenerOptions);
      window.removeEventListener("keydown", onKeyDown, { capture: true } as EventListenerOptions);
      cleanup();
    };
  }, [shouldRender, reducedMotion]);

  if (!shouldRender || phase === "done") return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ opacity: 1 }}
    >
      {/* Subtle dim across the viewport — cursor + content remain visible. */}
      <div
        ref={dimRef}
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.04)", opacity: 0 }}
      />

      {reducedMotion ? (
        <div
          ref={captionStaticRef}
          className="absolute left-1/2 -translate-x-1/2 bottom-12 px-5 py-3 rounded-full"
          style={{
            background: "rgba(20,20,22,0.82)",
            backdropFilter: "blur(12px) saturate(160%)",
            WebkitBackdropFilter: "blur(12px) saturate(160%)",
            color: "white",
            fontSize: 17,
            fontFamily: "var(--font-sans)",
            boxShadow: "0 10px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.18)",
            border: "0.5px solid rgba(255,255,255,0.15)",
            opacity: 0,
            whiteSpace: "nowrap",
          }}
        >
          Tip: click any widget to expand, or use the drawer at the right edge
        </div>
      ) : (
        <>
          {/* Caption 1 */}
          <div
            ref={caption1Ref}
            className="absolute left-1/2 -translate-x-1/2 bottom-12 px-5 py-3 rounded-full"
            style={{
              background: "rgba(20,20,22,0.82)",
              backdropFilter: "blur(12px) saturate(160%)",
              WebkitBackdropFilter: "blur(12px) saturate(160%)",
              color: "white",
              fontSize: 17,
              fontFamily: "var(--font-sans)",
              boxShadow: "0 10px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.18)",
              border: "0.5px solid rgba(255,255,255,0.15)",
              opacity: 0,
              whiteSpace: "nowrap",
            }}
          >
            This site is interactive — try it.
          </div>

          {/* Caption 2 (overlaps same slot; opacity-driven swap) */}
          <div
            ref={caption2Ref}
            className="absolute left-1/2 -translate-x-1/2 bottom-12 px-5 py-3 rounded-full"
            style={{
              background: "rgba(20,20,22,0.82)",
              backdropFilter: "blur(12px) saturate(160%)",
              WebkitBackdropFilter: "blur(12px) saturate(160%)",
              color: "white",
              fontSize: 17,
              fontFamily: "var(--font-sans)",
              boxShadow: "0 10px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.18)",
              border: "0.5px solid rgba(255,255,255,0.15)",
              opacity: 0,
              whiteSpace: "nowrap",
            }}
          >
            Click any widget for the full case study
          </div>

          {/* Caption 3 */}
          <div
            ref={caption3Ref}
            className="absolute left-1/2 -translate-x-1/2 bottom-12 px-5 py-3 rounded-full"
            style={{
              background: "rgba(20,20,22,0.82)",
              backdropFilter: "blur(12px) saturate(160%)",
              WebkitBackdropFilter: "blur(12px) saturate(160%)",
              color: "white",
              fontSize: 17,
              fontFamily: "var(--font-sans)",
              boxShadow: "0 10px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.18)",
              border: "0.5px solid rgba(255,255,255,0.15)",
              opacity: 0,
              whiteSpace: "nowrap",
            }}
          >
            Or drag more widgets from the drawer →
          </div>

          {/* Ghost cursor — white arrow with subtle drop shadow */}
          <div
            ref={cursorRef}
            className="absolute top-0 left-0"
            style={{
              width: 24,
              height: 24,
              opacity: 0,
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
              willChange: "transform",
            }}
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
              <path
                d="M4 2 L4 18 L8.5 14 L11.2 20 L13.6 19 L11 13 L17 13 Z"
                stroke="rgba(0,0,0,0.45)"
                strokeWidth="0.8"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Corner-glyph "click to expand" hint on the widget */}
          <div
            ref={cornerGlyphRef}
            className="absolute top-0 left-0 flex items-center justify-center rounded-full"
            style={{
              width: 22,
              height: 22,
              background: "var(--color-accent)",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1,
              boxShadow: "0 4px 12px rgba(0,122,255,0.35), 0 1px 3px rgba(0,0,0,0.2)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 9 L9 3 M5 3 L9 3 L9 7"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Click ripple #1 (widget) */}
          <div
            ref={ripple1Ref}
            className="absolute top-0 left-0 rounded-full"
            style={{
              width: 90,
              height: 90,
              border: "2px solid var(--color-accent)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />

          {/* Click ripple #2 (drawer) */}
          <div
            ref={ripple2Ref}
            className="absolute top-0 left-0 rounded-full"
            style={{
              width: 90,
              height: 90,
              border: "2px solid var(--color-accent)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />

          {/* Halo ring at right edge — fallback for the drawer handle pulse so
             the user always sees the affordance even if DrawerHandle isn't
             listening for the data-reveal-pulse signal yet. */}
          <div
            ref={drawerHaloRef}
            className="absolute top-0 left-0 rounded-full"
            style={{
              width: 72,
              height: 72,
              background:
                "radial-gradient(circle, rgba(0,122,255,0.35) 0%, rgba(0,122,255,0.0) 65%)",
              opacity: 0,
              willChange: "transform, opacity",
            }}
          />
        </>
      )}
    </div>
  );
}
