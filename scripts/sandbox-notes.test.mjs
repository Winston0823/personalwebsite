import test from "node:test";
import assert from "node:assert/strict";
import {
  hashIdentity,
  isOwnerSession,
  ownerSession,
  validateNote,
  visibleNotes,
} from "../src/lib/sandbox-notes.ts";

test("guest reads expose only their notes and never expose identity hashes", () => {
  const notes = [
    { id: "a", author: hashIdentity("A"), text: "A note" },
    { id: "b", author: hashIdentity("B"), text: "B note" },
  ];
  const guest = visibleNotes(notes, hashIdentity("A"), false);
  assert.deepEqual(guest, [{ id: "a", text: "A note", mine: true }]);
  const owner = visibleNotes(notes, hashIdentity("owner"), true);
  assert.equal(owner.length, 2);
  assert.ok(owner.every((note) => !("author" in note)));
});
test("owner sessions reject expiration, tampering, and a different key", () => {
  const token = ownerSession("owner-key", Date.now() + 10000);
  assert.ok(isOwnerSession(token, "owner-key"));
  assert.equal(isOwnerSession(token, "another-key"), false);
  assert.equal(isOwnerSession(token + "x", "owner-key"), false);
  assert.equal(
    isOwnerSession(ownerSession("owner-key", Date.now() - 1), "owner-key"),
    false,
  );
  assert.equal(isOwnerSession(token, undefined), false);
});
test("notes reject invalid positions, missing text, and unsupported prototypes", () => {
  const valid = {
    project: "ttoa",
    text: "Try a softer button",
    x: 0.2,
    y: 0.4,
  };
  assert.ok(validateNote(valid));
  for (const note of [
    { ...valid, text: "  " },
    { ...valid, text: "x".repeat(1001) },
    { ...valid, x: NaN },
    { ...valid, y: 1.1 },
    { ...valid, x: -1 },
    { ...valid, project: "unknown" },
  ])
    assert.equal(validateNote(note), false);
});
