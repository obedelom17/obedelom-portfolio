"use client"

import { useCallback, useState } from "react"

type Row = { id: string; sort_order: number }

export function useCollection<T extends Row>(name: string, initial: T[], sorter: (rows: T[]) => T[]) {
  const [rows, setRows] = useState<T[]>(() => sorter(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(false)

  const persist = useCallback(
    async (next: T[]): Promise<string | null> => {
      setSaving(true)
      setError(null)
      try {
        const res = await fetch(`/api/admin/data/${name}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: next }),
        })
        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { error?: string }
          throw new Error(j.error ?? `Erreur ${res.status}`)
        }
        setRows(sorter(next))
        setPublished(true)
        return null
      } catch (e) {
        const message = e instanceof Error ? e.message : "Erreur inconnue"
        setError(message)
        return message
      } finally {
        setSaving(false)
      }
    },
    [name, sorter],
  )

  const save = useCallback(
    (row: Omit<T, "id" | "sort_order"> & { id?: string }) => {
      if (row.id) {
        return persist(rows.map((r) => (r.id === row.id ? ({ ...r, ...row } as T) : r)))
      }
      const next = rows.reduce((m, r) => Math.max(m, r.sort_order), 0) + 1
      const created = { ...row, id: crypto.randomUUID(), sort_order: next } as unknown as T
      return persist([...rows, created])
    },
    [rows, persist],
  )

  const remove = useCallback((id: string) => persist(rows.filter((r) => r.id !== id)), [rows, persist])

  const swap = useCallback(
    (a: T, b: T) =>
      persist(
        rows.map((r) => {
          if (r.id === a.id) return { ...r, sort_order: b.sort_order }
          if (r.id === b.id) return { ...r, sort_order: a.sort_order }
          return r
        }),
      ),
    [rows, persist],
  )

  return { rows, saving, error, published, save, remove, swap }
}

export type Collection<T extends Row> = ReturnType<typeof useCollection<T>>
