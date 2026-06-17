"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { isPerfLite } from "@/lib/perf-tier";
import {
  GRID_RIPPLE_EVENT,
  GRID_GLOW_EVENT,
  GLOW_WARM,
  type GridRippleDetail,
  type GridGlowDetail,
} from "@/lib/grid-ripple";

const DOT_SPACING = 40; // px between dots
const DOT_BASE_RADIUS = 1.5; // inactive dot size
const DOT_MAX_RADIUS = 5; // active dot size at cursor center
const INFLUENCE_RADIUS = 180; // px — how far the spotlight reaches
const BASE_OPACITY = 0.08; // barely visible when inactive
const MAX_OPACITY = 0.35; // fully active
const DOT_COLOR = { r: 180, g: 172, b: 164 }; // warm grey
const LERP_SPEED = 0.08; // smooth follow speed

// Event ripples — a wavefront that briefly lifts dots as it passes, applied
// crisply on top of the smoothly-lerped cursor spotlight (not lerped toward,
// so the ring stays sharp). See emitGridRipple / GRID_RIPPLE_EVENT.
const RIPPLE_SPEED = 0.95; // px per ms — wavefront expansion rate
const RIPPLE_WIDTH = 70; // px — ring thickness (gaussian falloff)
const RIPPLE_LIFE = 1100; // ms — lifetime before the ripple is pruned

type Ripple = {
  x: number;
  y: number;
  start: number;
  strength: number;
  // Personality: wavefront tint + shape, defaulted from the constants above.
  color: readonly [number, number, number];
  speed: number;
  width: number;
  life: number;
};

const DOT_RGB: readonly [number, number, number] = [DOT_COLOR.r, DOT_COLOR.g, DOT_COLOR.b];

// Drag-follow glow defaults — a sustained warm pool under a dragged widget.
const GLOW_RADIUS = 200; // px reach if the caller doesn't size it to the widget
const GLOW_STRENGTH = 0.7; // peak amplitude of the pool
const GLOW_FADE = 0.16; // per-frame lerp for amplitude in/out
const GLOW_TRACK = 0.28; // per-frame lerp for the pool chasing the widget

type GlowTarget = {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  strength: number;
  color: readonly [number, number, number];
};

