import { COLLECTIONS, dbEnabled, readCollection } from "../_shared/content.js"
import { json } from "../_shared/auth.js"

export async function onRequestGet({ env }) {
  if (!dbEnabled(env)) return json({ error: "db_not_configured" }, 503)
  try {
    const entries = await Promise.all(COLLECTIONS.map(async (n) => [n, await readCollection(env, n)]))
    const data = Object.fromEntries(entries)
    // Collections vides : le client garde les données embarquées au build.
    if (COLLECTIONS.every((n) => data[n].length === 0)) return json({ error: "empty" }, 404)
    for (const n of COLLECTIONS) if (data[n].length === 0) delete data[n]
    return json(data)
  } catch {
    return json({ error: "error" }, 502)
  }
}
