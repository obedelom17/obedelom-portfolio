import { loadImage } from "@/lib/content"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 })
  try {
    const img = await loadImage(id)
    if (!img) return new Response("Not found", { status: 404 })
    return new Response(new Uint8Array(img.bytes), {
      headers: {
        "Content-Type": img.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new Response("Error", { status: 502 })
  }
}
