# Studio design direction

The homepage uses a white background, charcoal text, the original mascot mark and Chubbo display face, rounded cards and pill controls, lime primary actions, and violet experiment accents. Project images always retain their original colors. Inspired by Graphical UI's spacious typography and coherent component states; no paid theme assets are installed.

## Local development

- `npm ci`
- `npm run dev` — http://localhost:3000
- `npm run build` — production compilation and type checking
- `/playground` preserves the original draggable widget portfolio.

The homepage reads real project data from `src/lib/detail-content.ts` and opens the existing case studies. New homepage styling lives in `src/app/studio.css`. Project-specific art direction remains in the case studies.

## Next sandbox milestones

1. Give each experiment a stable URL, version history, playable preview, and linked design source.
2. Add shared feedback storage and a server-side submission endpoint. Use length limits, rate limits, a honeypot, duplicate detection, and bot verification. Queue suspicious submissions for review; never describe a client-only check as spam verification.
3. Review and approve feedback before including it in an iteration brief. Store comments as untrusted user content, quote them as data, and keep them separate from instructions. Export approved feedback with project/version IDs and selected acceptance criteria.
4. Connect a Figma file and frame to each prototype version; track design URL, source commit, build URL, and change notes. Choose an authenticated integration once the intended Figma account and project are known.

The sandbox supports importing self-contained HTML prototypes up to 10 MB, storing them in browser-local IndexedDB, and running them in isolated iframes (scripts allowed, same-origin access denied). Imports persist across reloads; archiving and restoring are supported. Files with separate asset folders or native binaries are not supported. These imports are local to one browser, not published to other visitors. Comments, shared storage, spam verification, feedback-to-prompt export, and Figma synchronization remain planned. The motion study is interactive; its adjustments are session-only.

## Assets

The original mascot at `public/images/cat-mark.png` is used in the header, hero, and footer. The earlier generated sculpture is retained as an unused asset; it is not displayed.

## Dependency check

The initial install reported 23 dependency vulnerabilities, including one critical Next.js advisory. Compatible `npm audit fix` updates brought Next.js to 15.5.29 and removed the critical finding. The remaining audit reports 16 findings (1 moderate, 15 high), including transitive tooling and Next.js's bundled PostCSS. Resolving all findings requires a separate dependency upgrade review; no forced framework major upgrade was applied as part of the visual restyle.

## Verification

- Production build, static generation, and TypeScript validation pass.
- Browser checked at desktop size and 390px mobile width, with no horizontal page overflow on mobile.
- Verified all-project, digital-experience (2), and games (4) filters; case study opening and closing; dialog focus; shape study color, range, and reset; and round-trip navigation to the original widget playground.
- Local screenshot: `qa/studio-desktop.jpg` (ignored by Git).


## Sticker hero and navigation

The hero is the original doggo sticker with Winston Gu and Designer labels. It sways, responds to mouse position, and wags on click. The fixed navigation expands at the top and contracts after scrolling 20px, keeping the mascot accessible as a home link. Explore has a bouncing arrow, scrolls to the work, and fades after activation or scrolling 12px. Motion respects reduced-motion preferences.

Browser QA verified HTML import, in-frame JavaScript interaction, persistence after reload, and reversible archiving, plus desktop/mobile layout. A test prototype is retained under Archived prototypes in the local QA browser.


## Water bubbles and individual project pages

The homepage project collection now uses a real bounded two-dimensional particle simulation: equal-density collision impulses, positional separation, wall rebounds, cursor currents, and impact deformation. Hover and keyboard focus enlarge and steady a bubble; reduced motion keeps the collection still. SVG surfaces use refracted original artwork, translucent film, reflected highlights, and organic contours.

Every bubble links to a dedicated portfolio URL under `/projects/[slug]`. All six routes reuse the existing full case study content in a page-sized scroll container, with route-specific titles and descriptions. They no longer open a project overlay above the homepage. The original widget playground retains its overlay interaction.

The squiggly SVG contour now owns both the filled surface and its thicker border. The sticker no longer has an independent CSS background or shadow silhouette. The outline now uses a five-drawing line boil at roughly three frames per second. Each drawing slightly changes the contour in place, while the fill follows that same path. Reduced motion holds one static drawing.

Validation: physics tests cover two-minute desktop and phone simulations, collision direction and separation, bounds, pinned hover stability, and coincident-center handling. Live browser control became unavailable during this revision; the earlier screenshots predate the physics revision.


## Current project layout

The floating-bubble experiment has been retired from the homepage. Projects render in the rounded, full-color two-column grid (one column on mobile), with visible titles and descriptions. Filters and dedicated `/projects/[slug]` links remain. No bubble physics or animation mounts on the homepage. The doggo hero, line-boil outlines, compacting navigation, and separate sandbox page remain.


Motion pacing: the line boil holds each drawing for 330ms, and the doggo sway takes 12 seconds per cycle.


Navbar contraction now follows scroll progress continuously over the first 220px. Width, height, padding, logo size, and link spacing interpolate together, with a short damped catch-up. Compact width is measured from the real labels after fonts load, instead of switching to fit-content at a threshold. Reduced motion follows scroll without catch-up animation.


## Doggo transfer

The homepage navbar begins with a dotted doggo placeholder. Once the sticker approaches the navbar, the doggo alone lifts off and follows a 720ms arc into the resizing logo slot, leaving the name, role, and sticker behind. The hop completes if scrolling stops. Scrolling back toward the sticker reverses the transfer, with a hysteresis band to avoid threshold jitter. Fast scroll restoration docks immediately. Reduced motion swaps locations without a flying copy. The sandbox navbar uses its normal doggo logo.
