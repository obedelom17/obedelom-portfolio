"use client"

import { useEffect } from "react"
import { frame, onScroll } from "@/lib/frame"
import { perfLevel } from "@/lib/perf"

/**
 * Effet de vitesse : plus on défile vite, plus les titres se dédoublent en rouge/cyan (aberration chromatique).
 * Un seul réglage CSS (`--vel`, de -1 à 1) est écrit par image, via le moteur de défilement partagé.
 * La classe `vel-on` n'existe que pendant un défilement rapide : au repos, le CSS n'a rien à dessiner.
 * Coupé aux niveaux d'économie et avec « réduire les animations ».
 */
export function VelocityFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const root = document.documentElement
    let last = 0
    let on = false
    const off = onScroll({
      write: () => {
        const v = perfLevel() >= 1 ? 0 : Math.max(-1, Math.min(1, frame.velocity / 2600))
        const q = Math.round(v * 40) / 40
        if (q === last) return
        last = q
        const active = Math.abs(q) > 0.08
        if (active !== on) {
          on = active
          root.classList.toggle("vel-on", active)
        }
        if (active || q === 0) root.style.setProperty("--vel", String(q))
      },
    })
    return () => {
      off()
      root.classList.remove("vel-on")
      root.style.removeProperty("--vel")
    }
  }, [])
  return null
}
