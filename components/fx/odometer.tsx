"use client"

import { useEffect, useRef, useState } from "react"

/** Compteur à rouleaux : chaque chiffre défile jusqu'à sa valeur à l'entrée dans l'écran. */
export function Odometer({ to, pad = 2 }: { to: number; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [on, setOn] = useState(false)
  const digits = String(to).padStart(pad, "0").split("")

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOn(true)
      return
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true)
        io.disconnect()
      }
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <span ref={ref} className="odo" aria-label={String(to).padStart(pad, "0")}>
      {digits.map((d, i) => (
        <span key={i} className="odo__cell" aria-hidden>
          <span
            className="odo__reel"
            style={{
              transform: on ? `translate3d(0, ${-Number(d) * 10}%, 0)` : "translate3d(0,0,0)",
              transitionDelay: `${i * 140}ms`,
              transitionDuration: `${1400 + Number(d) * 90}ms`,
            }}
          >
            {"0123456789".split("").map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  )
}
