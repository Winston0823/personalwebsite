# Mobile Experience Overhaul — Audit & Plan (2026-06-14)

## Namecard line-to-arrow motion — 2026-11-18

- [x] Animate the existing doggo ring as one hand-drawn stroke whose head reaches the email before its tail follows.
- [x] Rewind on pointer exit, support keyboard focus and reduced motion, and keep the geometry responsive.
- [x] Inspect the idle and active states in the preview, run a production build, and leave the work on a separate branch.

Design: The oval begins and ends at a point whose tangent leads toward the email. Its leading end extends on a curved route and grows an arrowhead; the trailing end unwraps the oval after a short delay. Reversing the same timeline wraps the line back around doggo. Use SVG stroke lengths and direct DOM updates so there are no React renders per animation frame.

Review: Browser inspection confirmed an intact idle ring, a final arrow pointing to the email, and a complete rewind after pointer exit. Keyboard focus triggered the same motion. The SVG path is measured against the live card/doggo/email positions and resized with them; reduced-motion preference jumps directly between the two states. TypeScript, diff check, production build, and localhost response passed. The preview branch is `codex/namecard-arrow-motion`.

### Smooth oval-to-arrow join

- [x] Rebuild the oval around a seam whose tangent points toward the email; align the route’s first control point to that tangent.
- [x] Inspect the join in motion and at rest, then run the build and refresh the branch preview.

Review: The new seam sits where the oval's outgoing tangent aims toward the email, and the route's first Bézier handle follows that tangent. Browser inspection showed a flowing join during the transition, a curved final arrow, and a complete rewind. TypeScript, production build, diff check, and the restarted localhost preview passed.

## Contact namecard — 2026-11-18

- [x] Replace the oversized contact callout with a linked namecard showing name, email, and doggo.
- [x] Add a restrained navy-and-ink hover/focus motion and responsive layout.
- [x] Balance the space above and below the card and tighten name/email spacing.
- [x] Verify desktop layout and interaction styles, responsive CSS, and production build.

Design: Keep the established navy accent, Zodiak/Plus Jakarta pairing, and original doggo sprite. Make the entire card one accessible email link; hover animates the doggo outline and email underline once, with reduced-motion support.

Review: Browser inspection showed the card's 64px desktop margins produce roughly equal visible gaps above and below the panel. The accessible email link contains only name, email, and the decorative doggo. TypeScript, diff check, and production build passed; the restarted preview returns HTTP 200. The mobile layout is covered by the existing 767px media query but was not visually inspected because this browser does not expose viewport resizing.

## Final typography selection — 2026-11-18

- [x] Set Zodiak as the fixed studio display face and Plus Jakarta Sans as the fixed body face.
- [x] Remove the Type lab trigger, drawer, persistence logic, and preview-only font styles.
- [x] Check Work, About, and Sandbox typography, run the build, and restore the preview.

Design: Use the two selected local fonts from the screenshot as the studio defaults. Keep the handwritten name animation and utilitarian mono labels as intentional exceptions.

Review: The production build, TypeScript check, and diff check passed. Browser computed styles show Zodiak on headings and Plus Jakarta Sans on studio copy across Work, About, and Sandbox. Type lab is absent, and the updated preview responds on port 3000.

## Simpler work cards, navy accent, and About page — 2026-11-18

- [x] Reduce project cards to a squiggly image and title; turn the outline navy on hover/focus.
- [x] Add “Explore my sandbox!” beneath Work and above the centered filters.
- [x] Move About to `/about`, update navigation, and remove the unused home About popup wiring.
- [x] Verify project interactions, `/about` navigation, narrow layout, build, and preview.

Design: Keep the photos and static squiggly crops. Use a restrained navy token for interactive edges and links. The dedicated About page expands the existing bio into a clear headline, two-column introduction, and résumé/social links.

### Font preview and alignment refinement

- [x] Restyle “Explore my sandbox!” as a text link and align project titles to the contour’s left edge.
- [x] Add a top-right font drawer with local display/body font choices, live preview, persistence, and reset.
- [x] Verify font changes across Home/About/Sandbox, drawer keyboard behavior, layout, build, and preview.

