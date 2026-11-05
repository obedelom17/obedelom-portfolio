"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowUpRight, CornerDownLeft, Search } from "lucide-react"
import { useApp } from "@/components/providers"
import { currentTheme, setTheme } from "@/lib/theme"
import { toast } from "@/lib/toast"

const EMAIL = "agbebaviobedelom@gmail.com"

type Item = { id: string; label: string; group: string; run: () => void }

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

/** Bouton d'ouverture, à placer dans l'en-tête. */
export function PaletteButton() {
  const { t } = useApp()
  const [mac, setMac] = useState(false)
  useEffect(() => {
    setMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent))
  }, [])
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-palette"))}
      aria-label={t.cmd.open}
      className="label hidden items-center gap-2 border border-line px-2.5 py-1.5 transition-colors hover:border-fg hover:text-fg xl:inline-flex"
    >
      <Search className="h-3.5 w-3.5" />
      {mac ? "⌘ K" : "Ctrl K"}
    </button>
  )
}

/** Palette de commandes (Ctrl/⌘ + K) : navigation rapide et actions. */
export function CommandPalette({ showInternships }: { showInternships: boolean }) {
  const { t, lang, setLang } = useApp()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)

  const items = useMemo<Item[]>(() => {
    const go = (id: string) => () => {
      setOpen(false)
      window.setTimeout(() => {
        const a = document.createElement("a")
        a.href = `#${id}`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }, 60)
    }
    const nav: Item[] = [
      { id: "top", label: t.ui.top, group: t.cmd.groupNav, run: go("top") },
      { id: "formation", label: t.nav.education, group: t.cmd.groupNav, run: go("formation") },
      ...(showInternships ? [{ id: "stages", label: t.nav.internships, group: t.cmd.groupNav, run: go("stages") }] : []),
      { id: "projets", label: t.nav.projects, group: t.cmd.groupNav, run: go("projets") },
      { id: "competences", label: t.nav.skills, group: t.cmd.groupNav, run: go("competences") },
      { id: "certifications", label: t.nav.certifications, group: t.cmd.groupNav, run: go("certifications") },
      { id: "contact", label: t.nav.contact, group: t.cmd.groupNav, run: go("contact") },
    ]
    const actions: Item[] = [
      {
        id: "theme",
        label: t.cmd.theme,
        group: t.cmd.groupActions,
        run: () => {
          setOpen(false)
          setTheme(currentTheme() === "dark" ? "light" : "dark")
        },
      },
      {
        id: "lang",
        label: t.cmd.language,
        group: t.cmd.groupActions,
        run: () => {
          setOpen(false)
          setLang(lang === "fr" ? "en" : "fr")
        },
      },
      {
        id: "email",
        label: t.cmd.copyEmail,
        group: t.cmd.groupActions,
        run: async () => {
          setOpen(false)
          try {
            await navigator.clipboard.writeText(EMAIL)
            toast(t.ui.emailCopied)
          } catch {}
        },
      },
      {
        id: "cv",
        label: t.cmd.cv,
        group: t.cmd.groupActions,
        run: () => {
          setOpen(false)
          const a = document.createElement("a")
          a.href = "/cvobed.pdf"
          a.download = "CV_AGBEBAVI_Elom_Obed.pdf"
          document.body.appendChild(a)
          a.click()
          a.remove()
        },
      },
      { id: "github", label: t.cmd.github, group: t.cmd.groupActions, run: () => (setOpen(false), void window.open("https://github.com/obedelom17", "_blank", "noopener")) },
      { id: "whatsapp", label: t.cmd.whatsapp, group: t.cmd.groupActions, run: () => (setOpen(false), void window.open("https://wa.me/22897459518", "_blank", "noopener")) },
    ]
    return [...nav, ...actions]
  }, [t, lang, setLang, showInternships])

  const results = useMemo(() => {
    const needle = fold(q.trim())
    return needle ? items.filter((i) => fold(i.label).includes(needle)) : items
  }, [items, q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === "Escape") setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener("keydown", onKey)
    window.addEventListener("open-palette", onOpen)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("open-palette", onOpen)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setQ("")
    setSel(0)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const id = window.setTimeout(() => input.current?.focus(), 30)
    return () => {
      document.body.style.overflow = prev
      window.clearTimeout(id)
    }
  }, [open])

  useEffect(() => setSel(0), [q])

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${sel}"]`)?.scrollIntoView({ block: "nearest" })
  }, [sel])

  if (!open) return null

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSel((s) => (results.length ? (s + 1) % results.length : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSel((s) => (results.length ? (s - 1 + results.length) % results.length : 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      results[sel]?.run()
    }
  }

  let lastGroup = ""
  return (
    <div className="palette-backdrop fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[14vh]" onMouseDown={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.cmd.open}
        className="palette-panel w-full max-w-xl border border-line bg-bg shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={t.cmd.placeholder}
            className="w-full bg-transparent py-4 text-base outline-none placeholder:text-muted"
          />
          <span className="label border border-line px-1.5 py-0.5">esc</span>
        </div>
        <ul ref={list} className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">{t.cmd.empty}</li>}
          {results.map((item, i) => {
            const header = item.group !== lastGroup
            lastGroup = item.group
            return (
              <li key={item.id}>
                {header && <p className="label px-3 pb-1 pt-3">{item.group}</p>}
                <button
                  type="button"
                  data-i={i}
                  onMouseMove={() => setSel(i)}
                  onClick={() => item.run()}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors ${
                    i === sel ? "bg-fg text-bg" : ""
                  }`}
                >
                  {item.label}
                  {i === sel ? <CornerDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4 opacity-30" />}
                </button>
              </li>
            )
          })}
        </ul>
        <p className="label border-t border-line px-4 py-3">{t.cmd.hint}</p>
      </div>
    </div>
  )
}
