"use client"

import { useCallback, useEffect, useState } from "react"
import { getBrowserSupabase } from "@/lib/supabase"

type Row = { id: string; sort_order: number }

export function useTable<T extends Row>(
  table: string,
  sorter: (rows: T[]) => T[],
  token: string | undefined,
) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const supabase = getBrowserSupabase()
    if (!supabase) return
    setLoading(true)
    const { data, error: err } = await supabase.from(table).select("*")
    if (err) setError(err.message)
    else {
      setError(null)
      setRows(sorter((data ?? []) as T[]))
    }
    setLoading(false)
  }, [table, sorter])

  useEffect(() => {
    reload()
  }, [reload])

  const publish = useCallback(async () => {
    if (!token) return
    try {
      await fetch("/api/revalidate", { method: "POST", headers: { Authorization: `Bearer ${token}` } })
    } catch {}
  }, [token])

  const save = useCallback(
    async (row: Omit<T, "id" | "sort_order"> & { id?: string; sort_order?: number }) => {
      const supabase = getBrowserSupabase()
      if (!supabase) return "Supabase non configuré"
      const { id, ...values } = row
      let err: { message: string } | null
      if (id) {
        err = (await supabase.from(table).update(values).eq("id", id)).error
      } else {
        const next = rows.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1
        err = (await supabase.from(table).insert({ ...values, sort_order: next })).error
      }
      if (err) return err.message
      await reload()
      await publish()
      return null
    },
    [table, rows, reload, publish],
  )

  const remove = useCallback(
    async (id: string) => {
      const supabase = getBrowserSupabase()
      if (!supabase) return
      const { error: err } = await supabase.from(table).delete().eq("id", id)
      if (err) setError(err.message)
      await reload()
      await publish()
    },
    [table, reload, publish],
  )

  const swap = useCallback(
    async (a: T, b: T) => {
      const supabase = getBrowserSupabase()
      if (!supabase) return
      await supabase.from(table).update({ sort_order: b.sort_order }).eq("id", a.id)
      await supabase.from(table).update({ sort_order: a.sort_order }).eq("id", b.id)
      await reload()
      await publish()
    },
    [table, reload, publish],
  )

  const importRows = useCallback(
    async (data: object[]) => {
      const supabase = getBrowserSupabase()
      if (!supabase) return
      const { error: err } = await supabase.from(table).insert(data)
      if (err) setError(err.message)
      await reload()
      await publish()
    },
    [table, reload, publish],
  )

  return { rows, loading, error, reload, save, remove, swap, importRows }
}
