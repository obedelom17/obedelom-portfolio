"use client"

import { useEffect, useRef } from "react"
import { createLoop, frame } from "@/lib/frame"
import { perfLevel } from "@/lib/perf"

const items = [
  "Next.js",
  "React",
  "TypeScript",
  "Python",
  "Django",
  "PostgreSQL",
  "Supabase",
  "Tailwind CSS",
  "Flutter",
  "Cisco CCNA",
  "Git",
  "Vercel",
]

const BASE_SPEED = 55 // px par seconde au repos
const SCROLL_BOOST = 0.45 // part de la vitesse de défilement ajoutée au bandeau

function Row({ trackRef, rootRef, outlineOdd }: { trackRef: (el: HTMLDivElement | null) => void; rootRef: (el: HTMLDivElement | null) => void; outlineOdd: boolean }) {
  return (
    <div className="marquee" ref={rootRef}>
      <div ref={trackRef} className="marquee__track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((name, i) => (
              <span key={`${copy}-${name}`} className="flex shrink-0 items-center gap-8 px-4 md:gap-12 md:px-6">
                <span className={`font-serif text-4xl md:text-7xl ${(i % 2 === 1) === outlineOdd ? "outline-text" : ""}`}>
                  {name}
                </span>
                <span className="text-gradient-star text-xl md:text-3xl">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Deux bandeaux de technologies qui défilent en sens inverse.
 * Ils accélèrent avec le défilement de la page, changent de sens quand on remonte et prennent un léger
 * flou de mouvement à grande vitesse.
 *
 * Performance : la largeur d'une copie est mesurée une seule fois (ResizeObserver), jamais à chaque image ;
 * la boucle s'endort dès que le bandeau sort de l'écran ; seuls `transform` (et un flou borné sur le
 * conteneur) sont écrits.
 */
export function Marquee() {
  const tracks = useRef<(HTMLDivElement | null)[]>([null, null])
  const roots = useRef<(HTMLDivElement | null)[]>([null, null])
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = wrap.current
    if (!host) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const dirs = [1, -1]
    const pos = [0, 0]
    const half = [0, 0]
    let visible = false
    let lastBlur = -1

    const measure = () => {
      for (let i = 0; i < 2; i++) half[i] = (tracks.current[i]?.scrollWidth ?? 0) / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    tracks.current.forEach((t) => t && ro.observe(t))

    const loop = createLoop((_now, dt) => {
      if (!visible) return false
      const v = frame.velocity
      const lite = perfLevel()
      for (let i = 0; i < 2; i++) {
        const el = tracks.current[i]
        const h = half[i]
        if (!el || h <= 0) continue
        pos[i] += dirs[i] * (BASE_SPEED + v * SCROLL_BOOST) * dt
        const x = ((pos[i] % h) + h) % h
        const skew = lite === 0 ? Math.max(-12, Math.min(12, -v * 0.0026)) : 0
        el.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)${skew ? ` skewX(${skew.toFixed(2)}deg)` : ""}`
      }
      // Flou de mouvement borné, par paliers de 0,25 px pour ne pas redessiner à chaque image.
      const blur = lite === 0 ? Math.min(2.2, Math.round((Math.abs(v) / 2400) * 4) / 4) : 0
      if (blur !== lastBlur) {
        lastBlur = blur
        const f = blur > 0.2 ? `blur(${blur}px)` : "none"
        roots.current.forEach((r) => r && (r.style.filter = f))
      }
    })

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) loop.wake()
    })
    io.observe(host)
    return () => {
      io.disconnect()
      ro.disconnect()
      loop.destroy()
    }
  }, [])

  return (
    <div ref={wrap} className="space-y-2 border-y border-line py-7 md:space-y-4 md:py-10" aria-hidden>
      <Row trackRef={(el) => (tracks.current[0] = el)} rootRef={(el) => (roots.current[0] = el)} outlineOdd />
      <Row trackRef={(el) => (tracks.current[1] = el)} rootRef={(el) => (roots.current[1] = el)} outlineOdd={false} />
    </div>
  )
}
