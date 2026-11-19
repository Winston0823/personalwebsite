import test from "node:test";
import assert from "node:assert/strict";
import { paperFold } from "../src/lib/sticky-paper.ts";

test("paper rests as a flat square", () => {
  const paper = paperFold(0, 0, 0.5);
  assert.equal(paper.flat.length, 4);
  assert.equal(paper.folded.length, 0);
});
test("upward folds reflect the grabbed bottom edge toward the cursor", () => {
  const paper = paperFold(0, -40, 0.5);
  assert.ok(paper.flat.some((point) => point.y === 86));
  assert.ok(paper.folded.some((point) => Math.abs(point.y - 66) < 0.001));
});
test("diagonal pulls produce mirrored folds from opposite corners", () => {
  const left = paperFold(30, -40, 0);
  const right = paperFold(-30, -40, 1);
  assert.ok(
    left.folded.some(
      (point) =>
        Math.abs(point.x - 30) < 0.001 && Math.abs(point.y - 66) < 0.001,
    ),
  );
  assert.ok(
    right.folded.some(
      (point) =>
        Math.abs(point.x - 76) < 0.001 && Math.abs(point.y - 66) < 0.001,
    ),
  );
  const rounded = (points) =>
    points
      .map(
        (point) =>
          `${Math.round(point.x * 1000)},${Math.round(point.y * 1000)}`,
      )
      .sort();
  assert.deepEqual(
    rounded(left.folded.map((point) => ({ x: 106 - point.x, y: point.y }))),
    rounded(right.folded),
  );
});
