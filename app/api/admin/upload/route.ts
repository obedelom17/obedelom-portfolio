import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { saveImage } from "@/lib/content"

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = (await request.json().catch(() => null)) as { data?: string } | null
  if (!body?.data || body.data.length > 3_000_000 || !/^[A-Za-z0-9+/=]+$/.test(body.data)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }
  try {
    const id = await saveImage(body.data)
    return NextResponse.json({ url: `/api/img/${id}` })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 })
  }
}
