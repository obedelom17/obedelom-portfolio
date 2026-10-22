import { NextResponse } from "next/server"
import { adminConfigured, isAdmin } from "@/lib/auth"
import { NotConfiguredError, githubConfig, readJsonFile } from "@/lib/github"

export async function GET() {
  if (!adminConfigured()) return NextResponse.json({ error: "not_configured" }, { status: 503 })
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  try {
    const { repo, branch } = githubConfig()
    const [projects, certifications, journey] = await Promise.all([
      readJsonFile<unknown[]>("data/projects.json"),
      readJsonFile<unknown[]>("data/certifications.json"),
      readJsonFile<unknown[]>("data/journey.json"),
    ])
    return NextResponse.json({ projects, certifications, journey, repo, branch })
  } catch (e) {
    if (e instanceof NotConfiguredError) return NextResponse.json({ error: "github_not_configured" }, { status: 503 })
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 })
  }
}
