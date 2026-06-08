# The Sublime — Bespoke Case-Study Page Design

**Date:** 2026-06-06
**Project:** `personal-website` · project detail page for "The Sublime" (`id: project-6`)
**Status:** Draft for review

> **Decision log:** 3D cold-open was prototyped (spike at `/sublime-spike`) and
> **rejected** — falling back to a real-footage cold-open. No 3D anywhere on the page.

---

## 1. Concept

AWL's detail page works because **the page embodies the game**: it's a *blade* —
black, monospace, rhythmic, and you literally *slice* to enter. Sharp and kinetic.

"The Sublime" is an open-world gliding exploration game **about climate change**.
Its page should be AWL's tonal opposite: **atmospheric, painterly, slow** — and
its emotional center is the *contemporary sublime* (Burke's awe fused with terror:
a beautiful world that is also under threat).

The page argues the game's own thesis — *make a player feel the weight of a
vanishing world without ever spelling it out.*

### Signature gesture: the world *sets into paint*

Where AWL's signature move is the **slice** (instant, violent), Sublime's is its
inverse: **the moving world freezes and resolves into the cover painting.** A few
seconds of gorgeous gliding footage of the living world, then it *sets* — like a
memory being preserved. The freeze is the entire message; nothing is stated.

---

## 2. Goals / Non-Goals

**Goals**
- A bespoke `heroStyle: "sublime"` renderer, peer to `AwlCinematic`.
- A cold-open → paint-bloom → painting-hero sequence that feels inevitable, not gimmicky.
- Tonal contrast with AWL (atmospheric/editorial vs. kinetic/blade) so the portfolio reads as *range*, not repetition.
- "Landscape stays the subject" expressed structurally — quiet, dissolving chrome.
- Reframe the case-study copy around the climate/sublime theme.

**Non-Goals**
- **No 3D / WebGL.** Prototyped and rejected. The page is real footage + painting + CSS/animejs.
- No new dependencies. Pure React + CSS + existing `animejs`.
- No change to AWL, the grid, or other project pages beyond a small shared extraction (§6).

---

## 3. Page Anatomy

```
① COLD OPEN     glide clip (pure beauty) ──paint-bloom──▶ cover painting
② HERO          full-bleed painting · "The Sublime" · climate-sublime line · [role · Unreal · USC IMGD] · scroll cue
③ THE QUESTION  one big centered statement — reframed around awe + climate
④ VISTA BEATS   2–3 full-bleed landscape moments (provided stills); chrome dissolves as you descend
⑤ THE GLIDE     signature interactive — scrubable glide-curve / traversal-feel beat
⑥ WHAT I BUILT  glide feel · diegetic HUD · pacing of awe moments (expandable list)
⑦ OUTCOME       painting band + playtest result
⑧ CREDITS       team · trailer link
```

### ① Cold open
- On mount: `heroVideo` glide clip autoplays (muted, `playsInline`, loop off), as a
  fixed full-viewport overlay above the hero. Content: **pure glide beauty** — the living
  world at its most gorgeous; the threat is implied only by the freeze.
- Resolve trigger: **whichever comes first** — clip `ended` (or a ~4–5s timer fallback)
  OR the user's first scroll/click intent. On trigger, run the paint-bloom (§5).
- After resolve, the overlay is gone and the page is freely scrollable. The painting
  hero (②) sits underneath and is what remains.
- A small, low-contrast **"skip"** affordance (top-right) fast-forwards the resolve.
- **Reduced motion / no-video fallback:** if `prefers-reduced-motion` or the clip is
  absent/fails, skip straight to the painting hero (no video, no bloom).

### ② Hero
- Full-bleed `sublime-splash-art-final.png`, gentle slow ken-burns drift (≤1.03 scale,
  disabled under reduced motion).
- Title lockup: "The Sublime" + a one-line climate-sublime framing line (§7).
- Metrics row (reuse AWL pattern): Role · Engine (Unreal) · Context (USC IMGD).
- Scroll cue (bob), fades in after the bloom settles.

### ③ The Question
- Centered hero statement, ~60vh, the rewritten `problem` copy (§7). Mirrors AWL's
  "The Question" section structurally but with the painterly type treatment.

### ④ Vista beats
- 2–3 full-bleed landscape sections built from provided stills (`narrativeBlocks` with
  a `media` entry).
