"use client";

import { useEffect, useRef } from "react";
import { isPerfLite } from "@/lib/perf-tier";

/**
 * Name widget — a bilingual handwritten signature.
 *
 * Instead of a static poster, the name writes itself: "Winston" appears in
 * cursive (vara), holds, dissolves like drying ink, then 顾文俊 brushes in with
 * authentic stroke order (hanzi-writer), holds, dissolves, and the cycle loops.
 *
 * Resource discipline:
 *   - Both libraries are lazy-loaded via dynamic import(), so they stay out of
 *     the initial bundle and only cost anything once this widget mounts.
 *   - An IntersectionObserver parks the loop at phase boundaries whenever the
 *     widget scrolls out of view — no rAF, no timers running off-screen.
 *   - prefers-reduced-motion renders a settled static mark and animates nothing.
 */

const DWELL = 2200; // hold a finished name before it dissolves (ms)
const DISSOLVE = 700; // ink fade-out (ms)
const GAP = 480; // blank beat between the two names (ms)
// Handwriting stroke color — a soft slate grey, deliberately lighter than the
// tagline's #2E3336 so the animated name reads as an understated signature that
// recedes below the crisp role text, while staying solid in weight (light tone,
// not light weight). Same grey for both scripts keeps them cohesive.
const INK = "#7A828A";

// Unique element ids for the vara host across StrictMode double-mounts and any
// duplicate widgets — vara resolves its target via a CSS selector string.
let varaSeq = 0;

