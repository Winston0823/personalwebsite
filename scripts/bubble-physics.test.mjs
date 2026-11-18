import test from "node:test";
import assert from "node:assert/strict";
import {
  createBubbles,
  stepBubbles,
  bubbleContour,
} from "../src/lib/bubble-physics.ts";

test("head-on collisions separate bubbles and reverse their approach", () => {
  const bodies = createBubbles(2, 600, 600);
  Object.assign(bodies[0], {
    x: 260,
    y: 300,
    radius: 40,
    baseRadius: 40,
    vx: 20,
    vy: 0,
  });
  Object.assign(bodies[1], {
    x: 330,
    y: 300,
    radius: 40,
    baseRadius: 40,
    vx: -20,
    vy: 0,
  });
  stepBubbles(bodies, 600, 600, 0, 0);
  assert.ok(bodies[0].vx < 0 && bodies[1].vx > 0);
  assert.ok(bodies[1].x - bodies[0].x > 99);
});

for (const [width, height] of [
  [344, 800],
  [1072, 820],
]) {
  test(`six bubbles stay finite, contained, and separated over two minutes at ${width}px`, () => {
    const bodies = createBubbles(6, width, height);
    for (let frame = 0; frame < 7200; frame++) {
      stepBubbles(bodies, width, height, 1 / 60, frame / 60);
      for (const body of bodies) {
        assert.ok(Number.isFinite(body.x + body.y + body.vx + body.vy));
        assert.ok(body.x >= body.radius && body.x <= width - body.radius);
        assert.ok(body.y >= body.radius && body.y <= height - body.radius);
      }
      for (let i = 0; i < bodies.length; i++)
        for (let j = i + 1; j < bodies.length; j++) {
          assert.ok(
            Math.hypot(bodies[i].x - bodies[j].x, bodies[i].y - bodies[j].y) >=
              bodies[i].radius + bodies[j].radius - 1,
          );
        }
    }
  });
}

test("pointer attraction cannot move a pinned bubble away from the reader", () => {
  const bodies = createBubbles(1, 700, 800);
  Object.assign(bodies[0], { x: 350, y: 400, pinned: true });
  const { x, y } = bodies[0];
  for (let frame = 0; frame < 120; frame++)
    stepBubbles(bodies, 700, 800, 1 / 60, frame / 60, 0, { x: x + 1, y });
  assert.equal(bodies[0].x, x);
  assert.equal(bodies[0].y, y);
  assert.ok(bodies[0].radius > bodies[0].baseRadius * 1.3);
});

test("a coincident collision resolves without NaN and produces a closed organic contour", () => {
  const bodies = createBubbles(2, 700, 800);
  bodies[1].x = bodies[0].x;
  bodies[1].y = bodies[0].y;
  stepBubbles(bodies, 700, 800, 1 / 60, 0);
  assert.ok(bodies.every((body) => Number.isFinite(body.x + body.y)));
  const contour = bubbleContour(20, 1, 0.14, 2);
  assert.ok(contour.startsWith("M") && contour.endsWith("Z"));
  assert.ok(!contour.includes("NaN"));
});
