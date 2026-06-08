# USC Formula Electric — bespoke interactive case study ("The Unveiling")

**Date:** 2026-06-07
**Goal:** Turn the generic full-bleed USC case study into an AWL-class interactive
experience that *demonstrates design thinking* — built to help land a UI/UX **designer**
role. North star: every beat should read as a design decision, not a feature list.

## Why
The generic template is passive. AWL earns its page with (1) an interactive gate, (2) a
reveal, (3) a signature object. USC has perfect raw material discovered in the real repo:
the hero is **two cars in one** — a photoreal render that **pixel-dissolves into a
holographic wireframe** of the same car (`PixelRevealOverlay`, water-rippled erase + 1.5s
trail + gold click-pulse), wrapped in pulse-glow / cyber-grid / scanlines / glass telemetry
cards / mouse-tilt + scroll parallax. That layered compositing IS the portfolio moment.

## Approved decisions
- **Curtain look:** cardinal-red velvet + gold trim/tassels over a black stage.
- **Realism technique:** procedural velvet folds (CSS/SVG light/dark vertical bands that
  bunch/compress as pulled) — no heavy photo asset.
- **Two-layer display:** static **side-by-side** (photoreal | holographic) PLUS a shrunken
  **live "liquid pixels" demo** mini-screen next to them (port of PixelRevealOverlay).

## Structure — three acts
**Act 1 — Curtain reveal (interactive gate).** Scroll-locked. Cardinal velvet drapes shut
over a black stage, gold wordmark peeking through the seam. User drags both panels apart
(folds gather, gold seam glows); past threshold they snap open, scroll unlocks, the live
hero (`usc-racing-hero.png`) sits revealed behind with a gold glow. Reduced-motion / no-drag
fallback: a "pull to reveal" auto-opens or a skip affordance.

**Act 2 — "Two cars, one hero" (centerpiece).** Side-by-side framed panels:
`hero-photoreal.png` ("the render the world sees") | `hero-holographic.png` ("the
engineering underneath"), with a shrunken `PixelLiquidDemo` beside them (hover to dissolve;
auto-sweep on touch). Copy explains *why* the dissolve exists (form ↔ engineering = team
identity).

**Act 3 — Decisions, not features.** 3–4 decision narratives (problem → options → the call
→ result): the two-layer hero; giving 10 divisions *personalities* not a directory; motion
that respects the reader (Lenis + reduced-motion); the glass-telemetry spec system. Then
count-up stats + the loud "see it live" CTA (existing `project.cta`).

## Architecture (mirror AWL/Sublime)
- `detail-types.ts`: add `"usc"` to `heroStyle` union.
- `detail-content.ts`: USC entry `heroStyle: "full-bleed"` → `"usc"`.
- `ProjectsDetail.tsx`: `if (heroStyle === "usc") return <UscCinematic .../>` + import.
- `globals.css`: `body[data-detail-theme="usc"]` block (dark panel, padding reset) like awl.
- New `src/components/detail/details/usc/`:
  - `UscCinematic.tsx` — orchestrator: sets theme + fullscreen, scroll-lock until curtain
    opens, sequences Act 1→2→3, reuses shared `Reveal`/`InView`.
  - `CurtainReveal.tsx` — draggable cardinal-velvet procedural-fold gate; `onOpened` cb.
  - `LayerShowcase.tsx` — side-by-side photoreal|holographic + `PixelLiquidDemo`.
  - `PixelLiquidDemo.tsx` — shrunken port of PixelRevealOverlay (PIXEL_SIZE~8, RADIUS~70),
    hover-erase reveal, auto-sweep when `(hover: none)`.
  - `UscProse.tsx` — Act 3 decision narratives + stats + CTA.

## Assets (already extracted → public/images/usc-racing/)
- `hero-photoreal.png` 1600×900 — foreground render.
- `hero-holographic.png` 1600×900 — wireframe layer (identical framing → dissolve registers).
- `usc-racing-hero.png` — composed hero (curtain reveal target).
- `usc-racing-aero.png`, `usc-racing-sponsorship.png` — supporting shots for Act 3.

## Verification
typecheck + dev compile clean; chrome-devtools walkthrough: open USC → drag curtains open →
Act 2 side-by-side + hover the liquid demo → Act 3 decisions → CTA. Zero console errors;
screenshots to `qa/usc-racing/cine-*.png`.

## Open TODOs (placeholders)
- `cta.url` real deployed URL; `date` real build window.
