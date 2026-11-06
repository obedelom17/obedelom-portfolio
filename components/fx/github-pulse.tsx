"use client"

import { useEffect, useState } from "react"
import { useApp } from "@/components/providers"

const USER = "obedelom17"
const KEY = "gh-pulse"

type GhEvent = { type: string; repo: { name: string }; created_at: string }
type Pulse = { repo: string; at: number }

function ago(at: number, lang: string) {
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" })
  const s = Math.round((at - Date.now()) / 1000)
  const abs = Math.abs(s)
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute")
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour")
  return rtf.format(Math.round(s / 86400), "day")
}

/** Pastille « dernier push GitHub » : lit l'activité publique, mise en cache 10 minutes, invisible si l'API ne répond pas. */
export function GithubPulse() {
  const { t, lang } = useApp()
  const [pulse, setPulse] = useState<Pulse | null>(null)

  useEffect(() => {
    let dead = false
    try {
      const raw = sessionStorage.getItem(KEY)
      if (raw) {
        const c = JSON.parse(raw) as { t: number; v: Pulse }
        if (Date.now() - c.t < 600_000) {
          setPulse(c.v)
          return
        }
      }
    } catch {}
    fetch(`https://api.github.com/users/${USER}/events/public?per_page=20`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? (r.json() as Promise<GhEvent[]>) : Promise.reject()))
      .then((events) => {
        const e = events.find((x) => x.type === "PushEvent")
        if (!e || dead) return
        const v: Pulse = { repo: e.repo.name.split("/").pop() ?? e.repo.name, at: Date.parse(e.created_at) }
        setPulse(v)
        try {
          sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), v }))
        } catch {}
      })
      .catch(() => {})
    return () => {
      dead = true
    }
  }, [])

  if (!pulse || Number.isNaN(pulse.at)) return null

  return (
    <a
      href={`https://github.com/${USER}/${pulse.repo}`}
      target="_blank"
      rel="noopener noreferrer"
      className="label inline-flex items-center gap-2 transition-colors hover:text-fg"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-2 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-2" />
      </span>
      {t.ui.lastPush} : {pulse.repo} · {ago(pulse.at, lang)}
    </a>
  )
}
