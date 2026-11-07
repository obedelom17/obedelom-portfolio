"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/components/providers"
import { getAudio, tryAutoplay, unlockAudio } from "@/lib/sound"

/**
 * Écran d'introduction, affiché une seule fois par session.
 * Le script du <head> pose data-loader="on" avant le premier affichage ; ici on joue le compteur.
 * Musique : on tente d'abord un lancement automatique. Si le navigateur le refuse (cas général),
 * un bouton « Entrer » apparaît : son appui est le geste qui débloque le son, puis le rideau remonte.
 */
export function Preloader() {
  const { t } = useApp()
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const gate = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const el = root.current
    if (html.dataset.loader !== "on" || !el) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = reduce ? 250 : 1600
    let raf = 0
    let t1 = 0
    let t2 = 0
    let done = false
    const t0 = performance.now()
    void tryAutoplay()

    const finish = () => {
      if (done) return
      done = true
      window.removeEventListener("keydown", onKey)
      try {
        sessionStorage.setItem("seen", "1")
      } catch {}
      el.dataset.gate = "off"
      el.classList.add("is-done")
      html.dataset.loader = "exit"
      t1 = window.setTimeout(() => {
        delete html.dataset.loader
      }, 1250)
    }

    const enter = () => {
      unlockAudio()
      finish()
    }
    const onKey = (e: KeyboardEvent) => {
      if (el.dataset.gate === "on" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        enter()
      }
    }

    const ready = () => {
      const a = getAudio()
      if (a.unlocked || !a.music) {
        t2 = window.setTimeout(finish, 250)
        return
      }
      el.dataset.gate = "on"
      window.addEventListener("keydown", onKey)
      const g = gate.current
      if (g) {
        g.tabIndex = 0
        g.addEventListener("click", enter, { once: true })
        g.focus({ preventScroll: true })
      }
    }

    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      if (count.current) count.current.textContent = String(Math.round(eased * 100))
      if (bar.current) bar.current.style.transform = `scaleX(${eased})`
      if (p < 1) raf = requestAnimationFrame(step)
      else t2 = window.setTimeout(ready, 200)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener("keydown", onKey)
      gate.current?.removeEventListener("click", enter)
      delete html.dataset.loader
    }
  }, [])

  return (
    <div ref={root} className="preloader" data-gate="off">
      <p className="label" style={{ color: "inherit", opacity: 0.6 }} aria-hidden>
        Portfolio
      </p>
      <div aria-hidden>
        <p className="font-serif text-[min(12vw,8rem)] leading-none">
          {Array.from("Obed Agbebavi").map((c, i) => (
            <span key={i} className="pre-char" style={{ ["--i" as string]: i } as React.CSSProperties}>
              {c === "\u00a0" || c === " " ? "\u00a0" : c}
            </span>
          ))}
        </p>
        <div className="mt-8 flex items-end gap-6">
          <div className="preloader__bar">
            <span ref={bar} />
          </div>
          <p className="font-mono text-sm tabular-nums">
            <span ref={count}>0</span>%
          </p>
        </div>
      </div>
      <button
        ref={gate}
        type="button"
        className="preloader__gate"
        tabIndex={-1}
        data-nosound
      >
        <span className="preloader__gate-ring" aria-hidden />
        <span className="preloader__gate-ring preloader__gate-ring--2" aria-hidden />
        <span className="preloader__gate-label">{t.ui.enter}</span>
        <span className="preloader__gate-hint">{t.ui.enterHint}</span>
      </button>
    </div>
  )
}
