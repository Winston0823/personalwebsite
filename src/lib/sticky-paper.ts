type Point = { x: number; y: number };
const clamp = (value: number, low: number, high: number) =>
  Math.max(low, Math.min(high, value));

/** Fold a square across the perpendicular bisector of the grabbed edge and cursor. */
export function paperFold(dx: number, dy: number, grip: number) {
  const length = Math.hypot(dx, dy);
  const square = [
    { x: 0, y: 0 },
    { x: 106, y: 0 },
    { x: 106, y: 106 },
    { x: 0, y: 106 },
  ];
  if (length < 0.1) return { flat: square, folded: [] as Point[], strength: 0 };
  const normal = { x: dx / length, y: dy / length };
  const midpoint = { x: clamp(grip, 0, 1) * 106 + dx / 2, y: 106 + dy / 2 };
  const distance = (point: Point) =>
    (point.x - midpoint.x) * normal.x + (point.y - midpoint.y) * normal.y;
  function clip(side: number) {
    const result: Point[] = [];
    for (let i = 0; i < square.length; i++) {
      const a = square[i],
        b = square[(i + 1) % square.length];
      const da = distance(a) * side,
        db = distance(b) * side;
      if (da >= 0) result.push(a);
      if (da >= 0 !== db >= 0) {
        const t = da / (da - db);
        result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      }
    }
    return result;
  }
  const folded = clip(-1).map((point) => {
    const d = distance(point);
    return { x: point.x - 2 * d * normal.x, y: point.y - 2 * d * normal.y };
  });
  return { flat: clip(1), folded, strength: clamp(length / 75, 0, 1) };
}
