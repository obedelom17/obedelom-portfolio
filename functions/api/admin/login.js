import { SESSION_SECONDS, adminConfigured, checkPassword, createSessionToken, json, sessionCookie } from "../../_shared/auth.js"

export async function onRequestPost({ env, request }) {
  if (!adminConfigured(env)) return json({ error: "not_configured" }, 503)
  const body = await request.json().catch(() => ({}))
  if (!body.password || !(await checkPassword(env, body.password))) {
    await new Promise((r) => setTimeout(r, 600))
    return json({ error: "invalid" }, 401)
  }
  return json({ ok: true }, 200, { "Set-Cookie": sessionCookie(await createSessionToken(env), SESSION_SECONDS) })
}
