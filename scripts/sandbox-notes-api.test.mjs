import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const origin = process.env.TEST_ORIGIN || "http://localhost:3000";
const endpoint = `${origin}/api/sandbox/notes`;
const cookie = (response) => response.headers.get("set-cookie")?.split(";")[0];

test("API isolates guests, rejects cross-origin writes, and allows owner review", async () => {
  const a = await fetch(endpoint);
  const aCookie = cookie(a);
  const b = await fetch(endpoint);
  const bCookie = cookie(b);
  assert.notEqual(aCookie, bCookie);
  assert.match(a.headers.get("cache-control"), /no-store/);
  const headers = {
    Origin: origin,
    Cookie: aCookie,
    "Content-Type": "application/json",
  };
  const payload = {
    project: "ttoa",
    text: "Automated privacy check",
    x: 0.1,
    y: 0.1,
  };
  const denied = await fetch(endpoint, {
    method: "POST",
    headers: { ...headers, Origin: "https://other.example" },
    body: JSON.stringify(payload),
  });
  assert.equal(denied.status, 403);
  const posted = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  assert.equal(posted.status, 201);
  const { note } = await posted.json();
  try {
    const own = await (
      await fetch(endpoint, { headers: { Cookie: aCookie } })
    ).json();
    assert.ok(own.notes.some((item) => item.id === note.id));
    const other = await (
      await fetch(endpoint, { headers: { Cookie: bCookie } })
    ).json();
    assert.ok(!other.notes.some((item) => item.id === note.id));
    const update = { id: note.id, x: 0.6, y: 0.3 };
    const forbiddenMove = await fetch(endpoint, {
      method: "PATCH",
      headers: { ...headers, Cookie: bCookie },
      body: JSON.stringify(update),
    });
    assert.equal(forbiddenMove.status, 404);
    const moved = await fetch(endpoint, {
      method: "PATCH",
      headers,
      body: JSON.stringify(update),
    });
    assert.equal(moved.status, 200);
    const persisted = await (
      await fetch(endpoint, { headers: { Cookie: aCookie } })
    ).json();
    assert.equal(persisted.notes.find((item) => item.id === note.id).x, 0.6);
    assert.equal(persisted.notes.find((item) => item.id === note.id).y, 0.3);
    const invalidMove = await fetch(endpoint, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ ...update, x: 2 }),
    });
    assert.equal(invalidMove.status, 400);
    const forbiddenDelete = await fetch(`${endpoint}?id=${note.id}`, {
      method: "DELETE",
      headers: { Origin: origin, Cookie: bCookie },
    });
    assert.equal(forbiddenDelete.status, 404);
    const environment = await readFile(
      new URL("../.env.local", import.meta.url),
      "utf8",
    );
    const key = environment.match(/^SANDBOX_OWNER_KEY=(.+)$/m)?.[1].trim();
    assert.ok(key, "Local owner key is configured");
    const login = await fetch(`${endpoint}/owner`, {
      method: "POST",
      headers: { Origin: origin, "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    assert.equal(login.status, 200);
    const ownerCookie = cookie(login);
    const review = await (
      await fetch(endpoint, {
        headers: { Cookie: `${bCookie}; ${ownerCookie}` },
      })
    ).json();
    assert.equal(review.owner, true);
    assert.ok(review.notes.some((item) => item.id === note.id));
    assert.ok(review.notes.every((item) => !("author" in item)));
    const forged = await (
      await fetch(endpoint, {
        headers: { Cookie: `${bCookie}; ${ownerCookie}x` },
      })
    ).json();
    assert.equal(forged.owner, false);
    assert.ok(!forged.notes.some((item) => item.id === note.id));
  } finally {
    const removed = await fetch(`${endpoint}?id=${note.id}`, {
      method: "DELETE",
      headers: { Origin: origin, Cookie: aCookie },
    });
    assert.equal(removed.status, 204);
  }
});
