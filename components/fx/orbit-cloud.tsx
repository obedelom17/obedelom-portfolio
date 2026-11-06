"use client"

import { useEffect, useRef } from "react"
import { skills } from "@/lib/skills"

/**
 * Sphère 3D de logos : rotation automatique, glisser pour la faire tourner avec inertie,
 * profondeur rendue par l'échelle et l'opacité. Calcul à chaque image, sans bibliothèque.
 */
export function OrbitCloud({ hint }: { hint: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const items = useRef<(HTMLSpanElement | null)[]>([])
  const techs = skills.flatMap((s) => s.items)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const n = techs.length
    const pts = techs.map((_, i) => {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const a = i * Math.PI * (3 - Math.sqrt(5))
      return [Math.cos(a) * r, y, Math.sin(a) * r] as const
    })

    let ax = 0.0016, ay = 0.0026
    let vx = ax, vy = ay
    let rx = 0, ry = 0
    let drag = false, lx = 0, ly = 0
    let visible = true
    let raf = 0

    const draw = () => {
      raf = 0
      const R = Math.min(el.clientWidth, el.clientHeight) * 0.38
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry)
      pts.forEach(([x, y, z], i) => {
        const x1 = x * cy + z * sy
        const z1 = -x * sy + z * cy
        const y2 = y * cx - z1 * sx
        const z2 = y * sx + z1 * cx
        const s = 0.6 + (z2 + 1) * 0.3
        const node = items.current[i]
        if (!node) return
        node.style.transform = `translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${s})`
        node.style.opacity = String(0.25 + (z2 + 1) * 0.375)
        node.style.zIndex = String(Math.round((z2 + 1) * 50))
      })
      if (!drag) {
        vx += (ax - vx) * 0.02
        vy += (ay - vy) * 0.02
      }
      if (!reduce) {
        rx += vx
        ry += vy
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(draw)
    }
    const kick = () => !raf && (raf = requestAnimationFrame(draw))

    const down = (e: PointerEvent) => {
      drag = true
      lx = e.clientX
      ly = e.clientY
      el.setPointerCapture(e.pointerId)
      el.dataset.drag = "1"
    }
    const move = (e: PointerEvent) => {
      if (!drag) return
      vy = (e.clientX - lx) * 0.006
      vx = -(e.clientY - ly) * 0.006
      lx = e.clientX
      ly = e.clientY
      rx += vx
      ry += vy
      kick()
    }
    const up = () => {
      drag = false
      delete el.dataset.drag
    }
    el.addEventListener("pointerdown", down)
    el.addEventListener("pointermove", move)
    el.addEventListener("pointerup", up)
    el.addEventListener("pointercancel", up)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(el)
    kick()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener("pointerdown", down)
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerup", up)
      el.removeEventListener("pointercancel", up)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="orbit" ref={wrap} role="img" aria-label={techs.map((t) => t.name).join(", ")}>
      <div className="orbit__core" aria-hidden />
      {techs.map((t, i) => (
        <span key={t.name} className="orbit__item" ref={(n) => { items.current[i] = n }} title={t.name}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/tech/${t.icon}.svg`} alt="" width={28} height={28} draggable={false} />
        </span>
      ))}
      <p className="orbit__hint label">{hint}</p>
    </div>
  )
}
