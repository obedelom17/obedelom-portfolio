import { NextResponse } from "next/server"
import { SESSION_COOKIE, SESSION_MAX_AGE, adminConfigured, checkPassword, createSessionToken } from "@/lib/auth"

export async function POST(request: Request) {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 })
  const body = (await request.json().catch(() => ({}))) as { password?: string }
  if (!body.password || !checkPassword(body.password)) {
    await new Promise((r) => setTimeout(r, 600))
    return NextResponse.json({ error: "invalid" }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  return res
}