export default function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const dotsRef = useRef<{ x: number; y: number; currentScale: number; currentOpacity: number }[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  // Drag glow: `target` is set by drag events; `state` is the smoothed pool the
  // renderer actually draws (lerps position + amplitude for soft track/fade).
  const glowTargetRef = useRef<GlowTarget>({ active: false, x: -1000, y: -1000, radius: GLOW_RADIUS, strength: GLOW_STRENGTH, color: GLOW_WARM });
  const glowStateRef = useRef({ x: -1000, y: -1000, amp: 0 });
  const rafRef = useRef<number>(0);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Weak devices: thin out the grid (fewer dots = fewer per-frame iterations),
    // pin DPR to 1 (a full-screen canvas at 2x is 4x the fill cost), and skip
    // the per-dot radial-gradient halo below (object churn + extra fills).
    const lite = isPerfLite();
    const spacing = lite ? 64 : DOT_SPACING;

    const dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 2);
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
      const cols = Math.ceil(w / spacing) + 1;
      const rows = Math.ceil(h / spacing) + 1;
      const offsetX = (w - (cols - 1) * spacing) / 2;
      const offsetY = (h - (rows - 1) * spacing) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: offsetX + c * spacing,
            y: offsetY + r * spacing,
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

      // Prune expired ripples; keep the loop alive while any are active.
      const now = performance.now();
      const ripples = ripplesRef.current;
      for (let k = ripples.length - 1; k >= 0; k--) {
        if (now - ripples[k].start > ripples[k].life) ripples.splice(k, 1);
      }
      const hasRipples = ripples.length > 0;
      if (hasRipples) anyAnimating = true;

      // Advance the drag glow: amplitude fades toward target (0 when released),
      // position chases the widget. Drawn as a sustained, smoothly-moving pool.
      const gt = glowTargetRef.current;
      const gs = glowStateRef.current;
      const targetAmp = gt.active ? gt.strength : 0;
      gs.amp += (targetAmp - gs.amp) * GLOW_FADE;
      if (gt.active) {
        gs.x += (gt.x - gs.x) * GLOW_TRACK;
        gs.y += (gt.y - gs.y) * GLOW_TRACK;
      }
      const glowOn = gs.amp > 0.01;
      if (glowOn) anyAnimating = true;
      const glowR = gt.radius || GLOW_RADIUS;
      const glowR2 = glowR * glowR;

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

        // Event ripple boost — a gaussian ring at radius (elapsed * speed),
        // decaying over the ripple's life. Applied crisply on top of the
        // lerped spotlight so wavefronts stay sharp. Each ripple also drags the
        // dot's color toward its tint, weighted by how strongly it's hit — so a
        // red discard wave reads red, a gold case-study wave reads gold.
        let boost = 0;
        let tintR = 0, tintG = 0, tintB = 0, tintW = 0;
        if (hasRipples) {
          for (let r = 0; r < ripples.length; r++) {
            const rp = ripples[r];
            const elapsed = now - rp.start;
            const front = elapsed * rp.speed;
            const rdx = dot.x - rp.x;
            const rdy = dot.y - rp.y;
            const rd = Math.sqrt(rdx * rdx + rdy * rdy);
            const off = (rd - front) / rp.width;
            const ring = Math.exp(-off * off);
            const decay = 1 - elapsed / rp.life;
            const contrib = rp.strength * decay * ring;
            boost += contrib;
            tintR += rp.color[0] * contrib;
            tintG += rp.color[1] * contrib;
            tintB += rp.color[2] * contrib;
            tintW += contrib;
          }
        }

        // Drag glow — a smooth sustained pool (eased falloff, lerped position),
        // folded into the same boost/tint accumulation as ripples.
        if (glowOn) {
          const gdx = dot.x - gs.x;
          const gdy = dot.y - gs.y;
          const gd2 = gdx * gdx + gdy * gdy;
          if (gd2 < glowR2) {
            const gd = Math.sqrt(gd2);
            const gi = 1 - gd / glowR;
            const contrib = gi * gi * gs.amp; // soft quadratic falloff
            boost += contrib;
            tintR += gt.color[0] * contrib;
            tintG += gt.color[1] * contrib;
            tintB += gt.color[2] * contrib;
            tintW += contrib;
          }
        }

        if (boost > 1) boost = 1;

        const drawScale = boost > 0 ? Math.min(1, dot.currentScale + boost) : dot.currentScale;
        const drawOpacity =
          boost > 0
            ? Math.min(MAX_OPACITY, dot.currentOpacity + boost * (MAX_OPACITY - BASE_OPACITY))
            : dot.currentOpacity;

        // Resolve the dot's render color: warm-grey base lerped toward the
        // (boost-weighted) average ripple tint.
        let colR = DOT_RGB[0], colG = DOT_RGB[1], colB = DOT_RGB[2];
        if (tintW > 0) {
          const wr = tintR / tintW, wg = tintG / tintW, wb = tintB / tintW;
          colR = DOT_RGB[0] + (wr - DOT_RGB[0]) * boost;
          colG = DOT_RGB[1] + (wg - DOT_RGB[1]) * boost;
          colB = DOT_RGB[2] + (wb - DOT_RGB[2]) * boost;
        }

        // Skip drawing dots indistinguishable from rest
        if (drawScale < 0.01 && Math.abs(drawOpacity - BASE_OPACITY) < 0.005) {
          // Still need the base dot drawn
          ctx.fillStyle = `rgba(${DOT_COLOR.r}, ${DOT_COLOR.g}, ${DOT_COLOR.b}, ${BASE_OPACITY})`;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, DOT_BASE_RADIUS, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        const radius = DOT_BASE_RADIUS + (DOT_MAX_RADIUS - DOT_BASE_RADIUS) * drawScale;
        const cR = colR | 0, cG = colG | 0, cB = colB | 0;

        // Radial glow effect — only when meaningfully scaled. Skipped on weak
        // devices: createRadialGradient allocates a gradient object per dot per
        // frame and adds a second (large) fill pass — the grid's heaviest cost.
        if (!lite && drawScale > 0.05) {
          const gradient = ctx.createRadialGradient(
            dot.x, dot.y, 0,
            dot.x, dot.y, radius * 2.5
          );
          gradient.addColorStop(0, `rgba(${cR}, ${cG}, ${cB}, ${drawOpacity * 0.4})`);
          gradient.addColorStop(1, `rgba(${cR}, ${cG}, ${cB}, 0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, radius * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = `rgba(${cR}, ${cG}, ${cB}, ${drawOpacity})`;
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

    // Pause the loop entirely on hidden tabs; repaint the resting grid on return.
    function handleVisibility() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafRef.current);
      } else {
        ensureRunning();
      }
    }

    // Reduced motion: keep the ambient cursor spotlight, but skip event
    // ripples (autonomous, attention-grabbing motion the user opted out of).
    const allowRipples = !prefersReducedMotion();
    function handleRipple(e: Event) {
      if (!allowRipples) return;
      const d = (e as CustomEvent<GridRippleDetail>).detail ?? ({} as GridRippleDetail);
      if (typeof d.x !== "number" || typeof d.y !== "number") return;
      ripplesRef.current.push({
        x: d.x,
        y: d.y,
        start: performance.now(),
        strength: d.strength ?? 1,
        color: d.color ?? DOT_RGB,
        speed: d.speed ?? RIPPLE_SPEED,
        width: d.width ?? RIPPLE_WIDTH,
        life: d.life ?? RIPPLE_LIFE,
      });
      ensureRunning();
    }

    function handleGlow(e: Event) {
      if (!allowRipples) return; // same reduced-motion opt-out as ripples
      const d = (e as CustomEvent<GridGlowDetail>).detail;
      const g = glowTargetRef.current;
      if (!d || !d.active) {
        g.active = false; // amplitude lerps to 0 in the loop, then settles out
        ensureRunning();
        return;
      }
      if (typeof d.x === "number" && typeof d.y === "number") {
        // First activation: teleport the pool so it doesn't streak in from rest.
        if (!g.active) {
          glowStateRef.current.x = d.x;
          glowStateRef.current.y = d.y;
        }
        g.active = true;
        g.x = d.x;
        g.y = d.y;
        g.radius = d.radius ?? GLOW_RADIUS;
        g.strength = d.strength ?? GLOW_STRENGTH;
        g.color = d.color ?? GLOW_WARM;
        ensureRunning();
      }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener(GRID_RIPPLE_EVENT, handleRipple);
    window.addEventListener(GRID_GLOW_EVENT, handleGlow);

    resize();
    ensureRunning(); // initial paint of the resting grid

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener(GRID_RIPPLE_EVENT, handleRipple);
      window.removeEventListener(GRID_GLOW_EVENT, handleGlow);
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
