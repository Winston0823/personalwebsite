import type { MouseEvent } from "react";

const MAX_TILT = 8;
const HOVER_SCALE = 1.04;

// RAF-throttle: coalesce multiple mousemove events into one per animation
// frame. The browser fires mousemove ~120Hz on Apple trackpads; without this
// we'd setProperty + recompute transform 2x per painted frame.
const pendingFrames = new WeakMap<HTMLElement, number>();

export function handleCardMove(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const x = e.clientX;
  const y = e.clientY;

  if (pendingFrames.has(el)) return;

  const id = requestAnimationFrame(() => {
    pendingFrames.delete(el);
    const rect = el.getBoundingClientRect();
    const nx = (x - rect.left) / rect.width - 0.5;
    const ny = (y - rect.top) / rect.height - 0.5;
    el.classList.add("is-tilting");
    el.style.setProperty("--ry", `${-nx * MAX_TILT * 2}deg`);
    el.style.setProperty("--rx", `${ny * MAX_TILT * 2}deg`);
    el.style.setProperty("--scale", `${HOVER_SCALE}`);
  });
  pendingFrames.set(el, id);
}

export function handleCardLeave(e: MouseEvent<HTMLDivElement>) {
  const el = e.currentTarget;
  const pending = pendingFrames.get(el);
  if (pending !== undefined) {
    cancelAnimationFrame(pending);
    pendingFrames.delete(el);
  }
  el.classList.remove("is-tilting");
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--scale", "1");
}
