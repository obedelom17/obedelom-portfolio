"use client"

import { useEffect, useRef } from "react"
import { createLoop, frame, onScroll } from "@/lib/frame"
import { deviceTier, perfLevel } from "@/lib/perf"

/**
 * Trois halos de couleur fixes en arrière-plan : ils dérivent lentement et suivent le pointeur.
 * Mouvement lent = 30 images/s suffisent (moitié moins de travail) ; pause pendant le défilement ;
 * coupé aux niveaux d'économie (CSS) et sur les appareils modestes.
 */
export function Aurora() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (deviceTier() === "low") return
    const blobs = Array.from(el.children) as HTMLElement[]
    let mx = 0
    let my = 0
    let cx = 0
    let cy = 0
    let sp = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5
      my = e.clientY / window.innerHeight - 0.5
    }
    const stopScroll = onScroll({
      write: () => {
        sp = frame.progress
      },
    })
    const loop = createLoop(
      (now, dt) => {
        if (perfLevel() >= 1) return false
        if (frame.scrolling) return
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
      },
      { fps: 30 },
    )
    loop.wake()
    document.addEventListener("pointermove", onMove, { passive: true })
    return () => {
      loop.destroy()
      stopScroll()
      document.removeEventListener("pointermove", onMove)
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
