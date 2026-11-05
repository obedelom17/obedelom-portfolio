import { loadImage } from "../../_shared/content.js"

export async function onRequestGet({ env, params }) {
  const id = params.id
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 })
  try {
    const img = await loadImage(env, id)
    if (!img) return new Response("Not found", { status: 404 })
    return new Response(img.bytes, {
      headers: { "Content-Type": img.contentType, "Cache-Control": "public, max-age=31536000, immutable" },
    })
  } catch {
    return new Response("Error", { status: 502 })
  }
}
