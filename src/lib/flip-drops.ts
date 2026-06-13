/**
 * Drawer → grid drop continuity hand-off.
 *
 * When a widget is dropped from the drawer onto the grid, page.tsx records the
 * drag ghost's last on-screen rect here, keyed by the new widget's id. The
 * WidgetShell that mounts for that id reads the rect once and FLIPs from the
 * drop point into its settled grid cell — so the widget visibly travels from
 * where you let go into where it lands, instead of popping into place.
 *
 * A module-level map (rather than prop threading) keeps the grid render path
 * untouched: the producer and consumer are far apart in the tree and the
 * hand-off is a one-shot, fire-and-forget for a single frame.
 */

type RectLike = Pick<DOMRect, "left" | "top" | "width" | "height">;

const pending = new Map<string, RectLike>();

/** Record the drop-origin rect for a newly added widget id. */
export function recordDrop(id: string, rect: RectLike): void {
  pending.set(id, { left: rect.left, top: rect.top, width: rect.width, height: rect.height });
}

/** Read and clear the drop-origin rect for a widget id (one-shot). */
export function takeDrop(id: string): RectLike | undefined {
  const rect = pending.get(id);
  if (rect) pending.delete(id);
  return rect;
}
