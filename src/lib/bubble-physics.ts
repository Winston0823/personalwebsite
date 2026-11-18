export type BubbleBody = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  squeeze: number;
  angle: number;
  phase: number;
  pinned: boolean;
};

export function createBubbles(
  count: number,
  width: number,
  height: number,
): BubbleBody[] {
  const columns = width < 600 ? 2 : 3;
  const rows = Math.ceil(count / columns);
  const cellWidth = width / columns;
  const cellHeight = height / rows;
  return Array.from({ length: count }, (_, i) => {
    const radius =
      Math.min(cellWidth * 0.37, cellHeight * 0.34, 136) *
      (1 + Math.sin(i * 2.7) * 0.1);
    return {
      x: cellWidth * ((i % columns) + 0.5),
      y: cellHeight * (Math.floor(i / columns) + 0.5),
      vx: Math.cos(i * 2.4 + 0.7) * 22,
      vy: Math.sin(i * 1.7 + 0.4) * 20,
      radius,
      baseRadius: radius,
      squeeze: 0,
      angle: 0,
      phase: i * 2.3,
      pinned: false,
    };
  });
}

/** Springy, equal-density collisions. dt is seconds; coordinates are CSS pixels. */
export function stepBubbles(
  bodies: BubbleBody[],
  width: number,
  height: number,
  dt: number,
  time: number,
  expanded = -1,
  pointer?: { x: number; y: number },
) {
  dt = Math.min(Math.max(dt, 0), 1 / 30);
  for (let i = 0; i < bodies.length; i++) {
    const b = bodies[i];
    b.radius +=
      ((i === expanded ? b.baseRadius * 1.35 : b.baseRadius) - b.radius) *
      Math.min(1, dt * 5);
    b.squeeze *= Math.exp(-dt * 4);
    if (b.pinned) continue;
    b.vx += Math.sin(time * 0.23 + b.phase) * dt * 4;
    b.vy += Math.cos(time * 0.19 + b.phase) * dt * 4;
    if (pointer && i !== expanded) {
      const dx = b.x - pointer.x,
        dy = b.y - pointer.y,
        distance = Math.hypot(dx, dy);
      if (distance > 1 && distance < b.radius + 95) {
        const force = (1 - distance / (b.radius + 95)) * dt * 35;
        b.vx += (dx / distance) * force;
        b.vy += (dy / distance) * force;
      }
    }
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > 44) {
      b.vx *= 44 / speed;
      b.vy *= 44 / speed;
    }
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }
  // Several positional passes prevent crowded bubbles from interpenetrating.
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i],
          b = bodies[j];
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const distance = Math.hypot(dx, dy);
        const minimum = a.radius + b.radius + 20;
        if (distance >= minimum) continue;
        const nx = distance > 0.001 ? dx / distance : 1,
          ny = distance > 0.001 ? dy / distance : 0;
        const inverseA = a.pinned ? 0 : 1 / (a.radius * a.radius),
          inverseB = b.pinned ? 0 : 1 / (b.radius * b.radius);
        const total = inverseA + inverseB;
        if (!total) continue;
        const correction = (minimum - distance) * 0.9;
        a.x -= (nx * correction * inverseA) / total;
        a.y -= (ny * correction * inverseA) / total;
        b.x += (nx * correction * inverseB) / total;
        b.y += (ny * correction * inverseB) / total;
        const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (approach < 0) {
          const impulse = (-(1 + 0.93) * approach) / total;
          a.vx -= impulse * nx * inverseA;
          a.vy -= impulse * ny * inverseA;
          b.vx += impulse * nx * inverseB;
          b.vy += impulse * ny * inverseB;
          a.squeeze = b.squeeze = Math.min(0.14, Math.abs(approach) * 0.0025);
          a.angle = b.angle = Math.atan2(ny, nx);
        }
      }
    for (const b of bodies) {
      const r = Math.min(b.radius + 12, width / 2 - 1, height / 2 - 1);
      if (b.x < r) {
        b.x = r;
        if (b.vx < 0) b.vx *= -0.95;
        b.squeeze = Math.max(b.squeeze, 0.06);
        b.angle = 0;
      }
      if (b.x > width - r) {
        b.x = width - r;
        if (b.vx > 0) b.vx *= -0.95;
        b.squeeze = Math.max(b.squeeze, 0.06);
        b.angle = 0;
      }
      if (b.y < r) {
        b.y = r;
        if (b.vy < 0) b.vy *= -0.95;
        b.squeeze = Math.max(b.squeeze, 0.06);
        b.angle = Math.PI / 2;
      }
      if (b.y > height - r) {
        b.y = height - r;
        if (b.vy > 0) b.vy *= -0.95;
        b.squeeze = Math.max(b.squeeze, 0.06);
        b.angle = Math.PI / 2;
      }
    }
  }
}

export function bubbleContour(
  time: number,
  phase: number,
  squeeze: number,
  angle: number,
) {
  const points = Array.from({ length: 96 }, (_, i) => {
    const theta = (i / 96) * Math.PI * 2;
    const ripple =
      Math.sin(theta * 3 + time * 0.7 + phase) * 1.3 +
      Math.cos(theta * 5 - time * 0.5 + phase) * 0.7;
    const radius = 144 + ripple - Math.cos(2 * (theta - angle)) * squeeze * 144;
    return `${(160 + Math.cos(theta) * radius).toFixed(2)},${(160 + Math.sin(theta) * radius).toFixed(2)}`;
  });
  return `M${points.join(" L")} Z`;
}
