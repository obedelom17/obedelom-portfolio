"use client"

import { useEffect, useRef } from "react"

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

function Row({ trackRef, outlineOdd }: { trackRef: (el: HTMLDivElement | null) => void; outlineOdd: boolean }) {
  return (
    <div className="marquee">
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
 * Ils accélèrent avec le défilement de la page et changent de sens quand on remonte.
 */
export function Marquee() {
  const tracks = useRef<(HTMLDivElement | null)[]>([null, null])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const dirs = [1, -1]
    const pos = [0, 0]
    let last = performance.now()
    let lastY = window.scrollY
    let velocity = 0
    let raf = 0

    const tick = (now: number) => {
      const dt = Math.max(Math.min((now - last) / 1000, 0.05), 0.001)
      last = now
      const y = window.scrollY
      const instant = (y - lastY) / dt
      lastY = y
      velocity += (instant - velocity) * (1 - Math.exp(-dt / 0.15))
      for (let i = 0; i < 2; i++) {
        const el = tracks.current[i]
        if (!el) continue
        const half = el.scrollWidth / 2
        if (half <= 0) continue
        pos[i] += dirs[i] * (BASE_SPEED + velocity * SCROLL_BOOST) * dt
        const x = ((pos[i] % half) + half) % half
        const skew = Math.max(-14, Math.min(14, -velocity * 0.0028))
        el.style.transform = `translate3d(${-x}px, 0, 0) skewX(${skew.toFixed(2)}deg)`
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="space-y-2 border-y border-line py-7 md:space-y-4 md:py-10" aria-hidden>
      <Row trackRef={(el) => (tracks.current[0] = el)} outlineOdd />
      <Row trackRef={(el) => (tracks.current[1] = el)} outlineOdd={false} />
    </div>
  )
}
