"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/components/providers"
import { frame, onScroll } from "@/lib/frame"
import { perfLevel } from "@/lib/perf"

/**
 * Deux lignes de très grand texte qui glissent en sens opposés au rythme du défilement.
 * Un léger flou de mouvement suit la vitesse (niveau d'effets complet uniquement).
 */
export function ScrollBand() {
  const { t } = useApp()
  const text = t.ui.band
  const root = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLDivElement>(null)
  const b = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let p = 0
    let lastP = -1
    let blur = 0
    let lastBlur = -1
    return onScroll({
      el,
      read: () => {
        const r = el.getBoundingClientRect()
        p = Math.min(Math.max((frame.vh - r.top) / (frame.vh + r.height), 0), 1)
        blur = perfLevel() === 0 ? Math.min(2.4, Math.round((Math.abs(frame.velocity) / 2200) * 4) / 4) : 0
      },
      write: () => {
        if (a.current && b.current && Math.abs(p - lastP) > 0.0004) {
          lastP = p
          a.current.style.transform = `translate3d(${(-p * 30).toFixed(2)}%, 0, 0)`
          b.current.style.transform = `translate3d(${(-30 + p * 30).toFixed(2)}%, 0, 0)`
        }
        // Le flou est posé sur le conteneur (largeur de l'écran), jamais sur la ligne géante.
        if (blur !== lastBlur) {
          lastBlur = blur
          el.style.filter = blur > 0.2 ? `blur(${blur}px)` : "none"
        }
      },
    })
  }, [])

  const row = (outline: boolean) =>
    Array.from({ length: 6 }, (_, i) => (
      <span key={i} className="flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16">
        <span className={outline ? "outline-text" : ""}>{text}</span>
        <span className="text-gradient-star text-[0.5em]">✦</span>
      </span>
    ))

  return (
    <div ref={root} className="overflow-hidden border-t border-line py-10 md:py-16" aria-hidden>
      <div ref={a} className="flex w-max font-serif text-[min(15vw,11rem)] leading-[1.02] will-change-transform">
        {row(false)}
      </div>
      <div ref={b} className="flex w-max font-serif text-[min(15vw,11rem)] leading-[1.02] will-change-transform" style={{ transform: "translate3d(-30%,0,0)" }}>
        {row(true)}
      </div>
    </div>
  )
}
