# TTOA prototype integration

The portfolio owns the project drawer, device frames, and editor. `/sandbox` opens directly into the workspace; `/sandbox/ttoa` remains a direct link. TTOA continues to own its game, camera, audio, and canvas. The portfolio homepage is unchanged. See `sandbox-notes.md` for sticky notes and privacy.

## Source and local setup

- Source: https://github.com/Winston0823/TTOA
- Base commit: `98018fc948434b327095edce92b933653abe1f16`
- Local adapter branch: `codex/sandbox-bridge`, in the sibling `../TTOA` checkout.
- Portable adapter patch: `integrations/ttoa/sandbox-bridge.patch`.

Apply the patch to a clean checkout at the base commit and install its dependencies. Keep TTOA in the sibling `../TTOA` directory (or set `TTOA_DIR` to its checkout). Run `npm run dev` in the portfolio: it starts both the site on port 3000 and TTOA on port 3001. Open `/sandbox`. This also works with `npm run dev:turbo`.

If `.env.local` sets `NEXT_PUBLIC_TTOA_PREVIEW_URL` to a local address, the launcher starts TTOA on that port or reuses the existing listener. If a remote URL is configured, it starts only the portfolio. With no configured URL, an installed sibling TTOA checkout is used automatically; otherwise the public preview remains available. `npm run dev:site` runs only the portfolio when the prototype is managed separately. The full sandbox begins at commit `37f6b90`. Older checkouts may still have the previous sandbox; verify the checkout and refresh the browser after switching versions.

For publishing, deploy the adapter-enabled TTOA build independently and set its `NEXT_PUBLIC_SANDBOX_ORIGINS` to the exact portfolio origin. Set the portfolio's preview URL to that deployment and rebuild. Without a configured adapter URL, the existing public TTOA deployment is available in preview mode; editing is disabled until a bridge connects. The TTOA adapter is included as a portable patch; deploy its adapter-enabled build separately.

## Bridge contract, version 1

Both sides validate message origin and source. The adapter enables only inside an iframe, with `sandbox=1` and an allowlisted parent origin. It accepts explicitly supported settings, never arbitrary CSS or JavaScript.

- `winston:hello` / `winston:ready`: handshake and prototype identity.
- `winston:apply` / `winston:applied`: validated settings with a request ID and acknowledgment.
- `winston:state`: phase and remaining seconds, at most once per second.
- `winston:action` / `start-touch`: start a title-screen drag test. This action cannot start camera acquisition.

Controls cover ten game palette colors, interface font families, the start button treatment, screen spacing, current strength, rope damping, and wave amplitude. The adapter mutates existing CONFIG objects so renderer references remain valid, and updates CSS theme variables. Style changes and drawer toggles do not reload the iframe or reset game state.

Typography affects interface text; title and tutorial artwork retain their baked-in lettering. Layout controls expose actual spacing variants supported by this game.

## Devices and persistence

Phone and laptop frames are browser viewports, not native OS emulators. Device changes retain the same iframe and game session. Input changes and Restart deliberately reload it. Drag mode skips camera acquisition and MediaPipe preloading. Camera mode keeps the app's explicit start gesture and permission flow.

Three source-controlled loadouts are provided. Custom named loadouts are browser-local and export as JSON with the source commit and settings. The prototype catalog is source controlled; shared saving, authentication, and automatic repository build/deploy are future work.

The ordinary TTOA app URL keeps its original game and styling. Sandbox styling is opt-in. Camera reliability handling also applies outside the sandbox.

## Checks

Browser checks covered library navigation, the phone preview, handshake, palette and button changes, a drag-only game start, and a countdown continuing through loadout and device changes. A named `Lagoon study` loadout was saved for the local QA browser. Camera startup was also requested in the test browser; it remains unanswered even outside the iframe. The updated flow times out after 15 seconds, keeps the title available for retry, and offers an explicit drag fallback. Live camera capture still requires verification in a browser that presents camera permissions. Contract tests cover accepted presets, rejected malformed settings, and copy isolation. Both apps receive TypeScript and build checks.

The TTOA install reports existing upstream dependency audit findings. Review them before publishing an adapter build; this integration does not force a framework major upgrade.

## Camera troubleshooting

Drag mode deliberately does not request camera access. Choose Camera / face tracking, then press Start fishing inside the app (the gesture stays inside the frame for mobile browser compatibility). The iframe delegates camera access to the preview origin. Browser or OS denial still takes precedence.

Blocked, missing, busy, unavailable, and unanswered cameras now produce actionable messages rather than an endless spinner or silent drag fallback. Requests that resolve after the 15-second deadline have their tracks stopped. Video playback no longer blocks the existing bounded first-frame check. Use Open app under the preview to isolate browser restrictions on embedded cameras. Production requires HTTPS and camera permission for the deployed preview origin.

Run `node --experimental-strip-types --test scripts/camera.test.mjs` in TTOA for request success, permission error, timeout, and late-stream cleanup coverage.
