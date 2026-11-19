import { NextRequest, NextResponse } from "next/server";
import { ownerSession, safeEqual } from "@/lib/sandbox-notes";
export const runtime = "nodejs";
const options = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/sandbox",
  maxAge: 8 * 60 * 60,
};
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new NextResponse(null, { status: 403 });
  const secret = process.env.SANDBOX_OWNER_KEY;
  if (!secret || secret.length < 32)
    return NextResponse.json(
      { error: "Owner access has not been configured." },
      { status: 503 },
    );
  // One shared limiter also bounds attempts when anonymous cookies are reset.
  const key = "owner-login";
  const previous = attempts.get(key);
  const limit =
    previous && previous.until > Date.now()
      ? previous
      : { count: 0, until: Date.now() + 600000 };
  if (++limit.count > 10)
    return NextResponse.json(
      { error: "Please wait ten minutes before trying again." },
      { status: 429 },
    );
  attempts.set(key, limit);
  let data;
  try {
    const body = await request.text();
    if (body.length > 1024) throw new Error();
    data = JSON.parse(body);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (typeof data?.key !== "string" || !safeEqual(data.key, secret))
    return NextResponse.json(
      { error: "That access key wasn’t recognized." },
      { status: 401 },
    );
  attempts.delete(key);
  const response = NextResponse.json({ owner: true });
  response.cookies.set(
    "sandbox-owner",
    ownerSession(secret, Date.now() + 8 * 3600000),
    { ...options, secure: request.nextUrl.protocol === "https:" },
  );
  return response;
}
export async function DELETE(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new NextResponse(null, { status: 403 });
  const response = NextResponse.json({ owner: false });
  response.cookies.set("sandbox-owner", "", { ...options, maxAge: 0 });
  return response;
}