Review: Browser inspection confirmed six image/title links with no arrow bubbles, indices, categories, or descriptions. The first contour changed to navy on hover and titles start 7px in from the card box, aligned with the visible contour. The sandbox text link reached `/sandbox`; About navigation reached `/about` and the page fit desktop and 390px views. Type lab switched both fonts, persisted across navigation, reset to Chubbo/Supreme, and closed with Escape. Production build and diff check passed; Home, About, and Sandbox return HTTP 200 on the restarted preview.

## Quiet project outlines and centered Work heading — 2026-11-18

- [x] Freeze project image outlines at one squiggly drawing while the hero and nav keep boiling.
- [x] Replace the work heading with centered “Work” and a blinking cursor; remove the eyebrow, note, and project count.
- [x] Center the filters directly beneath the title and verify desktop/narrow layouts and build.

Design: Keep the enlarged organic image crops, but hold their edge still. Use the same cursor timing as the hero’s typed role. Give the heading and filters a centered vertical rhythm above the existing project grid.

Review: Desktop and 390px browser views showed the centered title, cursor, and filters. The removed labels are absent from the DOM. After a fresh reload, the project contour path stayed identical over 800ms, while the nav path continued animating. TypeScript, diff check, and production build passed; the dev preview returns HTTP 200.

## Project cards in the hero’s line-boil language — 2026-11-18

- [x] Use one animated contour for each project image’s visible border and crop.
- [x] Give project images more height and tune the overlays to match the hand-drawn hero treatment.
- [x] Keep images lazy loaded and pause contour redraws when cards leave the viewport.
- [x] Verify the image crop, narrow layout, and local preview; inspect the hover and reduced-motion paths.

Design: Keep the existing two-column project grid and readable captions. Replace each smooth rectangular media window with a larger organic rounded shape using the hero’s five-frame line boil. The photograph stays inside the exact contour; badges sit above it. No new motion runs for offscreen cards.

Review: Browser screenshots confirmed the crop follows the contour at desktop and 390px widths. Both initial images loaded, and their CSS clip paths point to live SVG contours. The hover zoom stays inside the clipped wrapper; reduced motion selects a fixed drawing and disables the interval. TypeScript, diff check, and production build passed; the dev preview responds with HTTP 200 on port 3000.

## Original doggo sprite opacity — 2026-11-18

## Animated hero identity — 2026-11-18

- [x] Reuse the bilingual handwriting sequence in the hero sticker, keeping the doggo transfer intact.
- [x] Type and delete “Game” and “Product” before a stable “Designer” label, with reduced-motion fallback.
- [x] Check the desktop and narrow layouts, interaction, build, and preview.

Design: The doggo remains the moving sprite. The handwritten stage takes the place of the static name inside the sticker and writes the complete English name before the Chinese name. The role cycles the two disciplines while “Designer” follows the typed word.

Review: Desktop and 390px browser views showed the signature within the sticker and the role cycling to Product. The doggo stayed visible; the page had no horizontal overflow in the desktop check. TypeScript, diff check, and production build passed. The dev preview responds with HTTP 200 on port 3000.

### Natural role typing correction

- [x] Let the word slot shrink and grow with the typed characters so “Designer” follows the cursor.
- [x] Verify “Designer” moves during typing and deleting without overflowing the sticker.

Review: Browser measurements showed “Designer” shift 36px between “Product|” and the empty cursor, while the role stayed well within the sticker. The cursor remains attached to the typed word.

- [x] Restore the original doggo face in the hero, navigation, footer, and scroll transfer.
- [x] Try the hero sprite at 65% opacity and the navbar sprite at 40%.
- [x] Use the original sprite for the faint navbar placeholder and docked mark.
- [x] Verify the hero and nav visually, check the scroll transfer, and run the production build.

Review: The original image is back in every location. The hero reads at 65% opacity; the navbar and transfer now use the refinements below. Verified the hero, compact navbar, and scroll transfer in the local browser. Production build, TypeScript check, diff check, and HTTP 200 passed.

### Navbar opacity and handoff correction

