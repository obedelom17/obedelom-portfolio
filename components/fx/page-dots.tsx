"use client"

import { useEffect, useRef } from "react"
import { createLoop, frame, onScroll } from "@/lib/frame"
import { isLite } from "@/lib/perf"

/**
 * Grille de points fixe derrière tout le site. Elle défile légèrement moins vite que la page (profondeur).
 * Les points proches du pointeur ou du doigt grossissent, prennent l'accent et s'écartent ; au déplacement
 * rapide ils sont poussés dans le sens du mouvement ; un clic ou un toucher lance une onde.
 * Un seul canvas, tous les points au repos tracés en un seul chemin ; la boucle s'endort dès que tout est immobile.
 */
export function PageDots({ gap = 38 }: { gap?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv?.getContext("2d")
    if (!cv || !ctx) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let ox = new Float32Array(0)
    let oy = new Float32Array(0)
    let px = -9999
    let py = -9999
    let pvx = 0
    let pvy = 0
    let ripples: { x: number; y: number; t: number }[] = []
    let fg = "#ffffff"
    let accent = "#34d399"
    const act: number[] = []
    const R = 160

    const colors = () => {
      const cs = getComputedStyle(document.documentElement)
      fg = cs.getPropertyValue("--fg").trim() || fg
      accent = cs.getPropertyValue("--accent").trim() || accent
    }

    const draw = (now: number): boolean => {
      ctx.clearRect(0, 0, w, h)
      let busy = false
      ripples = ripples.filter((r) => now - r.t < 1600)
      if (ripples.length) busy = true
      const off = (frame.y * 0.35) % gap
      const rowShift = Math.floor((frame.y * 0.35) / gap)
      const active = px > -9000
      act.length = 0
      ctx.globalAlpha = 0.2
      ctx.fillStyle = fg
      ctx.beginPath()
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = (((j + rowShift) % rows) + rows) % rows * cols + i
          const hx = i * gap + gap / 2
          const hy = j * gap + gap / 2 - off
          let tx = 0
          let ty = 0
          let boost = 0
          if (active) {
            const dx = hx - px
            const dy = hy - py
            if (dx > -R && dx < R && dy > -R && dy < R) {
              const d = Math.hypot(dx, dy)
              if (d < R) {
                const f = 1 - d / R
                boost += f
                const k = (f * f * 24) / (d || 1)
                tx += dx * k + pvx * f * 0.9
                ty += dy * k + pvy * f * 0.9
              }
            }
          }
          for (const r of ripples) {
            const age = now - r.t
            const rx = hx - r.x
            const ry = hy - r.y
            const rd = Math.hypot(rx, ry)
            const g = Math.max(0, 1 - Math.abs(rd - age * 0.6) / 80) * (1 - age / 1600)
            if (g > 0) {
              boost += g
              const k = (g * 18) / (rd || 1)
              tx += rx * k
              ty += ry * k
            }
          }
          ox[idx] += (tx - ox[idx]) * 0.16
          oy[idx] += (ty - oy[idx]) * 0.16
          if (Math.abs(tx - ox[idx]) + Math.abs(ty - oy[idx]) > 0.05) busy = true
          const x = hx + ox[idx]
          const y = hy + oy[idx]
          if (boost > 0.02) act.push(x, y, 1.1 + Math.min(boost, 1.4) * 2.4, Math.min(1, 0.25 + boost * 0.75))
          else {
            ctx.moveTo(x + 1.1, y)
            ctx.arc(x, y, 1.1, 0, Math.PI * 2)
          }
        }
      }
      ctx.fill()
      ctx.fillStyle = accent
      for (let k = 0; k < act.length; k += 4) {
        ctx.globalAlpha = act[k + 3]
        ctx.beginPath()
        ctx.arc(act[k], act[k + 1], act[k + 2], 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      pvx *= 0.85
      pvy *= 0.85
      return busy
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = window.innerWidth
      h = window.innerHeight
      cv.width = Math.max(1, Math.round(w * dpr))
      cv.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / gap) + 1
      rows = Math.ceil(h / gap) + 2
      ox = new Float32Array(cols * rows)
      oy = new Float32Array(cols * rows)
      draw(performance.now())
    }

    const loop = createLoop((now) => {
      if (document.hidden) return false
      return draw(now) ? undefined : false
    })

    const onMove = (e: PointerEvent) => {
      if (isLite() || reduce) return
      pvx = Math.max(-40, Math.min(40, e.movementX || 0))
      pvy = Math.max(-40, Math.min(40, e.movementY || 0))
      px = e.clientX
      py = e.clientY
      loop.wake()
    }
    const onDown = (e: PointerEvent) => {
      if (isLite() || reduce || (e.pointerType === "mouse" && e.button !== 0)) return
      px = e.clientX
      py = e.clientY
      ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      loop.wake()
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return
      px = py = -9999
      loop.wake()
    }
    const onLeave = () => {
      px = py = -9999
      loop.wake()
    }

    colors()
    resize()
    const mo = new MutationObserver(() => {
      colors()
      draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    const stopScroll = onScroll({
      write: () => {
        if (!isLite() && !reduce) loop.wake()
      },
    })
    window.addEventListener("resize", resize, { passive: true })
    document.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerdown", onDown, { passive: true })
    document.addEventListener("pointerup", onUp, { passive: true })
    document.addEventListener("pointercancel", onUp, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    return () => {
      loop.destroy()
      stopScroll()
      mo.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointerup", onUp)
      document.removeEventListener("pointercancel", onUp)
      document.documentElement.removeEventListener("pointerleave", onLeave)
    }
  }, [gap])

  return <canvas ref={ref} className="pagedots" aria-hidden />
}
