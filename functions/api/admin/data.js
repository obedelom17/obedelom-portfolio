import { COLLECTIONS, dbEnabled, readCollection, seedOnce } from "../../_shared/content.js"
import { adminConfigured, isAdmin, json } from "../../_shared/auth.js"

export async function onRequestGet({ env, request }) {
  if (!adminConfigured(env)) return json({ error: "not_configured" }, 503)
  if (!(await isAdmin(env, request))) return json({ error: "unauthorized" }, 401)
  if (!dbEnabled(env)) return json({ error: "db_not_configured" }, 503)
  try {
    await seedOnce(env)
    const entries = await Promise.all(COLLECTIONS.map(async (n) => [n, await readCollection(env, n)]))
    return json(Object.fromEntries(entries))
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "error" }, 502)
  }
}
