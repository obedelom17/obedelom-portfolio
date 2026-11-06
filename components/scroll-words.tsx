"use client"

import { useEffect, useRef } from "react"
import { frame, onScroll } from "@/lib/frame"

/**
 * Texte dont les mots s'allument un à un au fil du défilement.
 * Le texte reste lisible sans script (opacité réduite, jamais nulle).
 * Les mesures sont groupées avec les autres effets (une seule mise en page par image) et les styles
 * ne sont réécrits que lorsque la progression a réellement bougé.
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
    let p = 0
    let last = -1
    return onScroll({
      el: root,
      read: () => {
        const r = root.getBoundingClientRect()
        const vh = frame.vh
        p = Math.min(Math.max((vh * 0.9 - r.top) / (vh * 0.35 + r.height), 0), 1)
      },
      write: () => {
        if (Math.abs(p - last) < 0.004 && p !== 0 && p !== 1) return
        last = p
        for (let i = 0; i < n; i++) {
          const w = Math.min(Math.max((p * (n + spread) - i) / spread, 0), 1)
          spans[i].style.opacity = (0.16 + 0.84 * w).toFixed(2)
        }
      },
    })
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
