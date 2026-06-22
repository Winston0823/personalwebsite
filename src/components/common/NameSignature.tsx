"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { isPerfLite } from "@/lib/perf-tier";

/**
 * Bilingual handwritten signature stage (shared by the desktop Name widget and
 * the mobile hero).
 *
 * The name writes itself: "Winston" appears in cursive (vara), holds, dissolves
 * like drying ink, then 顾文俊 brushes in with authentic stroke order
 * (hanzi-writer), holds, dissolves, and the cycle loops.
 *
 * Resource discipline:
 *   - Both libraries are lazy-loaded via dynamic import(), so they stay out of
 *     the initial bundle and only cost anything once this mounts.
 *   - An IntersectionObserver parks the loop at phase boundaries whenever it
 *     scrolls out of view — no rAF, no timers running off-screen.
 *   - prefers-reduced-motion renders a settled static mark and animates nothing.
 */

const DWELL = 2900; // hold a finished name before it dissolves (ms)
const DISSOLVE = 800; // ink fade-out (ms)
const GAP = 600; // blank beat between the two names (ms)
const INK = "#7A828A"; // soft slate handwriting ink

let varaSeq = 0;

export default function NameSignature({
  className = "relative w-full h-full overflow-hidden",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    const stage: HTMLDivElement = stageEl;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isPerfLite()) {
      renderCursive(stage);
      return () => {
        stage.replaceChildren();
      };
    }

    if (prefersReduced) {
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

    const waitUntilVisible = () =>
      visible
        ? Promise.resolve()
        : new Promise<void>((res) => {
            resumeWaiter = res;
          });

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
      const [{ default: Vara }, { default: HanziWriter }, hanzi] = await Promise.all([
        import("vara"),
        import("hanzi-writer"),
        import("@/lib/hanzi-data"),
      ]);
      if (cancelled) return;

      const drawWinston = (layer: HTMLElement) =>
        new Promise<void>((resolve) => {
          const id = `vara-winston-${varaSeq++}`;
          const host = document.createElement("div");
          host.id = id;
          host.style.cssText = "line-height:0;width:1600px;flex-shrink:0;white-space:nowrap;";
          layer.appendChild(host);

          const fitToStage = () => {
            const svg = host.querySelector("svg");
            if (!svg) return;
            const bb = svg.getBBox();
            if (!bb.width || !bb.height) return;
            const pad = bb.height * 0.06;
            const vbW = bb.width + pad * 2;
            const vbH = bb.height + pad * 2;
            const sw = stage.clientWidth || 320;
            const sh = stage.clientHeight || 90;
            const scale = Math.min((sw * 0.92) / vbW, (sh * 0.86) / vbH);
            svg.setAttribute("viewBox", `${bb.x - pad} ${bb.y - pad} ${vbW} ${vbH}`);
            svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
            svg.style.width = `${vbW * scale}px`;
            svg.style.height = `${vbH * scale}px`;
            host.style.width = `${vbW * scale}px`;
          };

          const v = new Vara(
            `#${id}`,
            "/fonts/SatisfySL.json",
            [{ text: "Winston", fontSize: 46, strokeWidth: 2.2, duration: 2400 }],
            {
              fontSize: 46,
              strokeWidth: 2.2,
              color: INK,
              duration: 2400,
              textAlign: "center",
              autoAnimation: true,
            },
          );
          v.ready(fitToStage);
          v.animationEnd(() => resolve());
        });

      const drawChinese = async (layer: HTMLElement) => {
        const h = stage.clientHeight || 80;
        const w = stage.clientWidth || 240;
        const size = Math.max(34, Math.floor(Math.min(h * 0.94, (w - 24) / 3.4)));
        const row = document.createElement("div");
        row.style.cssText = `display:flex;align-items:center;gap:${Math.round(size * 0.14)}px;`;
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
            strokeAnimationSpeed: 1.1,
            delayBetweenStrokes: 55,
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

  return <div ref={stageRef} role="img" aria-label="Winston Gu · 顾文俊" className={className} style={style} />;
}

/** Lite mark: only the English signature served as a static SVG. */
function renderCursive(stage: HTMLDivElement) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;";
  const img = document.createElement("img");
  img.src = "/winston-signature.svg";
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.style.cssText = "width:92%;height:86%;object-fit:contain;object-position:center;";
  wrap.appendChild(img);
  stage.appendChild(wrap);
}

/** Settled, motion-free mark for prefers-reduced-motion users. */
function renderStatic(stage: HTMLDivElement) {
  const wrap = document.createElement("div");
  wrap.style.cssText =
    "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:" +
    INK +
    ";";
  const zh = document.createElement("div");
  zh.textContent = "顾文俊";
  zh.style.cssText = "font-size:clamp(28px,7cqw,52px);letter-spacing:0.08em;";
  const en = document.createElement("div");
  en.textContent = "Winston Gu";
  en.style.cssText = "font-size:13px;letter-spacing:0.12em;opacity:0.55;text-transform:uppercase;";
  wrap.append(zh, en);
  stage.appendChild(wrap);
}
