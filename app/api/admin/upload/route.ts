import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { writeFile } from "@/lib/github"

const FOLDERS = ["projects", "certifications"]

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = (await request.json().catch(() => null)) as { folder?: string; name?: string; data?: string } | null
  if (!body?.folder || !FOLDERS.includes(body.folder) || !body.data || body.data.length > 3_000_000) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  }
  const slug = (body.name ?? "image").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "image"
  const path = `public/uploads/${body.folder}/${Date.now()}-${slug}.webp`
  try {
    await writeFile(path, body.data, `admin: ajout d'une image (${body.folder})`)
    return NextResponse.json({ url: path.replace(/^public/, "") })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 })
  }
}
