"use client"

import { useEffect, useRef } from "react"

/**
 * Grille de points en arrière-plan d'une section (le parent doit être positionné).
 * Les points proches du pointeur grossissent, prennent l'accent et s'écartent ; un clic lance une onde.
 * Le dessin ne tourne que lorsque la section est visible ET qu'il y a du mouvement à rendre.
 */
export function DotGrid({ gap = 30 }: { gap?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const parent = cv?.parentElement
    const ctx = cv?.getContext("2d")
    if (!cv || !parent || !ctx) return

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const interactive = fine && !reduce

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
    let raf = 0
    let visible = false
    let fg = "#0a0a0a"
    let accent = "#059669"

    const readColors = () => {
      const cs = getComputedStyle(document.documentElement)
      fg = cs.getPropertyValue("--fg").trim() || fg
      accent = cs.getPropertyValue("--accent").trim() || accent
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
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

    const R = 150
    const draw = (now: number): boolean => {
      ctx.clearRect(0, 0, w, h)
      let busy = false
      ripples = ripples.filter((r) => now - r.t < 1500)
      if (ripples.length) busy = true
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
          const d = Math.hypot(dx, dy)
          if (d < R) {
            const f = 1 - d / R
            boost += f
            const k = (f * f * 20) / (d || 1)
            tx += dx * k
            ty += dy * k
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

          const on = boost > 0.02
          ctx.globalAlpha = on ? Math.min(1, 0.22 + boost * 0.78) : 0.2
          ctx.fillStyle = on ? accent : fg
          ctx.beginPath()
          ctx.arc(hx + ox[idx], hy + oy[idx], 1.1 + Math.min(boost, 1.4) * 2.3, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
      return busy
    }

    const loop = (now: number) => {
      const busy = draw(now)
      raf = visible && (busy || (px > -9000 && py > -9000)) ? requestAnimationFrame(loop) : 0
    }
    const ensure = () => {
      if (raf || !visible) return
      raf = requestAnimationFrame(loop)
    }

    const locate = () => {
      const r = parent.getBoundingClientRect()
      const inX = cX >= r.left && cX <= r.right
      const inY = cY >= r.top && cY <= r.bottom
      if (inX && inY) {
        px = cX - r.left
        py = cY - r.top
      } else {
        px = -9999
        py = -9999
      }
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      cX = e.clientX
      cY = e.clientY
      locate()
      ensure()
    }
    const onScroll = () => {
      if (cX < -9000) return
      locate()
      ensure()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return
      const r = parent.getBoundingClientRect()
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return
      ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() })
      ensure()
    }

    readColors()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) {
        draw(performance.now())
        ensure()
      }
    })
    io.observe(parent)
    const mo = new MutationObserver(() => {
      readColors()
      draw(performance.now())
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    if (interactive) {
      document.addEventListener("pointermove", onMove, { passive: true })
      document.addEventListener("pointerdown", onDown, { passive: true })
      window.addEventListener("scroll", onScroll, { passive: true })
    }
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerdown", onDown)
      window.removeEventListener("scroll", onScroll)
    }
  }, [gap])

  return <canvas ref={ref} className="dotgrid" aria-hidden />
}
