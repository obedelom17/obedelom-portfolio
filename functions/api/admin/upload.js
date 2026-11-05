import { saveImage } from "../../_shared/content.js"
import { isAdmin, json } from "../../_shared/auth.js"

export async function onRequestPost({ env, request }) {
  if (!(await isAdmin(env, request))) return json({ error: "unauthorized" }, 401)
  const body = await request.json().catch(() => null)
  if (!body?.data || body.data.length > 3_000_000 || !/^[A-Za-z0-9+/=]+$/.test(body.data)) {
    return json({ error: "invalid_payload" }, 400)
  }
  try {
    const id = await saveImage(env, body.data)
    return json({ url: `/api/img/${id}` })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 502)
  }
}
