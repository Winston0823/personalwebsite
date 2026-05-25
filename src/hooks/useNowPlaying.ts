"use client";

import { useSyncExternalStore, useEffect } from "react";
import {
  start,
  subscribe,
  getSnapshot,
  getServerSnapshot,
  getTrack,
} from "@/lib/now-playing-store";
import type { Track } from "@/lib/detail-types";

export function useNowPlaying(): Track {
  useEffect(() => {
    start();
  }, []);
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return getTrack(snap.trackIndex);
}
