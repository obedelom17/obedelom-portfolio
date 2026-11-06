"use client"

import { useEffect, useRef } from "react"
import { frame, onScroll } from "@/lib/frame"

/** Grand chiffre de section : il se remplit de dégradé au fil du défilement. */
export function ScrollFillNum({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--fill", "1")
      return
    }
    let p = 0
    let last = -1
    return onScroll({
      el,
      read: () => {
        const r = el.getBoundingClientRect()
        const vh = frame.vh
        p = Math.min(Math.max((vh * 0.85 - r.top) / (vh * 0.7), 0), 1)
      },
      write: () => {
        if (Math.abs(p - last) < 0.004 && p !== 0 && p !== 1) return
        last = p
        el.style.setProperty("--fill", p.toFixed(3))
      },
    })
  }, [])

  return (
    <span ref={ref} className={`num-fill ${className}`} style={{ ["--fill" as string]: 0 } as React.CSSProperties}>
      {value}
    </span>
  )
}
