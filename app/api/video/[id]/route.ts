import { loadVideoBytes, loadVideoMeta } from "@/lib/content"
import { VIDEO_CHUNK } from "@/lib/video"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Lecture d'une vidéo importée, avec prise en charge des requêtes `Range` (indispensable pour que le
 * lecteur démarre vite, avance dans la vidéo et fonctionne sur iPhone). Chaque réponse porte au plus
 * deux morceaux (4 Mo) ; le navigateur enchaîne les requêtes tout seul.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 })
  try {
    const meta = await loadVideoMeta(id)
    if (!meta) return new Response("Not found", { status: 404 })
    const { size, contentType } = meta

    let start = 0
    let end = size - 1
    const range = req.headers.get("range")
    const m = range?.match(/^bytes=(\d*)-(\d*)$/)
    if (m) {
      if (m[1] === "" && m[2] !== "") {
        start = Math.max(0, size - parseInt(m[2], 10)) // « les N derniers octets »
      } else {
        start = m[1] ? parseInt(m[1], 10) : 0
        if (m[2]) end = Math.min(parseInt(m[2], 10), size - 1)
      }
      if (start >= size || start > end) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } })
      }
    }
    // Au plus deux morceaux par réponse (limite de taille d'une réponse de fonction).
    end = Math.min(end, (Math.floor(start / VIDEO_CHUNK) + 2) * VIDEO_CHUNK - 1)

    const bytes = await loadVideoBytes(id, start, end, VIDEO_CHUNK)
    const partial = !!m || end < size - 1
    return new Response(new Uint8Array(bytes), {
      status: partial ? 206 : 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(bytes.length),
        "Accept-Ranges": "bytes",
        ...(partial ? { "Content-Range": `bytes ${start}-${start + bytes.length - 1}/${size}` } : {}),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new Response("Error", { status: 502 })
  }
}
