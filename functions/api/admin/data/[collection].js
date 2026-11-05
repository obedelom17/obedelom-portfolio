import { COLLECTIONS, writeCollection } from "../../../_shared/content.js"
import { isAdmin, json } from "../../../_shared/auth.js"

export async function onRequestPut({ env, request, params }) {
  if (!(await isAdmin(env, request))) return json({ error: "unauthorized" }, 401)
  const collection = params.collection
  if (!COLLECTIONS.includes(collection)) return json({ error: "unknown_collection" }, 404)

  const body = await request.json().catch(() => null)
  const items = body?.items
  if (
    !Array.isArray(items) ||
    items.length > 200 ||
    items.some((x) => typeof x !== "object" || x === null || typeof x.id !== "string")
  ) {
    return json({ error: "invalid_payload" }, 400)
  }

  try {
    await writeCollection(env, collection, items)
    return json({ ok: true })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 502)
  }
}
