"use client";

import { useEffect, useState } from "react";
import { isPerfLite, setPerfMode, storedPerfMode } from "@/lib/perf-tier";

/**
 * The visible "Lite mode" indicator + toggle (bottom-left desktop chrome).
 *
 * - Shows the current tier so it's obvious when the site is running in lite
 *   mode (a filled accent dot = on, hollow = off).
 * - Clicking switches tiers and reloads (the heavy effects read the tier once
 *   at mount, so a reload is the clean way to re-initialise them).
 * - Runs a passive frame-time probe: if a device that wasn't auto-detected as
 *   weak still renders janky frames, it demotes itself to lite automatically.
 *   This catches the common "8 logical cores / 8 GB but slow GPU" laptops that
 *   slip past the static hardware heuristic. Skipped once a choice is stored.
 */
export default function PerfModeControl() {
  const [mounted, setMounted] = useState(false);
  const [lite, setLite] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isLite = isPerfLite();
    setLite(isLite);

    // Auto-probe only when running full AND the user hasn't explicitly chosen a
    // mode. Dev builds jank from HMR/compile, so probe in production only.
    if (isLite) return;
    if (storedPerfMode() === "full") return;
    if (process.env.NODE_ENV !== "production") return;

    // Passive jank detector: count clearly-long frames over a window after a
    // settle (excludes initial load/hydration jank). Sustained jank => demote.
    const JANK_MS = 45; // a frame this long is ≤ ~22fps — visibly bad
    const DEMOTE_AFTER = 16; // this many janky frames within the window
    const SETTLE_MS = 1500; // ignore load-time jank
    const WINDOW_MS = 9000; // stop probing after this

    let raf = 0;
    let last = 0;
    let started = 0;
    let janky = 0;
    let stopped = false;

    const tick = (t: number) => {
      if (stopped) return;
      if (!started) started = t;
      if (t - started > WINDOW_MS) return; // window closed — stop, no demote
      if (!document.hidden && last && t - started > SETTLE_MS) {
        if (t - last > JANK_MS) {
          janky++;
          if (janky >= DEMOTE_AFTER) {
            stopped = true;
            setPerfMode("lite"); // persists + reloads into lite
            return;
          }
        }
      }
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  // Avoid an SSR/first-paint hydration mismatch — the tier is only known client
  // side. The control is ambient chrome, so appearing a tick late is fine.
  if (!mounted) return null;

  return (
    <button
      type="button"
      className="perf-toggle"
      data-lite={lite || undefined}
      data-cursor="button"
      onClick={() => setPerfMode(lite ? "full" : "lite")}
      title={
        lite
          ? "Lite mode is on — click for full visual quality"
          : "Switch to lite mode (smoother on slower computers)"
      }
      aria-label={lite ? "Lite mode on. Switch to full quality." : "Switch to lite mode."}
    >
      <span className="perf-toggle__dot" aria-hidden="true" />
      <span className="perf-toggle__label">Lite&nbsp;mode</span>
      <span className="perf-toggle__state">{lite ? "on" : "off"}</span>
    </button>
  );
}
