"use client"

import { useEffect, useRef, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { useApp } from "@/components/providers"
import { initSound, play, setSound } from "@/lib/sound"

/**
 * Île dynamique : pastille flottante qui change de forme. Elle annonce la section en cours,
 * montre la progression de lecture et porte l'interrupteur des sons d'interface (touche S).
 * Les sons sont désactivés tant que le visiteur ne les a pas activés.
 */
export function DynamicIsland() {
  const { t } = useApp()
  const [sec, setSec] = useState("top")
  const [wide, setWide] = useState(false)
  const [sound, setSoundState] = useState(false)
  const [shown, setShown] = useState(false)
  const bar = useRef<HTMLSpanElement>(null)
  const pct = useRef<HTMLSpanElement>(null)
  const timer = useRef(0)
  const secRef = useRef("top")
  const soundRef = useRef(false)

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
    soundRef.current = initSound()
    setSoundState(soundRef.current)
    const root = document.documentElement
    const read = () => {
      const id = root.dataset.sec || "top"
      if (id === secRef.current) return
      secRef.current = id
      setSec(id)
      play("section")
      setWide(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setWide(false), 1900)
    }
    const mo = new MutationObserver(read)
    mo.observe(root, { attributes: true, attributeFilter: ["data-sec"] })

    let max = 1
    let raf = 0
    const measure = () => {
      max = Math.max(1, root.scrollHeight - window.innerHeight)
    }
    const update = () => {
      raf = 0
      const y = window.scrollY
      const p = Math.min(1, Math.max(0, y / max))
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`
      if (pct.current) pct.current.textContent = `${Math.round(p * 100)}%`
      setShown((s) => (s === y > 240 ? s : y > 240))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    measure()
    update()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener("scroll", onScroll, { passive: true })

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      if ((e.target as Element | null)?.closest?.("a, button, [role='button']")) play("hover")
    }
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element | null)?.closest?.("a, button, [role='button']")) play("click")
    }
    document.addEventListener("pointerover", onOver, { passive: true })
    document.addEventListener("pointerdown", onDown, { passive: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.key.toLowerCase() !== "s") return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      toggle()
    }
    document.addEventListener("keydown", onKey)

    return () => {
      mo.disconnect()
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.clearTimeout(timer.current)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("pointerover", onOver)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    const next = !soundRef.current
    soundRef.current = next
    setSoundState(next)
    setSound(next)
  }

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
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? t.ui.soundOff : t.ui.soundOn}
        className="island__btn"
      >
        {sound ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}
