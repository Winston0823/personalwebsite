"use client";

import { useEffect, useRef } from "react";

/* A shrunken, self-contained port of the real site's PixelRevealOverlay.
   The photoreal car is painted to a canvas; moving the cursor erases 14→8px
   tiles inside a water-rippled radius, punching through to the holographic
   wireframe layer sitting behind the canvas. Erased tiles fade back over ~1.2s
   so the reveal reads as liquid, not a hard hole. On touch / no-hover devices
   the cursor is driven by an automatic figure-eight sweep so the effect still
   demos itself. Mirrors the hero's "form dissolves into engineering" idea in a
   card-sized window. */

const PIXEL_SIZE = 8;
const RADIUS = 64;
const LERP = 0.16;
const TRAIL_DECAY = 0.02; // ~0.8s fade at 60fps

function waterNoise(x: number, y: number, t: number): number {
  return (
    Math.sin(x * 0.06 + y * 0.03 + t * 1.1) * 12 +
    Math.sin(x * 0.034 - y * 0.052 + t * 0.85) * 9 +
    Math.sin(x * 0.021 + y * 0.07 + t * 1.4) * 7
  );
}

export default function PixelLiquidDemo({
  photorealSrc,
  className,
}: {
  photorealSrc: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const smoothRef = useRef({ x: -9999, y: -9999 });
  const insideRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cssSize = { w: 0, h: 0 };
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      cssSize.w = canvas.offsetWidth;
      cssSize.h = canvas.offsetHeight;
      canvas.width = cssSize.w * dpr;
      canvas.height = cssSize.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const img = new Image();
    img.src = photorealSrc;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      insideRef.current =
        mouseRef.current.x >= 0 &&
        mouseRef.current.y >= 0 &&
        mouseRef.current.x <= rect.width &&
        mouseRef.current.y <= rect.height;
    };
    window.addEventListener("mousemove", onMove);

    // Auto-sweep for touch / no-hover devices.
    const autoSweep =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: none)").matches;

    const pixelAlpha = new Map<string, number>();
    let raf = 0;

    function frame() {
      if (!ctx) return;
      const w = cssSize.w;
      const h = cssSize.h;
      const t = performance.now() / 1000;

      if (autoSweep) {
        // Lissajous path so it wanders the whole frame.
        mouseRef.current = {
          x: w * (0.5 + 0.36 * Math.sin(t * 0.9)),
          y: h * (0.5 + 0.34 * Math.sin(t * 1.37 + 1)),
        };
        insideRef.current = true;
      }

      if (smoothRef.current.x === -9999) smoothRef.current = { ...mouseRef.current };
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * LERP;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * LERP;
      const mx = smoothRef.current.x;
      const my = smoothRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // Foreground: photoreal car, object-cover.
      if (img.complete && img.naturalWidth) {
        const ia = img.naturalWidth / img.naturalHeight;
        const ca = w / h;
        let sw = img.naturalWidth, sh = img.naturalHeight, sx = 0, sy = 0;
        if (ia > ca) { sw = img.naturalHeight * ca; sx = (img.naturalWidth - sw) / 2; }
        else { sh = img.naturalWidth / ca; sy = (img.naturalHeight - sh) / 2; }
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
      }

      // Punch liquid holes near the (smoothed) cursor.
      ctx.globalCompositeOperation = "destination-out";
      if (insideRef.current) {
        const pad = RADIUS + 40;
        const x0 = Math.floor((mx - pad) / PIXEL_SIZE) * PIXEL_SIZE;
        const x1 = Math.ceil((mx + pad) / PIXEL_SIZE) * PIXEL_SIZE;
        const y0 = Math.floor((my - pad) / PIXEL_SIZE) * PIXEL_SIZE;
        const y1 = Math.ceil((my + pad) / PIXEL_SIZE) * PIXEL_SIZE;
        for (let px = x0; px <= x1; px += PIXEL_SIZE) {
          for (let py = y0; py <= y1; py += PIXEL_SIZE) {
            const cx = px + PIXEL_SIZE / 2;
            const cy = py + PIXEL_SIZE / 2;
            const d = Math.hypot(cx - mx, cy - my);
            if (d < RADIUS + waterNoise(cx, cy, t)) pixelAlpha.set(`${px},${py}`, 1);
          }
        }
      }

      for (const [key, alpha] of pixelAlpha) {
        const na = alpha - TRAIL_DECAY;
        if (na < 0.02) { pixelAlpha.delete(key); continue; }
        pixelAlpha.set(key, na);
        const [px, py] = key.split(",").map(Number);
        ctx.globalAlpha = na;
        ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [photorealSrc]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
