"use client"

import { useEffect, useRef } from "react"

/** Grand chiffre de section : il se remplit de dégradé au fil du défilement et s'étire selon la vitesse. */
export function ScrollFillNum({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--fill", "1")
      return
    }
    let raf = 0
    let running = false
    let visible = true

    const frame = () => {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(Math.max((vh * 0.85 - r.top) / (vh * 0.7), 0), 1)
      el.style.setProperty("--fill", p.toFixed(3))
      running = false
    }
    const kick = () => {
      if (running || !visible) return
      running = true
      raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(el)
    window.addEventListener("scroll", kick, { passive: true })
    kick()
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", kick)
    }
  }, [])

  return (
    <span ref={ref} className={`num-fill ${className}`} style={{ ["--fill" as string]: 0 } as React.CSSProperties}>
      {value}
    </span>
  )
}
