"use client"

import { useEffect, useRef } from "react"

type Pt = { x: number; y: number; t: number }
const LIFE = 520

/** Traînée lumineuse (comète) derrière le pointeur. Souris uniquement ; le canevas s'arrête quand plus rien ne bouge. */
export function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    let raf = 0
    let c1 = "#059669"
    let c2 = "#0891b2"
    const pts: Pt[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const colors = () => {
      const css = getComputedStyle(document.documentElement)
      c1 = css.getPropertyValue("--accent").trim() || c1
      c2 = css.getPropertyValue("--accent-2").trim() || c2
    }

    const loop = (now: number) => {
      while (pts.length && now - pts[0].t > LIFE) pts.shift()
      ctx.clearRect(0, 0, w, h)
      if (pts.length < 2) {
        raf = 0
        return
      }
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]
        const b = pts[i]
        const life = 1 - (now - b.t) / LIFE
        ctx.strokeStyle = i % 2 ? c1 : c2
        ctx.globalAlpha = Math.max(0, life) * 0.55
        ctx.lineWidth = 1 + life * 7
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      pts.push({ x: e.clientX, y: e.clientY, t: performance.now() })
      if (pts.length > 60) pts.shift()
      if (!raf) raf = requestAnimationFrame(loop)
    }

    colors()
    resize()
    const theme = new MutationObserver(colors)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    window.addEventListener("resize", resize)
    document.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      theme.disconnect()
      window.removeEventListener("resize", resize)
      document.removeEventListener("pointermove", onMove)
    }
  }, [])

  return <canvas ref={ref} className="cursor-trail" aria-hidden />
}
