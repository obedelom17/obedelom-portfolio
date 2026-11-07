"use client"

import { useEffect, useRef } from "react"
import { createLoop } from "@/lib/frame"
import { isLite, isTouch } from "@/lib/perf"

type N = { x: number; y: number; bx: number; by: number; ex: number; ey: number; r: number }

/**
 * Constellation du hero : des points dérivent et se relient par des traits quand ils sont proches.
 * Le pointeur (ou le doigt) est un point de plus : les points voisins s'en approchent et lui tracent des traits.
 * Un clic ou un toucher envoie une onde qui les repousse, puis ils reviennent.
 * Dessin groupé (traits regroupés par intensité), cadence libre = celle de l'écran, pause hors écran.
 */
export function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    const host = cv?.parentElement
    const ctx = cv?.getContext("2d")
    if (!cv || !host || !ctx) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const touch = isTouch()

    let w = 0
    let h = 0
    let nodes: N[] = []
    let visible = true
    let fg = "#ffffff"
    let accent = "#34d399"
    let mx = -9999
    let my = -9999
    let hold = 0 // 0..1 : intensité du curseur (retombe quand le doigt se lève)
    let holdTarget = 0
    let shocks: { x: number; y: number; t: number }[] = []
    let lastT = 0

    const LINK = touch ? 110 : 135
    const PULL = touch ? 210 : 260
    const BUCKETS = 5
    const segs: number[][] = Array.from({ length: BUCKETS }, () => [])

    const colors = () => {
      const cs = getComputedStyle(document.documentElement)
      fg = cs.getPropertyValue("--fg").trim() || fg
      accent = cs.getPropertyValue("--accent").trim() || accent
    }

    const seed = () => {
      const count = Math.round(Math.min(touch ? 56 : 120, Math.max(28, (w * h) / (touch ? 12000 : 10500))))
      nodes = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2
        const s = 12 + Math.random() * 22
        return { x: Math.random() * w, y: Math.random() * h, bx: Math.cos(a) * s, by: Math.sin(a) * s, ex: 0, ey: 0, r: 1 + Math.random() * 1.3 }
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = host.clientWidth
      h = host.clientHeight
      cv.width = Math.max(1, Math.round(w * dpr))
      cv.height = Math.max(1, Math.round(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      seed()
      draw(0)
    }

    function draw(dt: number) {
      ctx!.clearRect(0, 0, w, h)
      const now = performance.now()
      shocks = shocks.filter((s) => now - s.t < 900)
      hold += (holdTarget - hold) * Math.min(1, dt * 8)
      const damp = Math.exp(-dt * 3.2)
      const anim = dt > 0 && !reduce && !isLite()

      for (const n of nodes) {
        if (anim) {
          // Attraction vers le pointeur, avec une zone de respiration autour de lui pour ne pas s'empiler.
          if (hold > 0.02) {
            const dx = mx - n.x
            const dy = my - n.y
            const d = Math.hypot(dx, dy)
            if (d < PULL && d > 1) {
              const f = (1 - d / PULL) * hold
              // Le trait qui relie le point au curseur est un fil : le point glisse le long de ce trait et s'arrête à ~54 px.
              const dir = d < 54 ? -0.5 : 1
              n.ex += (dx / d) * (0.35 + f) * 760 * dir * dt
              n.ey += (dy / d) * (0.35 + f) * 760 * dir * dt
            }
          }
          for (const s of shocks) {
            const age = (now - s.t) / 900
            const dx = n.x - s.x
            const dy = n.y - s.y
            const d = Math.hypot(dx, dy) || 1
            if (d < 320) {
              const f = (1 - d / 320) * (1 - age) * 900
              n.ex += (dx / d) * f * dt
              n.ey += (dy / d) * f * dt
            }
          }
          n.ex *= damp
          n.ey *= damp
          n.x += (n.bx + n.ex) * dt
          n.y += (n.by + n.ey) * dt
          if (n.x < -20) n.x = w + 20
          else if (n.x > w + 20) n.x = -20
          if (n.y < -20) n.y = h + 20
          else if (n.y > h + 20) n.y = -20
        }
      }

      // Traits entre points, regroupés par intensité.
      for (const b of segs) b.length = 0
      const L2 = LINK * LINK
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const dx = a.x - b.x
          if (dx > LINK || dx < -LINK) continue
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > L2) continue
          const k = Math.min(BUCKETS - 1, Math.floor((1 - Math.sqrt(d2) / LINK) * BUCKETS))
          segs[k].push(a.x, a.y, b.x, b.y)
        }
      }
      ctx!.strokeStyle = fg
      ctx!.lineWidth = 1
      for (let k = 0; k < BUCKETS; k++) {
        const s = segs[k]
        if (!s.length) continue
        ctx!.globalAlpha = ((k + 1) / BUCKETS) * 0.32
        ctx!.beginPath()
        for (let q = 0; q < s.length; q += 4) {
          ctx!.moveTo(s[q], s[q + 1])
          ctx!.lineTo(s[q + 2], s[q + 3])
        }
        ctx!.stroke()
      }

      // Points, puis traits et halo du pointeur.
      ctx!.fillStyle = fg
      ctx!.globalAlpha = 0.55
      ctx!.beginPath()
      for (const n of nodes) {
        ctx!.moveTo(n.x + n.r, n.y)
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2)
      }
      ctx!.fill()

      if (hold > 0.02) {
        ctx!.strokeStyle = accent
        ctx!.fillStyle = accent
        ctx!.lineWidth = 1.1
        const R2 = PULL * PULL
        for (const n of nodes) {
          const dx = n.x - mx
          const dy = n.y - my
          const d2 = dx * dx + dy * dy
          if (d2 > R2) continue
          const f = 1 - Math.sqrt(d2) / PULL
          ctx!.globalAlpha = f * 0.85 * hold
          ctx!.beginPath()
          ctx!.moveTo(mx, my)
          ctx!.lineTo(n.x, n.y)
          ctx!.stroke()
          ctx!.beginPath()
          ctx!.arc(n.x, n.y, n.r + f * 2.2, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.globalAlpha = 0.9 * hold
        ctx!.beginPath()
        ctx!.arc(mx, my, 3.2, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
    }

    const loop = createLoop((t) => {
      if (!visible) {
        lastT = 0
        return false
      }
      const dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0.016
      lastT = t
      draw(dt)
    })

    const setPos = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
      if (inside) {
        mx = e.clientX - r.left
        my = e.clientY - r.top
      }
      return inside
    }
    const onMove = (e: PointerEvent) => {
      holdTarget = setPos(e) ? 1 : 0
    }
    const onDown = (e: PointerEvent) => {
      if (!setPos(e)) return
      holdTarget = 1
      shocks.push({ x: mx, y: my, t: performance.now() })
    }
    const onUp = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") holdTarget = 0
    }

    colors()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      if (visible) loop.wake()
    })
    io.observe(host)
    const mo = new MutationObserver(colors)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    loop.wake()

    document.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerdown", onDown, { passive: true })
    document.addEventListener("pointerup", onUp, { passive: true })
    document.addEventListener("pointercancel", onUp, { passive: true })
    return () => {
      loop.destroy()
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointerup", onUp)
      document.removeEventListener("pointercancel", onUp)
    }
  }, [])

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
}
