"use client"

import { useEffect, useRef } from "react"

/**
 * Écran d'introduction, affiché une seule fois par session.
 * Le script du <head> pose data-loader="on" avant le premier affichage ; ici on joue le compteur,
 * puis le rideau remonte et le hero démarre ses animations.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const el = root.current
    if (html.dataset.loader !== "on" || !el) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const duration = reduce ? 250 : 1600
    let raf = 0
    let t1 = 0
    let t2 = 0
    const t0 = performance.now()

    const finish = () => {
      try {
        sessionStorage.setItem("seen", "1")
      } catch {}
      el.classList.add("is-done")
      html.dataset.loader = "exit"
      t1 = window.setTimeout(() => {
        delete html.dataset.loader
      }, 1250)
    }

    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      if (count.current) count.current.textContent = String(Math.round(eased * 100))
      if (bar.current) bar.current.style.transform = `scaleX(${eased})`
      if (p < 1) raf = requestAnimationFrame(step)
      else t2 = window.setTimeout(finish, 250)
    }
    raf = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      delete html.dataset.loader
    }
  }, [])

  return (
    <div ref={root} className="preloader" aria-hidden>
      <p className="label" style={{ color: "inherit", opacity: 0.6 }}>
        Portfolio
      </p>
      <div>
        <p className="font-serif text-[min(12vw,8rem)] leading-none" aria-hidden>
          {Array.from("Obed Agbebavi").map((c, i) => (
            <span key={i} className="pre-char" style={{ ["--i" as string]: i } as React.CSSProperties}>
              {c === " " ? "\u00a0" : c}
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
    </div>
  )
}
