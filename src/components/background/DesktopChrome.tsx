"use client";

import { useBreakpoint } from "@/hooks/useBreakpoint";
import DotGridBackground from "@/components/background/DotGridBackground";
import CornerTicker from "@/components/background/CornerTicker";

/* Ambient desktop chrome — the reactive dot-grid canvas and the rotating
   corner ticker. Both are pointer/cursor flourishes with no payoff on touch:
   the canvas is driven by `mousemove` (never fires on a phone) and the ticker
   just clutters the small viewport while running an infinite compositor
   animation. Gate them off mobile so they neither mount nor run there. */
export default function DesktopChrome() {
  const breakpoint = useBreakpoint();
  if (breakpoint === "mobile") return null;
  return (
    <>
      <DotGridBackground />
      <CornerTicker />
    </>
  );
}
