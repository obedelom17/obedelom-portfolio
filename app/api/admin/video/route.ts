import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"
import { abortVideo, finishVideo, saveVideoChunk, startVideo } from "@/lib/content"
import { VIDEO_CHUNK, VIDEO_MAX, VIDEO_TYPES } from "@/lib/video"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Body =
  | { op: "start"; type?: string; size?: number }
  | { op: "chunk"; id?: string; index?: number; data?: string }
  | { op: "finish" | "abort"; id?: string }

const ID = /^[0-9a-f-]{36}$/

/**
 * Import d'une vidéo depuis l'ordinateur, en trois temps (une fonction Vercel accepte 4,5 Mo par requête) :
 *   start  → crée l'enregistrement, renvoie l'identifiant ;
 *   chunk  → envoie un morceau de 2 Mo (base64) ;
 *   finish → vérifie que tout est arrivé et rend la vidéo lisible à /api/video/<id>.
 */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  const body = (await request.json().catch(() => null)) as Body | null
  if (!body) return NextResponse.json({ error: "invalid_payload" }, { status: 400 })

  try {
    if (body.op === "start") {
      const type = VIDEO_TYPES.includes(body.type ?? "") ? (body.type as string) : "video/mp4"
      const size = Number(body.size)
      if (!Number.isFinite(size) || size <= 0 || size > VIDEO_MAX) {
        return NextResponse.json({ error: "too_large", max: VIDEO_MAX }, { status: 413 })
      }
      const id = await startVideo(type, size, Math.ceil(size / VIDEO_CHUNK))
      return NextResponse.json({ id })
    }
    if (body.op === "chunk") {
      const { id, index, data } = body
      if (!id || !ID.test(id) || typeof index !== "number" || !data || data.length > 3_000_000 || !/^[A-Za-z0-9+/=]+$/.test(data)) {
        return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
      }
      const ok = await saveVideoChunk(id, index, data)
      return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "rejected" }, { status: 400 })
    }
    if (body.op === "finish" || body.op === "abort") {
      if (!body.id || !ID.test(body.id)) return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
      if (body.op === "abort") {
        await abortVideo(body.id)
        return NextResponse.json({ ok: true })
      }
      const ok = await finishVideo(body.id)
      return ok ? NextResponse.json({ url: `/api/video/${body.id}` }) : NextResponse.json({ error: "incomplete" }, { status: 409 })
    }
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "error" }, { status: 502 })
  }
}
