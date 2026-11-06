"use client"

import { useEffect } from "react"

/**
 * Incline légèrement les éléments `.vskew` selon la vitesse de défilement.
 * Pour rester fluide : aucune variable CSS globale (elle forcerait un recalcul de style de toute la page),
 * on écrit directement le transform des seuls éléments visibles, et la boucle s'arrête quand la page est immobile.
 */
export function ScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const all = Array.from(document.querySelectorAll<HTMLElement>(".vskew"))
    const visible = new Set<HTMLElement>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement
        if (e.isIntersecting) visible.add(el)
        else {
          visible.delete(el)
          el.style.transform = ""
        }
      }
    })
    all.forEach((el) => io.observe(el))

    let lastY = window.scrollY
    let vel = 0
    let raf = 0
    let last = performance.now()
    let running = false

    const apply = (v: number) => {
      const t = v === 0 ? "" : `skewY(${(v * -2.2).toFixed(3)}deg)`
      visible.forEach((el) => (el.style.transform = t))
    }

    const tick = (now: number) => {
      const dt = Math.max(Math.min((now - last) / 1000, 0.05), 0.001)
      last = now
      const y = window.scrollY
      const instant = (y - lastY) / dt
      lastY = y
      vel += (instant - vel) * (1 - Math.exp(-dt / 0.12))
      if (Math.abs(vel) < 4 && Math.abs(instant) < 4) {
        vel = 0
        running = false
        apply(0)
        return
      }
      apply(Math.max(-1, Math.min(1, vel / 2600)))
      raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      if (running) return
      running = true
      last = performance.now()
      lastY = window.scrollY
      raf = requestAnimationFrame(tick)
    }
    window.addEventListener("scroll", kick, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("scroll", kick)
      all.forEach((el) => (el.style.transform = ""))
    }
  }, [])

  return null
}
