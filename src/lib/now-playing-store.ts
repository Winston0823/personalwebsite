import { playlist } from "./playlist";
import type { Track } from "./detail-types";

const TICK_MS = 180_000; // 3 minutes

type Snapshot = {
  /** Index into `playlist` of the currently-playing track. */
  trackIndex: number;
  /** Counter that bumps every advance — used as React key/identity. */
  tick: number;
};

function shuffleIndices(n: number): number[] {
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

let queue: number[] = shuffleIndices(playlist.length);
let queuePos = 0;
let snapshot: Snapshot = { trackIndex: queue[0] ?? 0, tick: 0 };
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;
let started = false;
let lastTickAt = 0;

function emit() {
  for (const l of listeners) l();
}

function advance() {
  queuePos += 1;
  if (queuePos >= queue.length) {
    queue = shuffleIndices(playlist.length);
    queuePos = 0;
  }
  snapshot = { trackIndex: queue[queuePos], tick: snapshot.tick + 1 };
  lastTickAt = Date.now();
  emit();
  schedule(TICK_MS);
}

function schedule(delay: number) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(advance, Math.max(0, delay));
}

function pause() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function resume() {
  if (timer) return;
  const elapsed = Date.now() - lastTickAt;
  schedule(TICK_MS - (elapsed % TICK_MS));
}

function handleVisibility() {
  if (document.hidden) pause();
  else resume();
}

export function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastTickAt = Date.now();
  schedule(TICK_MS);
  document.addEventListener("visibilitychange", handleVisibility);
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

// SSR snapshot must be a stable reference — returning a fresh object literal
// on every call makes useSyncExternalStore think the value changed and loops.
const serverSnapshot: Snapshot = { trackIndex: 0, tick: 0 };
export function getServerSnapshot(): Snapshot {
  return serverSnapshot;
}

export function getTrack(index: number): Track {
  return playlist[index] ?? playlist[0];
}
