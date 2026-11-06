"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { frame, onScroll } from "@/lib/frame"
import { isMin, onPerfChange } from "@/lib/perf"

/**
 * Décale légèrement le contenu pendant le défilement (effet de profondeur).
 * À placer dans un conteneur `overflow-hidden` : le contenu est agrandi pour ne jamais montrer de bord.
 * Le calcul n'a lieu que lorsque le conteneur est proche de l'écran, et seulement si la valeur change.
 */
export function Parallax({ children, amount = 36, className = "" }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const box = el?.parentElement
    if (!el || !box) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let t = 0
    let last = 99
    const stop = onScroll({
      el: box,
      read: () => {
        const r = box.getBoundingClientRect()
        const vh = frame.vh
        t = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)))
      },
      write: () => {
        if (isMin() || Math.abs(t - last) < 0.002) return
        last = t
        el.style.transform = `translate3d(0, ${(-t * amount).toFixed(1)}px, 0) scale(1.14)`
      },
    })
    const off = onPerfChange((l) => {
      if (l >= 2) el.style.transform = "scale(1.14)"
    })
    return () => {
      stop()
      off()
    }
  }, [amount])

  return (
    <div ref={ref} className={className} style={{ transform: "scale(1.14)", willChange: "transform" }}>
      {children}
    </div>
  )
}
