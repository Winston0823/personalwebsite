import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type PrivateNote = {
  id: string;
  project: string;
  author: string;
  text: string;
  x: number;
  y: number;
  createdAt: string;
  context: unknown;
};
export type PublicNote = Omit<PrivateNote, "author"> & { mine: boolean };
export const hashIdentity = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function safeEqual(a: string, b: string) {
  const first = Buffer.from(a),
    second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}
export function visibleNotes(
  notes: PrivateNote[],
  author: string,
  owner: boolean,
): PublicNote[] {
  return notes
    .filter((note) => owner || note.author === author)
    .map(({ author: noteAuthor, ...note }) => ({
      ...note,
      mine: noteAuthor === author,
    }));
}
export function ownerSession(secret: string, expires: number) {
  const payload = String(expires);
  return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
export function isOwnerSession(
  token: string | undefined,
  secret: string | undefined,
) {
  if (!token || !secret) return false;
  const expires = Number(token.split(".")[0]);
  return (
    Number.isSafeInteger(expires) &&
    expires > Date.now() &&
    safeEqual(token, ownerSession(secret, expires))
  );
}
export function validateNote(value: Record<string, unknown>) {
  if (
    value.project !== "ttoa" ||
    typeof value.text !== "string" ||
    !value.text.trim() ||
    value.text.trim().length > 1000
  )
    return false;
  return [value.x, value.y].every(
    (position) =>
      typeof position === "number" &&
      Number.isFinite(position) &&
      position >= 0 &&
      position <= 1,
  );
}

// One Node server, persistent disk. Never fall back to public/client-side storage.
// Serverless deployments must supply durable storage before notes are enabled.
let queue: Promise<unknown> = Promise.resolve();
export async function noteStore<T>(
  operation: (notes: PrivateNote[]) => { result: T; write?: boolean },
) {
  if (process.env.VERCEL && !process.env.SANDBOX_NOTES_DIR)
    throw new Error("NOTES_STORAGE_UNCONFIGURED");
  const directory =
    process.env.SANDBOX_NOTES_DIR ||
    path.join(process.cwd(), ".data", "sandbox");
  const task = queue.then(async () => {
    await mkdir(directory, { recursive: true });
    const filename = path.join(directory, "notes.json");
    let notes: PrivateNote[];
    try {
      notes = JSON.parse(await readFile(filename, "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") notes = [];
      else throw error;
    }
    const { result, write } = operation(notes);
    if (write) {
      const temporary = `${filename}.${randomBytes(8).toString("hex")}.tmp`;
      await writeFile(temporary, JSON.stringify(notes), { mode: 0o600 });
      await rename(temporary, filename);
    }
    return result;
  });
  queue = task.catch(() => {});
  return task;
}
