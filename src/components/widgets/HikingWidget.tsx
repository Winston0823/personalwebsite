"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { hikingPhotos, hikingEyebrow } from "@/lib/hiking-content";

/* Compact grid tile — a teaser for the full-screen water experience.
   The hero hike photo sits under a creek tint; a cheap Canvas-2D layer drifts
   soft caustic light and spawns ripple rings under the cursor. Clicking the
   tile expands (via WidgetShell → DetailOverlay) into HikingDetail's WebGL
   water. Kept deliberately light: a few screen-blended blobs + fading rings,
   no per-pixel work, paused when offscreen or when the user prefers less motion. */

interface Ripple { x: number; y: number; t: number; }
interface Blob { x: number; y: number; r: number; vx: number; vy: number; }

export default function HikingWidget() {
  const hero = hikingPhotos[0];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    const ro = new ResizeObserver(() => {
      const r = root.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    ro.observe(root);

    // drifting caustic blobs
    const blobs: Blob[] = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random(), y: Math.random(), r: 0.18 + (i % 3) * 0.06,
      vx: (Math.random() - 0.5) * 0.00006, vy: (Math.random() - 0.5) * 0.00006,
    }));
    const ripples: Ripple[] = [];

    function onMove(e: MouseEvent) {
      const r = root!.getBoundingClientRect();
      // throttle: only seed a ripple every so often via probability
      if (Math.random() < 0.35) {
        ripples.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, t: 0 });
        if (ripples.length > 12) ripples.shift();
      }
    }
    // listen on root without stopping propagation so the shell's click-to-expand still fires
    if (!reduce) root.addEventListener("mousemove", onMove);

    let raf = 0, last = performance.now(), running = true;
    function frame(now: number) {
      const dt = Math.min(48, now - last); last = now;
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "screen";

      // caustic blobs
      for (const b of blobs) {
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < -0.2 || b.x > 1.2) b.vx *= -1;
        if (b.y < -0.2 || b.y > 1.2) b.vy *= -1;
        const cx = b.x * w, cy = b.y * h, rad = b.r * Math.max(w, h);
        const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, "rgba(150,200,205,0.16)");
        g.addColorStop(1, "rgba(150,200,205,0)");
        ctx!.fillStyle = g;
        ctx!.beginPath(); ctx!.arc(cx, cy, rad, 0, Math.PI * 2); ctx!.fill();
      }

      // ripple rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.t += dt / 1100;
        if (rp.t >= 1) { ripples.splice(i, 1); continue; }
        const rad = rp.t * 0.5 * Math.max(w, h);
        ctx!.strokeStyle = `rgba(220,240,245,${(1 - rp.t) * 0.5})`;
        ctx!.lineWidth = 1.4 * (1 - rp.t) + 0.3;
        ctx!.beginPath(); ctx!.arc(rp.x * w, rp.y * h, rad, 0, Math.PI * 2); ctx!.stroke();
      }
      ctx!.globalCompositeOperation = "source-over";
      if (running) raf = requestAnimationFrame(frame);
    }

    // pause when offscreen
    const io = new IntersectionObserver((es) => {
      const vis = es[0]?.isIntersecting;
      if (vis && !running && !reduce) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!vis) { running = false; cancelAnimationFrame(raf); }
    }, { threshold: 0.05 });
    io.observe(root);

    if (reduce) { raf = requestAnimationFrame((t) => frame(t)); running = false; } // one static frame
    else raf = requestAnimationFrame(frame);

    return () => {
      running = false; cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      root.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div ref={rootRef} className="relative w-full h-full overflow-hidden rounded-lg">
      <Image
        src={hero.src}
        alt={hero.alt}
        fill
        sizes="(max-width: 1200px) 40vw, 320px"
        className="object-cover"
        priority={false}
      />
      {/* creek tint — pushes the photo "underwater" and lifts text legibility */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(150deg, rgba(20,52,48,0.45), rgba(8,26,30,0.78) 80%)" }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* label */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-1 pointer-events-none">
        <span
          className="uppercase"
          style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.16em", color: "rgba(255,255,255,0.7)" }}
        >
          {hikingEyebrow}
        </span>
        <div className="flex items-end justify-between">
          <span
            className="font-extrabold leading-none text-white"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 3.2vw, 34px)", letterSpacing: "-0.02em", textShadow: "0 2px 18px rgba(0,0,0,0.4)" }}
          >
            Hiking
          </span>
          <span
            className="uppercase"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.14em", color: "rgba(255,255,255,0.78)" }}
          >
            dive in →
          </span>
        </div>
      </div>
    </div>
  );
}
