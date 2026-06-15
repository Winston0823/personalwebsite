# Mobile Experience Overhaul — Audit & Plan (2026-06-14)

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
