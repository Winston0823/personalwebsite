import { NextRequest, NextResponse } from "next/server";
import { randomBytes, randomUUID } from "node:crypto";
import {
  hashIdentity,
  isOwnerSession,
  noteStore,
  validateNote,
  visibleNotes,
} from "@/lib/sandbox-notes";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "sandbox-guest";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/sandbox",
  maxAge: 60 * 60 * 24 * 365,
};
function identity(request: NextRequest) {
  const existing = request.cookies.get(COOKIE)?.value;
  const token =
    existing && /^[a-f0-9]{64}$/.test(existing)
      ? existing
      : randomBytes(32).toString("hex");
  return {
    token,
    author: hashIdentity(token),
    owner: isOwnerSession(
      request.cookies.get("sandbox-owner")?.value,
      process.env.SANDBOX_OWNER_KEY,
    ),
  };
}
function failure(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const status =
    message === "RATE_LIMIT" ? 429 : message === "NOT_FOUND" ? 404 : 503;
  return NextResponse.json(
    {
      error:
        status === 429
          ? "A few too many notes. Please try again in an hour."
          : status === 404
            ? "That note could not be found."
            : "Private notes are unavailable. Please try again later.",
    },
    { status },
  );
}
export async function GET(request: NextRequest) {
  const person = identity(request);
  try {
    const notes = await noteStore((notes) => ({
      result: visibleNotes(
        notes.filter((note) => note.project === "ttoa"),
        person.author,
        person.owner,
      ),
    }));
    const response = NextResponse.json(
      { notes, owner: person.owner },
      { headers: { "Cache-Control": "private, no-store", Vary: "Cookie" } },
    );
    response.cookies.set(COOKIE, person.token, {
      ...cookieOptions,
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new NextResponse(null, { status: 403 });
  const person = identity(request);
  if (Number(request.headers.get("content-length")) > 16000)
    return new NextResponse(null, { status: 413 });
  let data;
  try {
    const body = await request.text();
    if (body.length > 16000) return new NextResponse(null, { status: 413 });
    data = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "The note could not be read." },
      { status: 400 },
    );
  }
  if (!data || !validateNote(data) || data.website)
    return NextResponse.json(
      { error: "Write a note of 1–1,000 characters." },
      { status: 400 },
    );
  try {
    const note = await noteStore((notes) => {
      if (
        notes.filter(
          (note) =>
            note.author === person.author &&
            Date.now() - Date.parse(note.createdAt) < 3600000,
        ).length >= 20
      )
        throw new Error("RATE_LIMIT");
      const note = {
        id: randomUUID(),
        project: "ttoa",
        author: person.author,
        text: data.text.trim(),
        x: data.x,
        y: data.y,
        createdAt: new Date().toISOString(),
        context: data.context ?? null,
      };
      notes.push(note);
      return {
        result: visibleNotes([note], person.author, false)[0],
        write: true,
      };
    });
    const response = NextResponse.json({ note }, { status: 201 });
    response.cookies.set(COOKIE, person.token, {
      ...cookieOptions,
      secure: request.nextUrl.protocol === "https:",
    });
    return response;
  } catch (error) {
    return failure(error);
  }
}
export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new NextResponse(null, { status: 403 });
  const person = identity(request);
  const id = request.nextUrl.searchParams.get("id");
  try {
    await noteStore((notes) => {
      const index = notes.findIndex(
        (note) =>
          note.id === id && (person.owner || note.author === person.author),
      );
      if (index < 0) throw new Error("NOT_FOUND");
      notes.splice(index, 1);
      return { result: null, write: true };
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return failure(error);
  }
}

export async function PATCH(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new NextResponse(null, { status: 403 });
  const person = identity(request);
  let data;
  try {
    const body = await request.text();
    if (body.length > 1024) return new NextResponse(null, { status: 413 });
    data = JSON.parse(body);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (
    typeof data?.id !== "string" ||
    ![data.x, data.y].every(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 1,
    )
  )
    return NextResponse.json(
      { error: "That note position is invalid." },
      { status: 400 },
    );
  try {
    const note = await noteStore((notes) => {
      const note = notes.find(
        (note) =>
          note.id === data.id &&
          (person.owner || note.author === person.author),
      );
      if (!note) throw new Error("NOT_FOUND");
      note.x = data.x;
      note.y = data.y;
      return {
        result: visibleNotes([note], person.author, person.owner)[0],
        write: true,
      };
    });
    return NextResponse.json({ note });
  } catch (error) {
    return failure(error);
  }
}
