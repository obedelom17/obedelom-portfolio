"use client"

import { useEffect } from "react"
import { deviceTier, perfLevel, setPerfLevel, storedLevel, type Level } from "@/lib/perf"
import { frame } from "@/lib/frame"

/**
 * Garantit la fluidité sur n'importe quel appareil.
 *
 * Il mesure la durée réelle des images, d'abord pendant l'arrivée sur la page, puis à chaque défilement.
 * Si la médiane de 50 images dépasse le budget deux fois de suite, le niveau d'effets baisse d'un cran
 * (0 → 1 → 2) et le site s'allège aussitôt, sans rechargement. Le niveau est mémorisé quelques jours :
 * un appareil modeste démarre directement au bon réglage à la visite suivante.
 *
 * Un écran 120 Hz n'est jamais pénalisé : le budget est une durée absolue (≈ 45 images/s minimum),
 * pas une cadence cible.
 */
export function PerfGovernor() {
  useEffect(() => {
    const tier = deviceTier()
    const saved = storedLevel()
    const start: Level = saved ?? (tier === "low" ? 1 : 0)
    setPerfLevel(start, false)
    if (perfLevel() >= 2) return

    const SAMPLES = 50
    const BUDGET_1 = 22 // ms : sous ~45 images/s on passe au niveau 1
    const BUDGET_2 = 36 // ms : sous ~28 images/s on passe au niveau 2
    let raf = 0
    let last = 0
    let measuring = false
    let bad = 0
    const frames: number[] = []

    const stop = () => {
      measuring = false
      last = 0
      frames.length = 0
    }

    const loop = (now: number) => {
      if (document.hidden) return stop()
      const live = frame.scrolling || now < until
      if (!live) return stop()
      if (last) {
        const d = now - last
        if (d < 250) frames.push(d) // on ignore les gros trous (onglet en arrière-plan)
      }
      last = now
      if (frames.length >= SAMPLES) {
        const sorted = [...frames].sort((a, b) => a - b)
        const median = sorted[Math.floor(sorted.length / 2)]
        frames.length = 0
        const level = perfLevel()
        const limit = level === 0 ? BUDGET_1 : BUDGET_2
        if (median > limit) {
          bad++
          if (bad >= 2) {
            bad = 0
            setPerfLevel((level + 1) as Level)
            if (perfLevel() >= 2) return stop()
          }
        } else bad = 0
      }
      raf = requestAnimationFrame(loop)
    }

    let until = 0
    const kick = (ms: number) => {
      until = Math.max(until, performance.now() + ms)
      if (measuring) return
      measuring = true
      last = 0
      raf = requestAnimationFrame(loop)
    }

    // Arrivée sur la page : on laisse passer l'hydratation, puis on mesure 4 s.
    const t0 = window.setTimeout(() => kick(4000), 1800)
    const onScroll = () => kick(300)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(t0)
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])
  return null
}
