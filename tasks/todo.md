# AWL Cinematic Project Page

A 3-act interactive experience that replaces the AWL project page entry.
Only AWL (`project-5`) uses it; other projects keep `heroStyle: "minimal"`.

## Acts
1. **Heart-slice hero** — black bg tiled with repeating red "ASSASSINS WEAKNESS IS LOVE".
   A floating heart sits center. Scroll is locked until the user slashes (pointer
   drag) through the heart. The heart survives; the *background* splits along the
   slash angle and the two halves retract/slide away perpendicular to the slash,
   revealing Act 2 behind it. Scroll unlocks.
2. **Demo reel hero** — `awl-demo.mp4` full-bleed, muted/looping/autoplay,
   pointer-events:none (pure background). Half-opaque overlay text "Love only gets
   in the way". This screen is `sticky` so Act 3 parallax-scrolls over it.
3. **Katana section** — black. Procedural Three.js katana (R3F + drei) floats and
   spins on the right half; on scroll its position drifts toward screen center.
   Left half holds the existing AWL prose (premise, narrative blocks,
   contributions, outcome, credits, links).

## Tasks
- [ ] Install `three`, `@react-three/fiber`, `@react-three/drei`
- [ ] Copy AWL Video.mp4 -> public/awl-demo.mp4  (DONE)
- [ ] Add `heroStyle: "awl"` to detail-types union + AWL data entry
- [ ] Branch ProjectCaseStudy -> AwlCinematic for heroStyle "awl"
- [ ] AwlCinematic orchestrator: fullscreen panel, scroll-lock, scroll progress, back btn
- [ ] HeartSliceHero (Act 1 + 2 share one sticky stage): tiled text, heart, slash gesture, half-plane clip + perpendicular retract
- [ ] KatanaCanvas (dynamic, ssr:false): procedural katana, float/spin, scroll-driven x→center, red rim light
- [ ] AwlProse: reuse minimal mono styling for left-column content
- [ ] Verify: dev server, browser walk-through (slash works, reveal, parallax, katana)

## Review
All acts built, typecheck clean, dev server runs, verified end-to-end in a
headless browser walk-through (open Projects → AWL → drag-slash → reveal →
scroll to katana). Zero console/page errors.

Files added:
- src/components/detail/details/awl/AwlCinematic.tsx (orchestrator)
- src/components/detail/details/awl/HeartSliceHero.tsx (Act 1: slash + half-plane clip)
- src/components/detail/details/awl/KatanaCanvas.tsx (Act 3: procedural R3F katana)
- src/components/detail/details/awl/AwlProse.tsx (Act 3 left-column prose)
Files changed:
- src/lib/detail-types.ts (+ "awl" heroStyle)
- src/lib/detail-content.ts (AWL → heroStyle "awl")
- src/components/detail/details/ProjectsDetail.tsx (branch to AwlCinematic)
- src/app/globals.css (awl panel theme, padding reset, heart keyframes)
- public/awl-demo.mp4 (copied from ~/Downloads/AWL Video.mp4)

Screenshots: qa/awl-act1-hero.png, awl-act2-slicing.png, awl-act2-revealed.png,
awl-act3-katana.png, awl-act3-bottom.png

Follow-ups (optional):
- Compress public/awl-demo.mp4 (68 MB is heavy for a web background)
- Touch verification for the slash on mobile (pointer events already used; untested on a real touch device)
- prefers-reduced-motion path (heartbeat/bob/spin currently always animate)
