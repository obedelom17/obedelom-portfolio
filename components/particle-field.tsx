"use client"

import { useEffect, useRef } from "react"

type P = { x: number; y: number; vx: number; vy: number }

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim()
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(full, 16)
  return Number.isNaN(n) ? [5, 150, 105] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * Réseau de particules interactif : les points dérivent, se relient quand ils sont proches
 * et sont attirés par le pointeur. S'arrête hors écran et sans mouvement demandé.
 */
export function ParticleField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement
    if (!canvas || !host) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let w = 0
    let h = 0
    let dpr = 1
    let parts: P[] = []
    let raf = 0
    let last = performance.now()
    let visible = true
    let frame = 0
    let color: [number, number, number] = [5, 150, 105]
    const mouse = { x: -9999, y: -9999 }

    const readColor = () => {
      color = rgb(getComputedStyle(document.documentElement).getPropertyValue("--accent"))
    }

    const resize = () => {
      const r = host.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = r.width
      h = r.height
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(Math.max((w * h) / 17000, 28), 85))
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 26,
        vy: (Math.random() - 0.5) * 26,
      }))
    }

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave = () => {
      mouse.x = -9999
      mouse.y = -9999
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (++frame % 90 === 0) readColor()
      ctx.clearRect(0, 0, w, h)
      const [r, g, b] = color

      for (const p of parts) {
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const d2 = dx * dx + dy * dy
        if (d2 < 190 * 190 && d2 > 1) {
          const d = Math.sqrt(d2)
          const pull = (1 - d / 190) * 38
          p.vx += (dx / d) * pull * dt
          p.vy += (dy / d) * pull * dt
        }
        p.vx *= 1 - 0.35 * dt
        p.vy *= 1 - 0.35 * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        if (p.x < -10) p.x = w + 10
        else if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        else if (p.y > h + 10) p.y = -10
      }

      ctx.lineWidth = 1
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i]
        for (let j = i + 1; j < parts.length; j++) {
          const bb = parts[j]
          const dx = a.x - bb.x
          const dy = a.y - bb.y
          const d2 = dx * dx + dy * dy
          if (d2 < 130 * 130) {
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - Math.sqrt(d2) / 130) * 0.32})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(bb.x, bb.y)
            ctx.stroke()
          }
        }
        const mx = a.x - mouse.x
        const my = a.y - mouse.y
        const md = mx * mx + my * my
        if (md < 190 * 190) {
          ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - Math.sqrt(md) / 190) * 0.6})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()
        }
        ctx.fillStyle = `rgba(${r},${g},${b},0.75)`
        ctx.beginPath()
        ctx.arc(a.x, a.y, 1.7, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    readColor()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = performance.now()
    })
    io.observe(host)
    host.addEventListener("pointermove", onMove, { passive: true })
    host.addEventListener("pointerleave", onLeave)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />
}
