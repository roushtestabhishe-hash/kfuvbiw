import { NextResponse } from "next/server";

/**
 * Accept a POST from the client when a wallet connects.
 * We just acknowledge it for now; you can store it later if you want.
 */
export async function POST(request: Request) {
  // Try to read JSON, but don’t crash if body is empty
  let body: any = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  // TODO: (optional) persist `body` somewhere (DB, analytics, etc.)

  // Always return JSON so the client’s `res.json()` never throws
  return NextResponse.json({ ok: true }, { status: 200 });
}

/** (Optional) Handy for quick checks from the browser */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
