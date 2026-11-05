"use client"

import { useEffect, useRef } from "react"

/** Trois halos de couleur fixes en arrière-plan : ils dérivent avec le défilement et suivent doucement le pointeur. */
export function Aurora() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const blobs = Array.from(el.children) as HTMLElement[]
    let mx = 0
    let my = 0
    let cx = 0
    let cy = 0
    let sp = 0
    let raf = 0
    let last = performance.now()

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    }
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      sp = max > 0 ? window.scrollY / max : 0
    }
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const k = 1 - Math.exp(-dt / 0.6)
      cx += (mx - cx) * k
      cy += (my - cy) * k
      const t = now / 1000
      blobs.forEach((b, i) => {
        const dir = i % 2 ? -1 : 1
        const x = cx * (80 + i * 50) * dir + Math.sin(t * (0.15 + i * 0.06) + i) * 60
        const y = sp * (220 + i * 160) * dir + cy * 60 + Math.cos(t * (0.12 + i * 0.05)) * 50
        b.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${(1 + Math.sin(sp * 6 + i) * 0.12).toFixed(3)})`
      })
      raf = requestAnimationFrame(tick)
    }
    onScroll()
    document.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    raf = requestAnimationFrame(tick)
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", onScroll)
      document.removeEventListener("visibilitychange", onVis)
    }
  }, [])

  return (
    <div ref={root} className="aurora" aria-hidden>
      <span className="aurora__blob aurora__blob--1" />
      <span className="aurora__blob aurora__blob--2" />
      <span className="aurora__blob aurora__blob--3" />
    </div>
  )
}
