"use client"

import { useEffect, useRef } from "react"
import { createLoop } from "@/lib/frame"
import { perfLevel } from "@/lib/perf"
import { readSpectrum } from "@/lib/sound"
import { useAudio } from "@/components/fx/sound-toggle"

const BINS = 32

/**
 * Spectre de la musique en bas de l'écran + pulsation de lumière calée sur le niveau sonore.
 * Un seul canvas fin, dessiné à 30 images/s, uniquement quand la musique joue et que l'onglet est visible.
 * Aucune variable CSS globale n'est écrite (pas de recalcul de style de la page) : seule l'opacité d'un calque change.
 */
export function AudioViz() {
  const a = useAudio()
  const canvas = useRef<HTMLCanvasElement>(null)
  const pulse = useRef<HTMLDivElement>(null)
  const active = a.music && a.unlocked

  useEffect(() => {
    const cv = canvas.current
    const pl = pulse.current
    if (!active || !cv || !pl || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    const buf = new Uint8Array(BINS) as Uint8Array<ArrayBuffer>
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let level = 0
    let tick = 0
    let fg = "#888"
    const fit = () => {
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = Math.round(w * dpr)
      cv.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    window.addEventListener("resize", fit, { passive: true })

    const loop = createLoop(
      () => {
        if (document.hidden || perfLevel() >= 2) return
        const lv = readSpectrum(buf)
        level += (lv - level) * 0.25
        pl.style.opacity = Math.min(1, level * 3.2).toFixed(3)
        ctx.clearRect(0, 0, w, h)
        if (tick++ % 45 === 0) fg = getComputedStyle(document.documentElement).getPropertyValue("--fg").trim() || "#888"
        ctx.fillStyle = fg
        const gap = 3
        const bw = Math.max(2, w / BINS - gap)
        for (let i = 0; i < BINS; i++) {
          const v = buf[i] / 255
          const bh = Math.max(2, v * h * 1.4)
          ctx.globalAlpha = 0.25 + v * 0.6
          ctx.fillRect(i * (bw + gap) + gap / 2, h - bh, bw, bh)
        }
        ctx.globalAlpha = 1
      },
      {},
    )
    loop.wake()
    return () => {
      loop.destroy()
      window.removeEventListener("resize", fit)
      pl.style.opacity = "0"
    }
  }, [active])

  return (
    <>
      <div ref={pulse} className="audioviz__pulse" aria-hidden />
      <canvas ref={canvas} className="audioviz" data-on={active} aria-hidden />
    </>
  )
}
