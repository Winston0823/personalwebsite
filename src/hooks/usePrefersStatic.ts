"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { isPerfLite } from "@/lib/perf-tier";

/* True when we should skip live WebGL / heavy motion — either the visitor asked
   for reduced motion, or they're on a weak (perf-lite) device. The bespoke
   case-study 3D canvases gate on this and simply don't mount, leaving the
   section's text/poster as a calm static fallback.

   Computed in an effect (client only) so it's SSR-safe; the canvases are
   already client-only dynamic imports, so the one-frame settle is invisible. */
export function usePrefersStatic(): boolean {
  const [staticMode, setStaticMode] = useState(false);
  useEffect(() => {
    setStaticMode(prefersReducedMotion() || isPerfLite());
  }, []);
  return staticMode;
}
