"use client"

import { useEffect, useRef } from "react"

/**
 * Grand texte dont les lettres montent et se remplissent quand le pointeur s'en approche.
 * À l'apparition, les lettres arrivent une à une.
 */
export function ProximityText({ text, className = "" }: { text: string; className?: string }) {
  const root = useRef<HTMLSpanElement>(null)
  const chars = Array.from(text)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-p]"))
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.dataset.in = "true"
        io.disconnect()
      }
    }, { threshold: 0.2 })
    io.observe(el)

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    let mx = 0
    let my = 0
    let on = false

    const draw = () => {
      raf = 0
      // Toutes les mesures d'abord, tous les styles ensuite : une seule mise en page par image.
      const R = Math.max(el.getBoundingClientRect().height * 1.6, 160)
      const ps: number[] = new Array(spans.length)
      for (let i = 0; i < spans.length; i++) {
        const r = spans[i].getBoundingClientRect()
        const d = on ? Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)) : R
        ps[i] = Math.max(0, 1 - d / R)
      }
      for (let i = 0; i < spans.length; i++) {
        const p = ps[i]
        spans[i].style.setProperty("--p", p.toFixed(3))
        spans[i].style.transform = `translate3d(0, ${(-p * 0.16).toFixed(3)}em, 0) scale(${(1 + p * 0.1).toFixed(3)})`
      }
    }
    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      on = true
      if (!raf) raf = requestAnimationFrame(draw)
    }
    const onLeave = () => {
      on = false
      if (!raf) raf = requestAnimationFrame(draw)
    }
    if (!reduce) {
      el.addEventListener("pointermove", onMove, { passive: true })
      el.addEventListener("pointerdown", onMove, { passive: true })
      el.addEventListener("pointerleave", onLeave)
      el.addEventListener("pointerup", onLeave, { passive: true })
      el.addEventListener("pointercancel", onLeave, { passive: true })
    }
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerdown", onMove)
      el.removeEventListener("pointerleave", onLeave)
      el.removeEventListener("pointerup", onLeave)
      el.removeEventListener("pointercancel", onLeave)
    }
  }, [])

  return (
    <span ref={root} className={`prox ${className}`} data-in="false">
      {chars.map((c, i) => (
        <span key={i} className="prox__in" style={{ ["--i" as string]: i } as React.CSSProperties}>
          <span data-p className="prox__c">
            {c === " " ? "\u00a0" : c}
          </span>
        </span>
      ))}
    </span>
  )
}
