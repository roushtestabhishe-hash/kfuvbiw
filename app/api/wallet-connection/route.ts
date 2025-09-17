import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // optional: read the body for logging
  try {
    await req.json().catch(() => null);
  } catch {}
  return NextResponse.json({ ok: true });
}
