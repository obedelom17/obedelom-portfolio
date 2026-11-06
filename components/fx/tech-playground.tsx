"use client"

import { useEffect, useRef } from "react"
import { skills } from "@/lib/skills"
import { createLoop } from "@/lib/frame"
import { play } from "@/lib/sound"
import { haptic } from "@/lib/perf"

type Ball = { x: number; y: number; vx: number; vy: number; r: number; name: string; img: HTMLImageElement }

/**
 * Terrain de jeu : les logos des technologies tombent, rebondissent, se heurtent,
 * fuient le pointeur et peuvent être attrapés puis lancés, à la souris comme au doigt.
 * Sur mobile, un doigt posé sur un logo l'attrape (le défilement de la page est alors suspendu pour ce geste) ;
 * ailleurs, la page défile normalement. Chaque rebond et choc produit un son proportionnel à sa force.
 * La simulation s'endort dès que tout est posé et immobile.
 */
export function TechPlayground({ hint }: { hint: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const host = wrap.current
    const cv = canvas.current
    if (!host || !cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const seen = new Set<string>()
    const techs = skills.flatMap((s) => s.items).filter((t) => (seen.has(t.icon) ? false : (seen.add(t.icon), true)))
    const balls: Ball[] = techs.map((t) => {
      const img = new Image()
      img.src = `/tech/${t.icon}.svg`
      return { x: 0, y: 0, vx: 0, vy: 0, r: 34, name: t.name, img }
    })

    let w = 0
    let h = 0
    let dpr = 1
    let visible = false
    let launched = false
    let hover: Ball | null = null
    let grab: Ball | null = null
    const ptr = { x: -999, y: -999, vx: 0, vy: 0, in: false, down: false }
    let label = "#6b6b66"
    let line = "#e5e5e0"

    const layout = () => {
      const rect = host.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      w = rect.width
      h = rect.height
      cv.width = Math.floor(w * dpr)
      cv.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const r = Math.max(24, Math.min(40, w / 15))
      for (const b of balls) {
        b.r = r
        b.x = Math.min(Math.max(b.x, r), w - r)
        b.y = Math.min(Math.max(b.y, r), h - r)
      }
    }

    const launch = () => {
      launched = true
      balls.forEach((b, i) => {
        b.x = b.r + Math.random() * Math.max(w - b.r * 2, 1)
        b.y = -b.r - i * 70
        b.vx = (Math.random() - 0.5) * 260
        b.vy = 0
      })
    }

    const colors = () => {
      const css = getComputedStyle(document.documentElement)
      label = css.getPropertyValue("--fg").trim() || label
      line = css.getPropertyValue("--line").trim() || line
    }

    const step = (dt: number): boolean => {
      const G = 1500
      let moving = false
      for (const b of balls) {
        if (b === grab) {
          b.vx = (ptr.x - b.x) * 22
          b.vy = (ptr.y - b.y) * 22
        } else {
          b.vy += G * dt
          if (ptr.in && !ptr.down) {
            const dx = b.x - ptr.x
            const dy = b.y - ptr.y
            const d = Math.hypot(dx, dy)
            const R = b.r + 70
            if (d < R && d > 0.01) {
              const f = (1 - d / R) * 2400
              b.vx += (dx / d) * f * dt
              b.vy += (dy / d) * f * dt
            }
          }
        }
        b.vx *= 1 - 0.25 * dt
        b.x += b.vx * dt
        b.y += b.vy * dt
        if (b.x < b.r) ((b.x = b.r), (b.vx = Math.abs(b.vx) * 0.6))
        else if (b.x > w - b.r) ((b.x = w - b.r), (b.vx = -Math.abs(b.vx) * 0.6))
        if (b.y > h - b.r) {
          b.y = h - b.r
          if (b.vy > 220 && visible) play("bounce", Math.min(1, b.vy / 1500))
          b.vy = -Math.abs(b.vy) * 0.5
          b.vx *= 0.985
          if (Math.abs(b.vy) < 25) b.vy = 0
        }
        if (Math.abs(b.vx) > 6 || Math.abs(b.vy) > 6 || b.y < h - b.r - 1) moving = true
      }
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i]
          const c = balls[j]
          const dx = c.x - a.x
          const dy = c.y - a.y
          const min = a.r + c.r
          const d2 = dx * dx + dy * dy
          if (d2 >= min * min || d2 === 0) continue
          const d = Math.sqrt(d2)
          const nx = dx / d
          const ny = dy / d
          const push = (min - d) / 2
          a.x -= nx * push
          a.y -= ny * push
          c.x += nx * push
          c.y += ny * push
          const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny
          if (rv < 0) {
            if (rv < -140 && visible) play("bounce", Math.min(1, -rv / 900))
            const j2 = -rv * 0.75
            a.vx -= j2 * nx
            a.vy -= j2 * ny
            c.vx += j2 * nx
            c.vy += j2 * ny
          }
        }
      }
      return moving
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const b of balls) {
        if (b.y < -b.r) continue
        ctx.fillStyle = "rgba(0,0,0,0.07)"
        ctx.beginPath()
        ctx.arc(b.x, b.y + 5, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = "#ffffff"
        ctx.strokeStyle = b === hover || b === grab ? label : line
        ctx.lineWidth = b === hover || b === grab ? 2 : 1
        ctx.beginPath()
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
        if (b.img.complete && b.img.naturalWidth > 0) {
          const s = b.r * 1.15
          ctx.drawImage(b.img, b.x - s / 2, b.y - s / 2, s, s)
        }
      }
      const tip = grab ?? hover
      if (tip) {
        ctx.font = '500 12px "Geist Mono Variable", ui-monospace, monospace'
        const tw = ctx.measureText(tip.name).width + 18
        const tx = Math.min(Math.max(tip.x - tw / 2, 4), w - tw - 4)
        const ty = Math.max(tip.y - tip.r - 30, 4)
        ctx.fillStyle = label
        ctx.fillRect(tx, ty, tw, 22)
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#fff"
        ctx.textBaseline = "middle"
        ctx.fillText(tip.name, tx + 9, ty + 11.5)
      }
    }

    // La boucle partagée s'endort quand tout est posé, immobile et sans interaction : zéro travail au repos.
    const loop = createLoop((_now, dt) => {
      if (!visible) return false
      const sub = 2
      let moving = false
      for (let i = 0; i < sub; i++) if (step(Math.min(dt, 1 / 30) / sub)) moving = true
      draw()
      if (!moving && !grab && !ptr.in) return false
    })

    const pick = (x: number, y: number) => {
      for (let i = balls.length - 1; i >= 0; i--) {
        const b = balls[i]
        if (Math.hypot(b.x - x, b.y - y) <= b.r) return b
      }
      return null
    }
    const local = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onMove = (e: PointerEvent) => {
      const p = local(e)
      ptr.vx = p.x - ptr.x
      ptr.vy = p.y - ptr.y
      ptr.x = p.x
      ptr.y = p.y
      if (e.pointerType === "mouse") {
        ptr.in = true
        hover = pick(p.x, p.y)
      }
      loop.wake()
    }
    const onDown = (e: PointerEvent) => {
      const p = local(e)
      ptr.x = p.x
      ptr.y = p.y
      ptr.vx = ptr.vy = 0
      grab = pick(p.x, p.y)
      ptr.down = !!grab
      if (grab) {
        try {
          cv.setPointerCapture(e.pointerId)
        } catch {}
        if (e.pointerType !== "mouse") haptic(10)
        play("pop")
        loop.wake()
      }
    }
    const onUp = (e: PointerEvent) => {
      if (grab) {
        const fast = Math.hypot(ptr.vx, ptr.vy) > 1.2
        grab.vx = Math.max(-2200, Math.min(2200, ptr.vx * 45))
        grab.vy = fast ? Math.max(-2200, Math.min(2200, ptr.vy * 45)) : -560 // simple appui : le logo saute
        play("whoosh")
        loop.wake()
      }
      grab = null
      ptr.down = false
      if (e.pointerType !== "mouse") ptr.in = false
    }
    const onLeave = () => {
      ptr.in = false
      hover = null
    }
    // Tactile : si le doigt se pose sur un logo, on bloque le défilement pour ce geste uniquement.
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      const r = cv.getBoundingClientRect()
      if (pick(t.clientX - r.left, t.clientY - r.top) && e.cancelable) e.preventDefault()
    }

    colors()
    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(host)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) loop.wake()
      if (visible && !launched) {
        if (reduce) {
          balls.forEach((b, i) => {
            b.x = b.r + ((i * 97) % Math.max(w - b.r * 2, 1))
            b.y = h - b.r
          })
          launched = true
          draw()
        } else launch()
      }
    }, { threshold: 0.25 })
    io.observe(host)
    const theme = new MutationObserver(colors)
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    cv.addEventListener("pointermove", onMove, { passive: true })
    cv.addEventListener("pointerdown", onDown)
    cv.addEventListener("pointerup", onUp)
    cv.addEventListener("pointercancel", onUp)
    cv.addEventListener("pointerleave", onLeave)
    cv.addEventListener("touchstart", onTouchStart, { passive: false })
    if (!reduce) loop.wake()
    return () => {
      loop.destroy()
      ro.disconnect()
      io.disconnect()
      theme.disconnect()
      cv.removeEventListener("pointermove", onMove)
      cv.removeEventListener("pointerdown", onDown)
      cv.removeEventListener("pointerup", onUp)
      cv.removeEventListener("pointercancel", onUp)
      cv.removeEventListener("pointerleave", onLeave)
      cv.removeEventListener("touchstart", onTouchStart)
    }
  }, [])

  return (
    <div ref={wrap} className="playground" aria-hidden>
      <canvas ref={canvas} className="playground__cv" />
      <p className="playground__hint label">{hint}</p>
    </div>
  )
}
