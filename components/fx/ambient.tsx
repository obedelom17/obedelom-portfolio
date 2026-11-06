"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/components/providers"
import { currentTheme, setTheme } from "@/lib/theme"
import { toast } from "@/lib/toast"

/**
 * Détails d'ambiance, un seul composant :
 * - le titre de l'onglet appelle à revenir quand on change d'onglet ;
 * - raccourcis clavier : 0 à 9 pour les sections, T thème, L langue, F lampe torche, ? aide ;
 * - lampe torche : la page s'assombrit, seul le pointeur éclaire (Échap pour sortir).
 */
export function Ambient({ showInternships = false }: { showInternships?: boolean }) {
  const { t, lang, setLang } = useApp()
  const latest = useRef({ t, lang, setLang })
  latest.current = { t, lang, setLang }

  // Titre de l'onglet.
  useEffect(() => {
    let original = ""
    const onVis = () => {
      if (document.hidden) {
        original = document.title
        document.title = latest.current.t.ui.away
      } else if (original) {
        document.title = original
        original = ""
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  // Raccourcis et lampe torche.
  useEffect(() => {
    const root = document.documentElement
    const ids = ["apropos", "formation", ...(showInternships ? ["stages"] : []), "projets", "competences", "certifications", "contact"]

    const go = (id: string) => {
      const a = document.createElement("a")
      a.href = `#${id}`
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    const onMove = (e: PointerEvent) => {
      root.style.setProperty("--fx", `${e.clientX}px`)
      root.style.setProperty("--fy", `${e.clientY}px`)
    }
    const flash = (on: boolean) => {
      root.classList.toggle("flashlight", on)
      if (on) document.addEventListener("pointermove", onMove, { passive: true })
      else document.removeEventListener("pointermove", onMove)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (document.body.style.overflow === "hidden") return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      const k = e.key.toLowerCase()

      if (k === "escape" && root.classList.contains("flashlight")) return flash(false)
      if (k === "?") return toast(latest.current.t.ui.shortcuts)
      if (k === "t") return setTheme(currentTheme() === "dark" ? "light" : "dark")
      if (k === "l") return latest.current.setLang(latest.current.lang === "fr" ? "en" : "fr")
      if (k === "f") {
        const on = !root.classList.contains("flashlight")
        flash(on)
        if (on) toast(latest.current.t.ui.flash)
        return
      }
      if (k === "0") return go("top")
      if (/^[1-9]$/.test(k)) {
        const id = ids[Number(k) - 1]
        if (id) go(id)
      }
    }

    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      flash(false)
    }
  }, [showInternships])

  return null
}
