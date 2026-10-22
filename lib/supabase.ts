import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(url && anonKey)
export const ADMIN_EMAIL = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase()
export const STORAGE_BUCKET = "portfolio"

let browserClient: SupabaseClient | null = null

export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null
  if (!browserClient) browserClient = createClient(url!, anonKey!)
  return browserClient
}

export function getServerSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null
  return createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
