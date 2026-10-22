import { NextResponse } from "next/server"
import { adminConfigured, isAdmin } from "@/lib/auth"
import { dbEnabled, readCollection, seedOnce } from "@/lib/content"

export const dynamic = "force-dynamic"

export async function GET() {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 })
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  if (!dbEnabled()) return NextResponse.json({ error: "db_not_configured" }, { status: 503 })
  try {
    await seedOnce()
    const [projects, certifications, journey] = await Promise.all([
      readCollection("projects"),
      readCollection("certifications"),
      readCollection("journey"),
    ])
    return NextResponse.json({ projects, certifications, journey })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 })
  }
}
