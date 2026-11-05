const SESSION_COOKIE = "admin_session"
const SESSION_SECONDS = 60 * 60 * 12
const enc = new TextEncoder()

export { SESSION_COOKIE, SESSION_SECONDS }

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  })
}

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function hmac(key, value) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  return crypto.subtle.sign("HMAC", k, enc.encode(value))
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function secret(env) {
  return env.SESSION_SECRET || env.ADMIN_PASSWORD || ""
}

export function adminConfigured(env) {
  return Boolean(env.ADMIN_PASSWORD)
}

export async function checkPassword(env, input) {
  const expected = env.ADMIN_PASSWORD || ""
  if (!expected) return false
  const [a, b] = await Promise.all([hmac("pw", String(input)), hmac("pw", expected)])
  return safeEqual(toHex(a), toHex(b))
}

export async function createSessionToken(env) {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
  return `${exp}.${toHex(await hmac(secret(env), exp))}`
}

function readCookie(request, name) {
  const header = request.headers.get("Cookie") || ""
  for (const part of header.split(";")) {
    const i = part.indexOf("=")
    if (i > -1 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim()
  }
  return null
}

export async function isAdmin(env, request) {
  if (!adminConfigured(env)) return false
  const token = readCookie(request, SESSION_COOKIE)
  if (!token) return false
  const [exp, sig] = token.split(".")
  if (!exp || !sig) return false
  const expected = toHex(await hmac(secret(env), exp))
  if (!safeEqual(sig, expected)) return false
  return Number(exp) > Date.now() / 1000
}

export function sessionCookie(value, maxAge) {
  return `${SESSION_COOKIE}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
}
