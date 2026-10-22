import { createHmac, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"

export const SESSION_COOKIE = "admin_session"
const SESSION_SECONDS = 60 * 60 * 12

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || ""
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex")
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD)
}

export function checkPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD ?? ""
  if (!expected) return false
  const a = createHmac("sha256", "pw").update(input).digest()
  const b = createHmac("sha256", "pw").update(expected).digest()
  return timingSafeEqual(a, b)
}

export function createSessionToken() {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
  return `${exp}.${sign(exp)}`
}

export const SESSION_MAX_AGE = SESSION_SECONDS

export async function isAdmin() {
  if (!adminConfigured()) return false
  const token = (await cookies()).get(SESSION_COOKIE)?.value
  if (!token) return false
  const [exp, sig] = token.split(".")
  if (!exp || !sig) return false
  const expected = sign(exp)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  return Number(exp) > Date.now() / 1000
}