- Each: a single image filling the viewport, a short line of environmental-storytelling
  copy, revealed on scroll. Image resolves from a soft blur/desaturation into clarity as
  it enters (the "awe reveal," echoing the paint-bloom in miniature).
- **Dissolving chrome:** the right-rail section nav + progress hairline (AWL pattern) are
  present early, then fade to near-zero opacity through the vista run, returning for the
  reading sections (⑥). This is the "landscape stays the subject" idea made literal.

### ⑤ The Glide
- The one **signature interactive**: a scrubable **glide-curve** — an SVG/Canvas2D plot of
  the glide (lift vs. descent / terminal velocity / recovery), draggable so a small glider
  marker traces it. Surfaces the *engineering* contribution ("tuned the glide curve,
  terminal velocity, recovery cadence") as something you can feel.
- Lightweight: SVG path + pointer scrub, no physics sim.
- Reduced-motion: render the curve statically with labeled annotations.

### ⑥ What I built
- Editorial reading section (reuse AWL's `SectionRow` / expandable pattern), contributions:
  glide & traversal feel · UI direction (diegetic HUD) · pacing of awe moments.

### ⑦ Outcome
- Full-bleed painting band (AWL "Outcome" pattern) with the playtest result and trailer CTA.

### ⑧ Credits
- Team + trailer link footer (AWL pattern).

---

## 4. Visual Language

| Token | Sublime | (AWL, for contrast) |
|-------|---------|---------------------|
| Background | deep atmospheric (near-black, warmer — e.g. `#0a0b0d`) | `#050505` flat black |
| Accent | derived from the painting (warm peach/gold or teal) — TBD from art | `#3b82f6` blue |
| Display type | a **serif** display for reverence/scale (contrast vs. AWL's clash/astronef) | astronef-std / clash |
| Body | keep `--font-mono`? **TBD** (§11) | `--font-mono` |
| Motion | slow, eased, atmospheric (800–1500ms) | fast, kinetic, rhythmic |

> Accent + type choices finalize once the real footage/stills are in hand.

---

## 5. The Paint-Bloom Transition (technical)

Layered, no canvas:

1. **Base layer:** `<video>` (glide clip), `object-cover`, full-viewport.
2. **Painting layer:** `<img>` of the cover, stacked above, revealed by animated
   **`mask`/`clip-path`** of organic brush origins that grow and overlap (several
   staggered "strokes," not one wipe), so the painting "paints over" the footage.
3. **Set ramp:** simultaneously, the video gets a filter ramp (`saturate` ↓, slight
   `blur` ↑, `contrast` nudge) so it "thickens" into paint as the strokes land.
4. **Settle:** title + framing line fade in 200–300ms after the last stroke.

Driven by `animejs` (already a dependency) on a timeline. Total ~1200–1600ms.
`will-change: mask-size, filter`; strokes stay on the compositor where possible.

**Why match the framing:** the closer the clip's last frame is to the painting's framing
and palette, the more the bloom reads as one scene crystallizing rather than a crossfade.
Worth choosing a glide clip whose final composition echoes the painting.

**Fallbacks:** reduced-motion or missing clip → painting shown immediately, no bloom.

---

## 6. Architecture & File Plan

Mirror the AWL feature folder, and extract the two genuinely-generic helpers AWL already
has so both features share them (targeted, in-scope cleanup).

```
src/components/detail/shared/
  Reveal.tsx        ← moved from details/awl/Reveal.tsx (scroll-reveal wrapper)
  InView.tsx        ← moved from details/awl/InView.tsx (lazy mount)

src/components/detail/details/sublime/
  SublimeCinematic.tsx   orchestrator (scroll loop, nav rail, progress bar, theme takeover)
  PaintBloomHero.tsx     ① cold-open video → paint-bloom → ② painting hero
  GlideCurve.tsx         ⑤ scrubable glide-curve interactive
  SublimeProse.tsx       ③ question, ④ vista beats, ⑥ contributions, ⑦ outcome, ⑧ credits
```

- Update AWL imports of `Reveal`/`InView` to the new `shared/` path (mechanical).
- `ProjectsDetail.tsx` (~line 1524): add a branch
  `if (project.heroStyle === "sublime") return <SublimeCinematic project={project} onBack={onBack} />;`

### Data model (`src/lib/detail-types.ts`)
- Extend the union: `heroStyle?: "full-bleed" | "editorial" | "minimal" | "awl" | "sublime";`
- Reuse existing `heroVideo?` for the glide clip — **no new field needed.**
- Vista beats: reuse `narrativeBlocks[].media` (already exists) to avoid widening the type.

### Content (`src/lib/detail-content.ts`, project-6)
- `heroStyle: "minimal"` → `"sublime"`.
- `heroVideo: "/sublime-glide.mp4"` (asset to be provided).
- Rewrite `problem` (§7); add vista `narrativeBlocks`; keep `contributions`, `outcome`,
  `team`, `links` (already strong).

---

## 7. Copy (draft — climate-reframed)

> All copy below is **draft** for your edit pass.

- **Hero framing line (under title):**
  *"An open world you fall in love with — built so you'll feel what it costs to lose it."*
- **The Question (rewritten `problem`):**
  *"How do you make a player feel awe and loss at the same time — the weight of a vanishing
  world — without ever saying the word 'climate'?"*
- **Vista beat captions:** TBD against the actual stills (1 short line each).

---

## 8. Motion & Accessibility

- Respect `prefers-reduced-motion` everywhere: no autoplay bloom, no ken-burns, no scrub
  animation — static painting + static curve with annotations.
- Video: `muted playsInline`, no audio dependency; `aria-hidden` (decorative), with the
  painting carrying real `alt`.
- Skip affordance is a real `<button>`; nav rail items are buttons (AWL pattern).
- Keyboard: glide-curve scrub operable via arrow keys, not pointer-only.
- Maintain heading order (`h1` title → `h2`/`h3` sections).

---

## 9. Asset Requirements

| Asset | Status |
|-------|--------|
| Cover painting (freeze target + hero) | ✅ `public/images/sublime-splash-art-final.png` |
| Glide clip (3–5s pure-beauty glide, muted, mp4/webm) | ⬜ **needed** → `public/sublime-glide.mp4` |
| 2–3 hi-res landscape stills for vista beats | ⬜ **needed** (user providing footage/stills) |
| Trailer | ✅ YouTube `2y-O1_GfOMk` |
| Accent color + final type pairing | ⬜ derive from painting once assets land |

---

## 10. Build Sequence

Built in dependency order so the riskiest beat proves out first:

1. **Shared extraction** — move `Reveal`/`InView` to `detail/shared/`, repoint AWL. (No visual change; verify AWL still works.)
2. **Routing + data** — add `"sublime"` to the type, flip project-6, stub `SublimeCinematic`.
3. **① + ② Cold-open → paint-bloom → hero** (the vertical slice). Prototype with a placeholder clip until the real one lands.
4. **③ The Question** + dissolving-chrome scaffolding (nav rail, progress bar).
5. **④ Vista beats** (needs stills).
6. **⑤ Glide-curve interactive.**
7. **⑥–⑧ Prose, outcome, credits.**
8. **Copy pass + accent/type finalize** against real assets.

Each step verified in the running dev server before the next.

---

## 11. Open Questions / TBDs

1. **Body type:** keep `--font-mono` for cohesion with the rest of the site, or move to a
   humanist sans for warmth? (Leaning: serif display + mono body, for restraint.)
2. **Vista count:** 2 or 3 — depends on how many strong stills exist.
3. **Glide-curve fidelity:** illustrative curve vs. values pulled from the real tuning. Do
   you have the actual numbers (terminal velocity, recovery cadence)?
4. **Accent color:** pulled from the painting — pick once the art is in front of us.
5. **Cold-open length / loop:** single play then resolve, or subtle loop until scroll?

---

## 12. Self-Review Notes

- No placeholders left except explicitly-flagged asset/copy TBDs (§7, §9, §11), which are
  genuinely blocked on user-provided material.
- Scope is one page + one small shared extraction — fits a single implementation plan.
- Consistent throughout: "atmospheric inverse of AWL," "landscape stays the subject,"
  "the world sets into paint" all reinforce one thesis.
- 3D was considered and explicitly rejected (see decision log at top) — the cold-open is
  real footage, keeping the page craft within reliable, high-quality reach.
