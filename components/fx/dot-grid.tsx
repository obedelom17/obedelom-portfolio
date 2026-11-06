"use client"

import { useEffect, useRef } from "react"
import { createLoop, onScroll } from "@/lib/frame"
import { isLite } from "@/lib/perf"

/**
 * Grille de points en arrière-plan d'une section (le parent doit être positionné).
 * Les points proches du pointeur (ou du doigt, au toucher) grossissent, prennent l'accent et s'écartent ;
 * un clic ou un toucher lance une onde.
 *
 * Performance : le dessin est regroupé (tous les points « au repos » en un seul tracé), la boucle partagée
 * s'endort dès que tout est immobile, et rien n'est calculé hors écran. Aux niveaux d'économie la grille
 * reste affichée, immobile.
 */
export function DotGrid({ gap = 30 }: { gap?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const parent = cv?.parentElement
    const ctx = cv?.getContext("2d")
    if (!cv || !parent || !ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let w = 0
    let h = 0
    let cols = 0
    let rows = 0
    let ox = new Float32Array(0)
    let oy = new Float32Array(0)
    let px = -9999
    let py = -9999
    let cX = -9999
    let cY = -9999
    let ripples: { x: number; y: number; t: number }[] = []
    let visible = false
    let fg = "#0a0a0a"
    let accent = "#059669"
    const act: number[] = []

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement)
      fg = cs.getPropertyValue("--fg").trim() || fg
      accent = cs.getPropertyValue("--accent").trim() || accent
    }

    const R = 150
    const draw = (now: number): boolean => {
      ctx.clearRect(0, 0, w, h)
      let busy = false
      ripples = ripples.filter((r) => now - r.t < 1500)
      if (ripples.length) busy = true
      act.length = 0
      ctx.globalAlpha = 0.2
      ctx.fillStyle = fg
      ctx.beginPath()
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const idx = j * cols + i
          const hx = i * gap + gap / 2
          const hy = j * gap + gap / 2
          let tx = 0
          let ty = 0
          let boost = 0

          const dx = hx - px
          const dy = hy - py
          if (dx > -R && dx < R && dy > -R && dy < R) {
            const d = Math.hypot(dx, dy)
            if (d < R) {
              const f = 1 - d / R
              boost += f
              const k = (f * f * 20) / (d || 1)
              tx += dx * k
              ty += dy * k
            }
          }
          for (const r of ripples) {
            const age = now - r.t
            const ring = age * 0.55
            const rx = hx - r.x
            const ry = hy - r.y
            const rd = Math.hypot(rx, ry)
            const g = Math.max(0, 1 - Math.abs(rd - ring) / 70) * (1 - age / 1500)
            if (g > 0) {
              boost += g
              const k = (g * 14) / (rd || 1)
              tx += rx * k
              ty += ry * k
            }
          }
          ox[idx] += (tx - ox[idx]) * 0.16
          oy[idx] += (ty - oy[idx]) * 0.16
          if (Math.abs(tx - ox[idx]) + Math.abs(ty - oy[idx]) > 0.05) busy = true

          if (boost > 0.02) act.push(hx + ox[idx], hy + oy[idx], 1.1 + Math.min(boost, 1.4) * 2.3, Math.min(1, 0.22 + boost * 0.78))
          else {
            const x = hx + ox[idx]
            ctx.moveTo(x + 1.1, hy + oy[idx])
            ctx.arc(x, hy + oy[idx], 1.1, 0, Math.PI * 2)
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
      return busy
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = parent.clientWidth
      h = parent.clientHeight
      cv.width = Math.max(1, Math.round(w * dpr))
      cv.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / gap) + 1
      rows = Math.ceil(h / gap) + 1
      ox = new Float32Array(cols * rows)
      oy = new Float32Array(cols * rows)
      draw(0)
    }

    const loop = createLoop((now) => {
      if (!visible) return false
      return draw(now) ? undefined : false
    })

    const locate = () => {
      const r = parent.getBoundingClientRect()
      const inside = cX >= r.left && cX <= r.right && cY >= r.top && cY <= r.bottom
      px = inside ? cX - r.left : -9999
      py = inside ? cY - r.top : -9999
    }
    const onMove = (e: PointerEvent) => {
      if (isLite() || reduce) return
      cX = e.clientX
      cY = e.clientY
      locate()
      loop.wake()
    }
    const onUp = (e: PointerEvent) => {
      // Le doigt se lève : les points se relâchent.
      if (e.pointerType === "mouse") return
      px = py = -9999
      loop.wake()
    }
    const onDown = (e: PointerEvent) => {
      if (isLite() || reduce || (e.pointerType === "mouse" && e.button !== 0)) return
      const r = parent.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() })
      if (e.pointerType !== "mouse") {
        cX = e.clientX
        cY = e.clientY
        locate()
      }
      loop.wake()
    }

    readColors()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) {
        draw(performance.now())
        loop.wake()
      }
    })
    io.observe(parent)
    const mo = new MutationObserver(() => {
      readColors()
      draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    // Le contenu défile sous un pointeur immobile : on recalcule sa position relative, sans écouteur propre.
    const stopScroll = onScroll({
      el: parent,
      read: () => {
        if (px > -9000) locate()
      },
      write: () => {
        if (px > -9000) loop.wake()
      },
    })

    document.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerdown", onDown, { passive: true })
    document.addEventListener("pointerup", onUp, { passive: true })
    document.addEventListener("pointercancel", onUp, { passive: true })
    return () => {
      loop.destroy()
      stopScroll()
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointerup", onUp)
      document.removeEventListener("pointercancel", onUp)
    }
  }, [gap])

  return <canvas ref={ref} className="dotgrid" aria-hidden />
}
