"use client"

import { useEffect, useRef } from "react"
import { play } from "@/lib/sound"

const H = 80
const MID = H / 2

/**
 * Corde élastique : un trait horizontal que le pointeur tire, puis qui vibre en revenant à sa place
 * (ressort amorti, calcul indépendant de la fréquence de l'écran). Le trait passe à l'accent quand on le touche.
 */
export function ElasticLine({ className = "" }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)

  useEffect(() => {
    const el = wrap.current
    const p = path.current
    if (!el || !p) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = el.clientWidth
    let cx = w / 2
    let cy = MID
    let vy = 0
    let tx = cx
    let ty = MID
    let inside = false
    let raf = 0
    let last = 0

    const draw = () => p.setAttribute("d", `M0 ${MID} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${w} ${MID}`)
    const rest = () => {
      cx = tx = w / 2
      cy = ty = MID
      vy = 0
      draw()
    }
    rest()

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032)
      last = now
      vy += ((ty - cy) * 190 - vy * 10.5) * dt
      cy += vy * dt
      cx += (tx - cx) * (1 - Math.exp(-dt / 0.06))
      draw()
      const settled = !inside && Math.abs(cy - MID) < 0.06 && Math.abs(vy) < 0.4
      if (settled) {
        rest()
        raf = 0
        return
      }
      raf = requestAnimationFrame(loop)
    }
    const ensure = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      inside = true
      el.dataset.on = "true"
      tx = Math.min(Math.max(e.clientX - r.left, 0), w)
      ty = MID + (e.clientY - r.top - MID) * 1.9
      ensure()
    }
    const onLeave = () => {
      // Relâchement d'une corde bien tendue : petit son, plus fort selon la tension.
      if (inside && Math.abs(ty - MID) > 14) play("bounce", Math.min(1, Math.abs(ty - MID) / 70))
      inside = false
      el.dataset.on = "false"
      tx = w / 2
      ty = MID
      ensure()
    }
    const ro = new ResizeObserver(() => {
      w = el.clientWidth
      if (!raf) rest()
    })
    ro.observe(el)

    if (!reduce) {
      el.addEventListener("pointermove", onMove, { passive: true })
      el.addEventListener("pointerdown", onMove, { passive: true })
      el.addEventListener("pointerleave", onLeave)
      el.addEventListener("pointerup", onLeave, { passive: true })
      el.addEventListener("pointercancel", onLeave, { passive: true })
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerdown", onMove)
      el.removeEventListener("pointerleave", onLeave)
      el.removeEventListener("pointerup", onLeave)
      el.removeEventListener("pointercancel", onLeave)
    }
  }, [])

  return (
    <div ref={wrap} className={`elastic ${className}`} data-on="false" aria-hidden>
      <svg>
        <path ref={path} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
