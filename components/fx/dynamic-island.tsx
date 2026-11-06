"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { useApp } from "@/components/providers"
import { toggleAllSound, useAudio } from "@/components/fx/sound-toggle"
import { onScroll } from "@/lib/frame"

/**
 * Île dynamique : pastille flottante qui change de forme. Elle annonce la section en cours,
 * montre la progression de lecture et porte l'interrupteur du son (touche S).
 * La progression est calculée par le moteur de défilement partagé (aucun écouteur propre).
 */
export function DynamicIsland() {
  const { t } = useApp()
  const audio = useAudio()
  const sound = audio.sfx || audio.music
  const [sec, setSec] = useState("top")
  const [wide, setWide] = useState(false)
  const [shown, setShown] = useState(false)
  const bar = useRef<HTMLSpanElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const timer = useRef(0)
  const secRef = useRef("top")

  const labels: Record<string, string> = {
    top: "Obed Agbebavi",
    apropos: t.about.label,
    formation: t.formation.label,
    stages: t.nav.internships,
    projets: t.nav.projects,
    competences: t.nav.skills,
    certifications: t.nav.certifications,
    contact: t.nav.contact,
  }

  useEffect(() => {
    const root = document.documentElement
    const read = () => {
      const id = root.dataset.sec || "top"
      if (id === secRef.current) return
      secRef.current = id
      setSec(id)
      setWide(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setWide(false), 1900)
    }
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: ["data-sec"] })

    let max = 1
    let y = 0
    let on = false
    const stop = onScroll({
      read: () => {
        max = Math.max(1, root.scrollHeight - window.innerHeight)
        y = window.scrollY
      },
      write: () => {
        const p = Math.min(1, Math.max(0, y / max))
        if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`
        if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`
        const next = y > 240
        if (next !== on) {
          on = next
          setShown(next)
        }
      },
    })

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.key.toLowerCase() !== "s") return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      toggleAllSound()
    }
    document.addEventListener("keydown", onKey)

    return () => {
      mo.disconnect()
      stop()
      window.clearTimeout(timer.current)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return (
    <div className={`island ${shown ? "is-shown" : ""} ${wide ? "is-wide" : ""}`} role="status" aria-live="polite">
      <span className="island__dot" aria-hidden />
      <span className="island__label">{labels[sec] ?? labels.top}</span>
      <span className="island__more" aria-hidden>
        <span className="island__track">
          <span ref={bar} />
        </span>
        <span ref={pct} className="island__pct font-mono">
          0%
        </span>
      </span>
      <button
        type="button"
        onClick={toggleAllSound}
        aria-pressed={sound}
        aria-label={sound ? t.ui.soundOff : t.ui.soundOn}
        data-nosound
        className="island__btn"
      >
        {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