export default function NameWidget() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    // Non-union binding so the type survives into the async closures below
    // (TS drops control-flow narrowing for variables captured by closures).
    const stage: HTMLDivElement = stageEl;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Weak devices get the settled static mark too — this skips downloading
    // vara + hanzi-writer + the hanzi stroke data (all lazy-imported inside
    // loop() below) AND the per-frame handwriting animation.
    if (prefersReduced || isPerfLite()) {
      renderStatic(stage);
      return () => {
        stage.replaceChildren();
      };
    }

    let cancelled = false;
    let visible = false;
    let resumeWaiter: (() => void) | null = null;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && resumeWaiter) {
          const w = resumeWaiter;
          resumeWaiter = null;
          w();
        }
      },
      { threshold: 0.01 },
    );
    io.observe(stage);

    const sleep = (ms: number) =>
      new Promise<void>((res) => {
        const t = setTimeout(() => {
          timers.delete(t);
          res();
        }, ms);
        timers.add(t);
      });

    // Park here (no timers, no rAF) until the widget is back in view.
    const waitUntilVisible = () =>
      visible
        ? Promise.resolve()
        : new Promise<void>((res) => {
            resumeWaiter = res;
          });

    // A fresh, centered layer to draw into each phase. Returned so we can fade
    // the whole layer out in one go.
    const makeLayer = () => {
      const layer = document.createElement("div");
      layer.style.cssText =
        "position:absolute;inset:0;display:flex;align-items:center;" +
        "justify-content:center;opacity:1;will-change:opacity,filter;";
      stage.appendChild(layer);
      return layer;
    };

    const dissolve = (layer: HTMLElement) =>
      new Promise<void>((res) => {
        layer.style.transition = `opacity ${DISSOLVE}ms ease, filter ${DISSOLVE}ms ease`;
        requestAnimationFrame(() => {
          layer.style.opacity = "0";
          layer.style.filter = "blur(1.2px)";
        });
        const t = setTimeout(() => {
          timers.delete(t);
          res();
        }, DISSOLVE + 40);
        timers.add(t);
      });

    async function loop() {
      const [{ default: Vara }, { default: HanziWriter }, hanzi] =
        await Promise.all([
          import("vara"),
          import("hanzi-writer"),
          import("@/lib/hanzi-data"),
        ]);
      if (cancelled) return;

      // ---- Phase A: "Winston" in cursive ----
      // vara breaks a single word character-by-character once it's wider than
      // its container, so we render into a wide, no-wrap host (one clean line)
      // and then scale the finished SVG to fill the stage — matching the bold
      // presence of 顾文俊. `non-scaling-stroke` keeps the ink weight solid
      // regardless of that fit-scale.
      const drawWinston = (layer: HTMLElement) =>
        new Promise<void>((resolve) => {
          const id = `vara-winston-${varaSeq++}`;
          const host = document.createElement("div");
          host.id = id;
          // flex-shrink:0 is essential — the host lives in a flex layer and
          // would otherwise collapse to the stage width, making vara wrap the
          // word. Keeping it wide lets "Winston" render on one clean line.
          host.style.cssText =
            "line-height:0;width:1600px;flex-shrink:0;white-space:nowrap;";
          layer.appendChild(host);

          // Once vara has drawn the word on one line, reframe the SVG to its
          // own content box via a viewBox and give it explicit, stage-fitted
          // dimensions. Normal flexbox then centers it — far more robust than
          // transform-scaling an oversized host (which clipped the leading "W").
          // The stroke scales with the viewBox, so bigger reads heavier — the
          // solid weight of 顾文俊, not a thin wisp.
          const fitToStage = () => {
            const svg = host.querySelector("svg");
            if (!svg) return;
            const bb = svg.getBBox();
            if (!bb.width || !bb.height) return;
            const pad = bb.height * 0.06; // breathing room so strokes don't kiss the edge
            const vbW = bb.width + pad * 2;
            const vbH = bb.height + pad * 2;
            const sw = stage.clientWidth || 320;
            const sh = stage.clientHeight || 90;
            const scale = Math.min((sw * 0.92) / vbW, (sh * 0.86) / vbH);
            svg.setAttribute(
              "viewBox",
              `${bb.x - pad} ${bb.y - pad} ${vbW} ${vbH}`,
            );
            svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
            svg.style.width = `${vbW * scale}px`;
            svg.style.height = `${vbH * scale}px`;
            host.style.width = `${vbW * scale}px`;
          };

          // fontSize is just the pre-scale glyph quality; the fit-scale above
          // sizes it to the stage. 46 keeps Satisfy's letterforms clean and
          // legible; a heavier strokeWidth (held constant by non-scaling-stroke)
          // gives the solid weight of 顾文俊 instead of a wispy line.
          const v = new Vara(
            `#${id}`,
            "/fonts/SatisfySL.json",
            [{ text: "Winston", fontSize: 46, strokeWidth: 2.2, duration: 1700 }],
            {
              fontSize: 46,
              strokeWidth: 2.2,
              color: INK,
              duration: 1700,
              textAlign: "center",
              autoAnimation: true,
            },
          );
          // Scale as soon as the SVG exists so the draw animates at final size.
          v.ready(fitToStage);
          v.animationEnd(() => resolve());
        });

      // ---- Phase B: 顾文俊 with real stroke order ----
      const drawChinese = async (layer: HTMLElement) => {
        const h = stage.clientHeight || 80;
        const w = stage.clientWidth || 240;
        const size = Math.max(
          34,
          Math.floor(Math.min(h * 0.94, (w - 24) / 3.4)),
        );
        const row = document.createElement("div");
        row.style.cssText = `display:flex;align-items:center;gap:${Math.round(
          size * 0.14,
        )}px;`;
        layer.appendChild(row);
        const writers = hanzi.HANZI.map((char) => {
          const cell = document.createElement("div");
          cell.style.cssText = `width:${size}px;height:${size}px;`;
          row.appendChild(cell);
          return HanziWriter.create(cell, char, {
            width: size,
            height: size,
            padding: Math.round(size * 0.05),
            showCharacter: false,
            strokeColor: INK,
            strokeAnimationSpeed: 1.7,
            delayBetweenStrokes: 35,
            charDataLoader: hanzi.hanziLoader,
          });
        });
        for (const writer of writers) {
          if (cancelled) break;
          try {
            await writer.animateCharacter();
          } catch {
            /* target removed mid-flight on unmount — ignore */
          }
        }
      };

      while (!cancelled) {
        await waitUntilVisible();
        if (cancelled) break;
        stage.replaceChildren();
        const layerA = makeLayer();
        await drawWinston(layerA);
        if (cancelled) break;
        await sleep(DWELL);
        if (cancelled) break;
        await dissolve(layerA);
        if (cancelled) break;
        await sleep(GAP);

        await waitUntilVisible();
        if (cancelled) break;
        stage.replaceChildren();
        const layerB = makeLayer();
        await drawChinese(layerB);
        if (cancelled) break;
        await sleep(DWELL);
        if (cancelled) break;
        await dissolve(layerB);
        if (cancelled) break;
        await sleep(GAP);
      }
    }

    loop();

    return () => {
      cancelled = true;
      io.disconnect();
      timers.forEach(clearTimeout);
      timers.clear();
      if (resumeWaiter) resumeWaiter();
      stage.replaceChildren();
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden @container">
      <div className="relative z-10 flex flex-col h-full">
        {/* Role tagline — foreground identity, kept from the original poster. */}
        <p
          className="font-semibold uppercase text-text-primary whitespace-nowrap"
          style={{ fontSize: "11px", letterSpacing: "0.14em" }}
        >
          Game Designer
          <span className="opacity-40 mx-2">·</span>
          UIUX Engineer
          <span className="opacity-40 mx-2">·</span>
          Product Designer
        </p>

        {/* Handwriting stage. The visible label lives in aria-label so the
         *  animated SVG strokes stay decorative to assistive tech. */}
        <div
          ref={stageRef}
          role="img"
          aria-label="Winston Gu · 顾文俊"
          className="relative w-full flex-1 min-h-0 overflow-hidden"
        />
      </div>
    </div>
  );
}

/** Settled, motion-free mark for prefers-reduced-motion users. */
function renderStatic(stage: HTMLDivElement) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:absolute;inset:0;display:flex;flex-direction:column;" +
    "align-items:flex-start;justify-content:center;gap:2px;color:" + INK + ";";
  const zh = document.createElement("div");
  zh.textContent = "顾文俊";
  zh.style.cssText = "font-size:clamp(28px,7cqw,52px);letter-spacing:0.08em;";
  const en = document.createElement("div");
  en.textContent = "Winston Gu";
  en.style.cssText =
    "font-size:13px;letter-spacing:0.12em;opacity:0.55;text-transform:uppercase;";
  wrap.append(zh, en);
  stage.appendChild(wrap);
}
