import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { writeJsonFile } from "@/lib/github"

const COLLECTIONS = ["projects", "certifications", "journey"]

export async function PUT(request: Request, { params }: { params: Promise<{ collection: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const { collection } = await params
  if (!COLLECTIONS.includes(collection)) return NextResponse.json({ error: "unknown_collection" }, { status: 404 })

  const body = (await request.json().catch(() => null)) as { items?: unknown } | null
  const items = body?.items
  if (!Array.isArray(items) || items.length > 200 || items.some((x) => typeof x !== "object" || x === null || typeof (x as { id?: unknown }).id !== "string")) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }

  try {
    await writeJsonFile(`data/${collection}.json`, items, `admin: mise à jour de ${collection}`)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 })
  }
}
