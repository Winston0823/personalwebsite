// Device capability tier — "lite" means a weak machine (few cores, low memory,
// or an explicit reduced-motion preference) where the expensive always-on
// effects (stacked backdrop-blur, animated gradient drift, dense reactive dot
// grid, high-DPR canvas) should degrade so the page stays smooth.
//
// The detection is mirrored in two places that MUST stay in sync:
//   1. PERF_TIER_SCRIPT below — an inline <head> script that adds the
//      `perf-lite` class to <html> SYNCHRONOUSLY, before first paint, so weak
//      devices never pay for the heavy first render.
//   2. isPerfLite() — the runtime read used by canvas/JS effects after mount.
// Keep the thresholds identical in both.

// Inlined verbatim into <head>. Plain ES5-ish so it runs everywhere with no
// build step. Wrapped in try/catch — any failure just leaves full fidelity on.
// QA override: append `?lite=1` to force the lite path on any device.
export const PERF_TIER_SCRIPT = `(function(){try{
var n=navigator,m=window.matchMedia;
var lowCores=typeof n.hardwareConcurrency==='number'&&n.hardwareConcurrency<=4;
var lowMem=typeof n.deviceMemory==='number'&&n.deviceMemory<=4;
var reduce=m&&m('(prefers-reduced-motion: reduce)').matches;
var force=/[?&]lite=1(&|$)/.test(location.search);
if(lowCores||lowMem||reduce||force){document.documentElement.classList.add('perf-lite');}
}catch(e){}})();`;

/** True on weak devices (the `perf-lite` class set by PERF_TIER_SCRIPT). */
export function isPerfLite(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("perf-lite");
}
