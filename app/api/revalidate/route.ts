import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  const supabase = getServerSupabase()
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  if (!supabase || !token) return NextResponse.json({ ok: false }, { status: 401 })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return NextResponse.json({ ok: false }, { status: 401 })

  const adminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "").toLowerCase()
  if (adminEmail && data.user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  revalidatePath("/")
  return NextResponse.json({ ok: true })
}
