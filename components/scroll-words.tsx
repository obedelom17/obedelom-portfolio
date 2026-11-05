"use client"

import { useEffect, useRef } from "react"

/**
 * Texte dont les mots s'allument un à un au fil du défilement.
 * Le texte reste lisible sans script (opacité réduite, jamais nulle).
 */
export function ScrollWords({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const words = text.split(/\s+/).filter(Boolean)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const spans: HTMLElement[] = []
    root.querySelectorAll<HTMLElement>("[data-w]").forEach((el) => spans.push(el))
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => (s.style.opacity = "1"))
      return
    }
    const n = spans.length
    const spread = 7
    let raf = 0

    const update = () => {
      raf = 0
      const r = root.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(Math.max((vh * 0.9 - r.top) / (vh * 0.35 + r.height), 0), 1)
      for (let i = 0; i < n; i++) {
        const w = Math.min(Math.max((p * (n + spread) - i) / spread, 0), 1)
        spans[i].style.opacity = String(0.16 + 0.84 * w)
      }
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [text])

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={`${i}-${w}`} data-w style={{ opacity: 0.16 }}>
          {w}{" "}
        </span>
      ))}
    </p>
  )
}
