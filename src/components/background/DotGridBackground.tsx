"use client";

import { useEffect, useRef } from "react";

const DOT_SPACING = 40; // px between dots
const DOT_BASE_RADIUS = 1.5; // inactive dot size
const DOT_MAX_RADIUS = 5; // active dot size at cursor center
const INFLUENCE_RADIUS = 180; // px — how far the spotlight reaches
const BASE_OPACITY = 0.08; // barely visible when inactive
const MAX_OPACITY = 0.35; // fully active
const DOT_COLOR = { r: 180, g: 172, b: 164 }; // warm grey
const LERP_SPEED = 0.08; // smooth follow speed

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef<{ x: number; y: number; currentScale: number; currentOpacity: number }[]>([]);
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;

    function resize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dprRef.current;
      canvas.height = h * dprRef.current;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      buildDots(w, h);
    }

    function buildDots(w: number, h: number) {
      const dots: typeof dotsRef.current = [];
      const cols = Math.ceil(w / DOT_SPACING) + 1;
      const rows = Math.ceil(h / DOT_SPACING) + 1;
      const offsetX = (w - (cols - 1) * DOT_SPACING) / 2;
      const offsetY = (h - (rows - 1) * DOT_SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: offsetX + c * DOT_SPACING,
            y: offsetY + r * DOT_SPACING,
            currentScale: 0,
            currentOpacity: BASE_OPACITY,
          });
        }
      }
      dotsRef.current = dots;
    }

    let running = false;
    const SETTLE_EPS = 0.005;
    // Squared influence radius — avoids per-dot sqrt during the cull check
    const INFLUENCE_R2 = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

    function animate() {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dprRef.current, dprRef.current);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dots = dotsRef.current;
      let anyAnimating = false;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = dot.x - mx;
        const dy = dot.y - my;
        const dist2 = dx * dx + dy * dy;

        // Cull dots well outside influence; treat them as resting at base
        let targetScale: number;
        let targetOpacity: number;
        if (dist2 > INFLUENCE_R2) {
          targetScale = 0;
          targetOpacity = BASE_OPACITY;
        } else {
          const dist = Math.sqrt(dist2);
          const influence = 1 - dist / INFLUENCE_RADIUS;
          const easedInfluence = influence * influence * influence;
          targetScale = easedInfluence;
          targetOpacity = BASE_OPACITY + (MAX_OPACITY - BASE_OPACITY) * easedInfluence;
        }

        const delayFactor = LERP_SPEED * (0.5 + 0.5 * Math.max(0, targetScale));
        dot.currentScale += (targetScale - dot.currentScale) * delayFactor;
        dot.currentOpacity += (targetOpacity - dot.currentOpacity) * delayFactor;

        // Track whether anything is still meaningfully animating
        if (
          Math.abs(targetScale - dot.currentScale) > SETTLE_EPS ||
          Math.abs(targetOpacity - dot.currentOpacity) > SETTLE_EPS
        ) {
          anyAnimating = true;
        }

        // Skip drawing dots indistinguishable from rest
        if (dot.currentScale < 0.01 && Math.abs(dot.currentOpacity - BASE_OPACITY) < 0.005) {
          // Still need the base dot drawn
          ctx.fillStyle = `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, ${BASE_OPACITY})`;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, DOT_BASE_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        const radius = DOT_BASE_RADIUS + (DOT_MAX_RADIUS - DOT_BASE_RADIUS) * dot.currentScale;

        // Radial glow effect — only when meaningfully scaled
        if (dot.currentScale > 0.05) {
          const gradient = ctx.createRadialGradient(
            dot.x, dot.y, 0,
            dot.x, dot.y, radius * 2.5
          );
          gradient.addColorStop(0, `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, ${dot.currentOpacity * 0.4})`);
          gradient.addColorStop(1, `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, ${dot.currentOpacity})`;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      if (anyAnimating) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        running = false;
      }
    }

    function ensureRunning() {
      if (running) return;
      running = true;
      rafRef.current = requestAnimationFrame(animate);
    }

    function handleMouseMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      ensureRunning();
    }

    function handleMouseLeave() {
      mouseRef.current = { x: -1000, y: -1000 };
      ensureRunning();
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);

    resize();
    ensureRunning(); // initial paint of the resting grid

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
