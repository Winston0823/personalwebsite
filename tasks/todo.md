# Motion Design System — Implementation Plan

Goal: turn 50+ well-crafted but component-scoped animations into one coherent
motion *system* with a shared physical vocabulary.

## Phase 1 — Motion token layer (foundation)
- [ ] Create `src/lib/motion.ts` — DUR, EASE (css/anime/points), LERP, STAGGER, prefersReducedMotion()
- [ ] Add `--ease-*` / `--dur-*` CSS custom properties to globals.css `:root`
- [ ] Refactor shared motion consumers onto tokens:
  - [ ] DetailOverlay.tsx (FLIP open/close/fullscreen)
  - [ ] WidgetShell.tsx (entrance)
  - [ ] Reveal.tsx (scroll reveal)
  - [ ] WidgetDrawer.tsx (slide)
  - [ ] CustomCursor.tsx (RING_EASE → LERP.cursor)
  - [ ] page.tsx (trash disintegrate)
  - [ ] TrashZone.tsx (ripple/pulse)
- [ ] Refactor core CSS transitions to `var(--ease-*)`/`var(--dur-*)`

## Phase 2 — Spatial continuity
- [ ] Drawer item → grid cell FLIP on drop (replace fade-into-place)
- [ ] Symmetric open/close paths (close retraces open)

## Phase 3 — Signature gesture (dot grid reacts to events)
- [ ] Expose an imperative pulse/ripple API on DotGridBackground
- [ ] Panel open → ripple from origin; widget discard → pulse
- [ ] Respect reduced motion

## Phase 4 — Fill flat spots (inherit the system)
- [ ] Project grid cards — richer, token-driven hover
- [ ] Links — consistent motion affordance
- [ ] Mobile — align timing/easing to tokens

## Phase 5 — Cold-open choreography
- [ ] Orchestrated first-load: background → grid → cursor → ticker

## Verification
- [ ] tsc --noEmit clean
- [ ] dev server compiles, HTTP 200, no console errors
- [ ] Log decisions to Obsidian vault

## Review

All five phases implemented and verified.

**Phase 1 — token layer.** New `src/lib/motion.ts` (DUR, EASE{css/anime/points},
LERP, STAGGER, prefersReducedMotion) mirrored by `--ease-*`/`--dur-*` CSS vars in
`:root`. The three signature curves (pop/reveal/exit) were already the de-facto
standard — named them and swept 12 literal cubic-beziers in globals.css onto the
vars (skipping the token defs). JS consumers refactored: DetailOverlay, WidgetShell,
Reveal, TrashZone, CustomCursor (RING_EASE → LERP.cursor). Bespoke physics (drawer
spring, trash disintegrate, easeOutExpo entrance) left intentionally as-is.

**Phase 2 — spatial continuity.** Drawer→grid drops now FLIP from the drop point
into the settled cell via a one-shot `flip-drops.ts` hand-off (previously they just
popped in — skipEntrance no-op). DetailOverlay close now *retraces* the open FLIP
back into the origin widget in popup mode (fullscreen keeps the gentle scale-down).
Fixed a stale-closure bug: moved `caseStudyMode` above `handleClose` + added to deps.

**Phase 3 — signature gesture.** Dot grid reacts to events via `grid-ripple.ts`
bus (window CustomEvent). A gaussian wavefront is applied crisply on top of the
lerped cursor spotlight. Fires on: panel open (from widget center), discard, and
drawer drop. Reduced-motion drops ripples grid-side. Verified live: lit-dot alpha
7308 → 41767 → 6552 (wave passes, settles back to rest).

**Phase 4 — flat spots.** Project cards / mobile / hero already inherited the token
sweep. Added an opt-in `.link-nudge` (token-timed 3px lean) to the plain contact
text links. Left circular icon-button links alone (restraint).

**Phase 5 — cold-open.** First desktop paint emits a center ripple (220ms in) so the
dot grid "wakes" in concert with the widget stagger. Reuses the Phase 3 bus.

**Verification:** `tsc --noEmit` clean; dev server HTTP 200, no app console errors
(only a pre-existing favicon 404); live Playwright walkthrough confirmed tokens in
DOM, ripple physics, and FLIP open/settle/close. Drawer-drop FLIP is typechecked +
shares the verified FLIP pattern (dnd-kit synthetic drag is unreliable to automate).

Files added: src/lib/motion.ts, src/lib/flip-drops.ts, src/lib/grid-ripple.ts
Files changed: globals.css, DetailOverlay, WidgetShell, Reveal, TrashZone,
CustomCursor, DotGridBackground, ContactDetail, page.tsx
