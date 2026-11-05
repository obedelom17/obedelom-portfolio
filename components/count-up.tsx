"use client"

import { useEffect, useRef, useState } from "react"

/** Compteur qui monte jusqu'à `to` quand il entre à l'écran. */
export function CountUp({ to, pad = 2, duration = 1600 }: { to: number; pad?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      setValue(to)
      return
    }
    let raf = 0
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const step = (now: number) => {
        const p = Math.min((now - t0) / duration, 1)
        setValue(Math.round(to * (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p))))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, duration])

  return <span ref={ref}>{String(value).padStart(pad, "0")}</span>
}