- [x] Set both navbar sprite states to 20% opacity.
- [x] Keep the flying hero sprite above the navbar and interpolate to its exact displayed dimensions.
- [x] Verify the in-flight, docked, and return states plus production build.

Review: The browser measured both navbar images at a 20% opacity filter and the flying sprite at z-index 100 above the navbar's 40. The sprite travels visibly over the page, shrinks toward the live 50×28px navbar target, docks at 20% opacity, and returns to the hero on reverse scroll. Production build and diff check passed; dev preview is running.

### Preserve hero opacity during the handoff

- [x] Keep the waiting navbar placeholder at 20%.
- [x] Keep the flying and docked hero sprite at its original 65% opacity.
- [x] Verify the flight, docked state, reverse scroll, and build.

Review: Browser inspection confirmed the 20% placeholder and the fixed 65% flyer during travel and 65% live mark after docking. Reverse scrolling restored the hero and placeholder. TypeScript, diff check, and production build passed.

Audited live at iPhone viewport (390×844, DPR 3, 4× CPU throttle).

## Findings (prioritized by impact)

### 🔴 P0 — Performance: giant raw images (the "rlly laggy" cause)
- All media rendered as raw `<img>` — **next/image is not used** in grid/widgets.
- Full-resolution assets shipped to a ~390px column:
  - `sublime.png` = **15 MB** (5100×3163), 3 duplicate copies on disk
  - `usc-racing-hero.png` = 4 MB (2880×1712); porsche/streets/etc. all multi-MB
  - ~13 images on mobile homepage; media folder ~96 MB total
- Real-phone effect: huge download + multi-hundred-ms decode jank + memory pressure.
- LCP (dev) 2.7s, render delay 2.5s.

### 🟠 P1 — DotGridBackground canvas runs on mobile for no benefit
- `<canvas>` mounts globally (`layout.tsx:52`), backing store 1170×2532 @ DPR 3.
- Driven by `mousemove` (never fires on touch) → overhead with no payoff.

### 🟠 P1 — Hero trapped in a widget card (vision: standalone big "Winston Gu")
- Mobile hero is a glass card (`MobileLayout.tsx:104-114`); name is low-contrast (13% opacity), small relative to screen.

### 🟡 P2 — Projects show heavy preview thumbnails (vision: condensed list, no previews)
- `MobileLayout.tsx:116-148` renders 16:10 thumbnail cards → feeds the P0 image problem.

### 🟡 P2 — Tap targets below 44px
- "View all →" 17px, "↓ PDF" 17px, social icons 40px, several links ~17–22px.

### 🟢 P3 — Long single column, no quick nav
- "available summer 2027" is the only above-the-fold hook.

## Plan (toward the vision) — pending approval
- [x] **Hero** — standalone full-bleed mobile hero: big high-contrast "Winston Gu" (display font, clamp(76px,23vw,124px), solid text-primary), accent eyebrow. No card. (`MobileLayout.tsx`)
  - [x] Revised per user: dropped the "available summer 2027" subtitle + green dot; hero now = title + project gallery on the first screen.
  - [x] Bonus: gated desktop-only ambient chrome (DotGridBackground canvas + CornerTicker) off mobile via new `DesktopChrome.tsx` — removes the diagonal-text clutter over the hero AND lands the P1 canvas perf win. Desktop verified unaffected.
- [x] **Projects** — visual gallery (2-col image cards) merged into the hero, per user choice. Mobile-only; desktop ProjectsWidget untouched.
  - [x] **P0 image fix** — converted mobile thumbnails to `next/image` (fill + sizes). All cards now via `/_next/image`; sublime.png 15MB→w=640. Decode/bandwidth lag eliminated while keeping visuals.
  - [x] Removed the "Projects / View all →" heading — gallery flows straight out of the name.
  - [x] **Direct-to-case-study tap** — cards now deep-link into the specific project's case study (skip the grid). Additive optional props threaded MobileLayout→page.tsx→DetailOverlay→DetailContent→ProjectsDetail (`initialProjectId`); seeded in useState initializer (no grid flash). Desktop passes nothing — unchanged. Verified: tapping USC opens its cinematic directly.
  - [x] **Bug fix (deep-link presentation)** — user reported it "wasn't really a page": (1) `caseStudyMode` stayed false on deep-link because ProjectCaseStudy's mount event races ahead of DetailOverlay's listener → now initialized from `!!initialProjectId`, so the "PROJECTS" widget header is hidden. (2) The overlay used the desktop floating-card rect on mobile (16px gutters) → now **full-bleed on mobile** (`isMobile` → target rect = full viewport, radius 0). Verified: full-screen case study, no widget header, clean back/close; close returns home; **desktop overlay confirmed unchanged** (popup card 1200×810, radius 24).
  - [x] Roles (Game Designer / UIUX Engineer / Product Designer) moved into the negative space beside "Gu"; restored semantic `<h1>`.
