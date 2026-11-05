"use client"

import { useEffect, useRef, type ReactNode } from "react"

/**
 * Décale légèrement le contenu pendant le défilement (effet de profondeur).
 * À placer dans un conteneur `overflow-hidden` : le contenu est agrandi pour ne jamais montrer de bord.
 */
export function Parallax({ children, amount = 36, className = "" }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = box.getBoundingClientRect()
      const vh = window.innerHeight
      const t = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)))
      el.style.transform = `translate3d(0, ${(-t * amount).toFixed(2)}px, 0) scale(1.14)`
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
  }, [amount])

  return (
    <div ref={ref} className={className} style={{ transform: "scale(1.14)", willChange: "transform" }}>
      {children}
    </div>
  )
}
