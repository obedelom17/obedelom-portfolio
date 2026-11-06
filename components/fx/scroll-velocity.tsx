"use client"

import { useEffect } from "react"

/**
 * Publie la vitesse de défilement dans deux variables CSS sur <html> :
 *  --vel     : de -1 (vite vers le haut) à 1 (vite vers le bas), lissée ;
 *  --vel-abs : sa valeur absolue.
 * Les éléments `.vskew` s'en servent pour s'incliner légèrement pendant le défilement,
 * comme sur les sites de studios. La boucle s'arrête dès que la page est immobile.
 */
export function ScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const root = document.documentElement
    let lastY = window.scrollY
    let vel = 0
    let raf = 0
    let last = performance.now()
    let running = false

    const set = (v: number) => {
      root.style.setProperty("--vel", v.toFixed(4))
      root.style.setProperty("--vel-abs", Math.abs(v).toFixed(4))
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
        set(0)
        return
      }
      set(Math.max(-1, Math.min(1, vel / 2600)))
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
      window.removeEventListener("scroll", kick)
      root.style.removeProperty("--vel")
      root.style.removeProperty("--vel-abs")
    }
  }, [])

  return null
}
