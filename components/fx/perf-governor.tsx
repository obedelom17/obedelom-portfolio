"use client"

import { useEffect } from "react"
import { deviceTier } from "@/lib/perf"

/**
 * Garantit la fluidité : mesure la durée réelle des images pendant le défilement.
 * Si la médiane dépasse le budget, la classe `perf-lite` est posée sur <html> :
 * le CSS et les composants coupent alors les effets décoratifs les plus coûteux
 * (shader, 3D, particules, traînée, halos). L'état se mémorise pour la session.
 * Les appareils déjà classés "low" démarrent directement en mode allégé.
 */
export function PerfGovernor() {
  useEffect(() => {
    const root = document.documentElement
    const lite = () => {
      if (root.classList.contains("perf-lite")) return
      root.classList.add("perf-lite")
      try {
        sessionStorage.setItem("perf-lite", "1")
      } catch {}
    }
    let stored = false
    try {
      stored = sessionStorage.getItem("perf-lite") === "1"
    } catch {}
    if (stored || deviceTier() === "low") {
      lite()
      return
    }

    const BUDGET = 24 // ms : en dessous de ~42 images par seconde, on allège
    const SAMPLES = 70
    let raf = 0
    let last = 0
    let active = false
    let bad = 0
    const frames: number[] = []

    const loop = (now: number) => {
      if (document.hidden || !root.classList.contains("is-scrolling")) {
        active = false
        last = 0
        return
      }
      if (last) frames.push(now - last)
      last = now
      if (frames.length >= SAMPLES) {
        const sorted = [...frames].sort((a, b) => a - b)
        const median = sorted[Math.floor(sorted.length / 2)]
        frames.length = 0
        if (median > BUDGET) {
          bad++
          if (bad >= 2) {
            lite()
            return
          }
        } else bad = 0
      }
      raf = requestAnimationFrame(loop)
    }
    const onScroll = () => {
      if (active) return
      active = true
      last = 0
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
    }
  }, [])
  return null
}
