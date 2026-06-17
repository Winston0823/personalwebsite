// Device capability tier — "lite" means a weak machine (few cores, low memory,
// an explicit reduced-motion preference, a manual opt-in, or a measured-FPS
// auto-demote) where the expensive always-on effects (stacked backdrop-blur,
// animated gradient drift, reactive dot grid, custom cursor, high-DPR canvas)
// degrade so the page stays smooth.
//
// Resolution order (highest priority first):
//   1. localStorage `pw-perf` = 'full'  → force full, even on weak hardware
//   2. localStorage `pw-perf` = 'lite'  → force lite (manual toggle / auto-probe)
//   3. `?lite=1` URL flag               → force lite (QA)
//   4. Hardware heuristic               → cores<=4 OR deviceMemory<=4 OR reduced-motion
//
// The resolution is mirrored in two places that MUST stay in sync:
//   - PERF_TIER_SCRIPT — an inline <head> script that adds the `perf-lite` class
//     to <html> SYNCHRONOUSLY, before first paint, so weak devices never pay for
//     the heavy first render.
//   - isPerfLite() — the runtime read used by canvas/JS effects after mount.

/** localStorage key holding the user's explicit choice ('lite' | 'full'). */
export const PERF_STORAGE_KEY = "pw-perf";

// Inlined verbatim into <head>. Plain ES5-ish so it runs everywhere with no
// build step. Wrapped in try/catch — any failure just leaves full fidelity on.
export const PERF_TIER_SCRIPT = `(function(){try{
var d=document.documentElement,n=navigator,m=window.matchMedia,s=null;
try{s=localStorage.getItem('${PERF_STORAGE_KEY}');}catch(e){}
if(s==='full'){return;}
if(s==='lite'||/[?&]lite=1(&|$)/.test(location.search)){d.classList.add('perf-lite');return;}
var lowCores=typeof n.hardwareConcurrency==='number'&&n.hardwareConcurrency<=4;
var lowMem=typeof n.deviceMemory==='number'&&n.deviceMemory<=4;
var reduce=m&&m('(prefers-reduced-motion: reduce)').matches;
if(lowCores||lowMem||reduce){d.classList.add('perf-lite');}
}catch(e){}})();`;

/** True on weak devices (the `perf-lite` class set by PERF_TIER_SCRIPT). */
export function isPerfLite(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("perf-lite");
}

/** The user's stored choice, or null if they've never picked. */
export function storedPerfMode(): "lite" | "full" | null {
  try {
    const v = localStorage.getItem(PERF_STORAGE_KEY);
    return v === "lite" || v === "full" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Persist a mode and reload so the heavy components re-initialise cleanly under
 * the new tier (they read the tier once at mount, so a reload is the simplest
 * correct way to apply a switch — no live teardown/rebuild of canvas loops).
 */
export function setPerfMode(mode: "lite" | "full"): void {
  try {
    localStorage.setItem(PERF_STORAGE_KEY, mode);
  } catch {
    /* private mode / storage blocked — fall through to a reload anyway */
  }
  if (typeof location !== "undefined") location.reload();
}