- [ ] **Projects** — condensed text list below hero: title + role + domain tag + chevron, **no preview images**. Tap → existing detail overlay.
- [ ] **Performance** — disable DotGridBackground on mobile; remove preview images from mobile (P0 win); downscale/convert remaining mobile images.
- [ ] **Tap targets** — all interactive elements ≥44px hit area.
- [ ] (Optional) lightweight section/anchor nav.

- [x] **Hiking section (replaces Experience, mobile only)** — big "Hiking" h2 + readable intro paragraph (16px/1.62, ~36ch, high contrast) + edge-bleeding horizontal photo strip (3:4 tiles, scroll-snap, hidden scrollbar via `.hide-scrollbar`). Data in `hikingPhotos` array. Desktop Experience widget untouched.
  - [x] Wired 3 real hike photos (`public/images/hiking/hike-1..3.jpeg`); optimized via next/image.
  - [x] Orientation fix: hike-1/hike-2 ended up 180° off (EXIF orientation made the image viewer disagree with the browser). Re-flipped 180°; EXIF now stripped (orientation nil = pixels are truth); had to `rm -rf .next/cache/images` + hard reload because Next caches optimized output server-side. Browser-verified upright.
  - [x] Rewrote the intro copy (was repetitive/childish — double "really", "skipping rocks on the flowing water") → "Lately I've been hiking around the Bay most weekends. I'm drawn to the quiet stretches near creeks — getting close to the water and skipping stones across the current."
- [x] **Hide top-left "← all projects" on mobile case studies** — tagged the 5 top-left back buttons (USC, AWL, Sublime/CrtHero, ComingSoon, Minimal breadcrumb) with `.cs-back-top`; hidden via one `@media (max-width:767px)` rule. Exit is the floating close (X). Bottom-of-page back links kept. Desktop unaffected.

- [x] **Now Playing polish (mobile)** — label "Now playing" → "I'm currently listening to" (sentence case); replaced 3 static identical bars with an animated 4-bar `.eq-bar` equalizer (staggered phases, reduced-motion safe); social row swapped faint "GH/in/@" text for real GitHub/LinkedIn/email SVG glyphs in solid white 44px circles (visible + tap-target compliant).
- [x] Note: `↓ PDF` tiny link removed naturally (was in the replaced Experience section).
- [x] **Gallery redesign (mobile)** — big "Gallery" title (matches Hiking); removed header "View all"; thumbnails now tap-to-zoom in a full-screen lightbox (blurred backdrop, title caption, 44px close, lb-fade/lb-pop anim, backdrop-tap to dismiss); added a centered "View all artwork →" pill below the grid that opens the full gallery overlay. Thumbnails converted to next/image (perf). Verified: lightbox open/close, optimized thumbs.

- [x] **Full gallery (View all) mobile zoom** — extracted lightbox to shared `components/common/ImageLightbox.tsx` (portal to body, covers viewport from inside overlay panel). MobileLayout preview + GalleryDetail both use it. On mobile, GalleryDetail pieces are now buttons opening the lightbox (was `<a target=_blank>` → new tab); desktop keeps new-tab link (gated by `useBreakpoint`). Verified: zero new-tab links on mobile, tap zooms, close returns to gallery.

## Verification
- [ ] tsc --noEmit clean; dev HTTP 200, no new console errors
- [ ] Re-trace mobile: LCP + scroll feel; re-check tap targets ≥44px
- [ ] Log lessons to Obsidian vault

## Review
_(to be filled after implementation)_
