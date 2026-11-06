"use client"

import { useEffect, useRef, type ReactNode } from "react"

type Variant = "up" | "left" | "right" | "scale" | "clip" | "blur" | "rotate" | "flip" | "zoom" | "skew" | "motion"

/**
 * Apparition au défilement.
 *
 * Performance : l'état « visible » est posé directement sur le nœud DOM (classe), jamais dans l'état React.
 * Une apparition ne déclenche donc aucun re-rendu du contenu (images, cartes, vidéos…), ce qui évitait
 * un à-coup au moment précis où l'élément entrait à l'écran. `will-change` n'est actif que pendant la
 * transition puis retiré (`data-done`), pour ne pas garder des dizaines de calques en mémoire.
 *
 * Variante `motion` : arrivée avec flou de mouvement (flou + translation + léger zoom), pour les visuels.
 * Le flou est retiré aux niveaux d'économie (CSS).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: ReactNode
  className?: string
  delay?: number
  variant?: Variant
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    let done = 0
    const reveal = () => {
      el.classList.add("is-visible")
      if (variant === "motion") window.dispatchEvent(new Event("fx:reveal"))
      done = window.setTimeout(() => el.setAttribute("data-done", ""), 1500 + delay)
    }
    if (typeof IntersectionObserver === "undefined") {
      reveal()
      return
    }
    const show = () => {
      io.disconnect()
      window.removeEventListener("nav:end", onEnd)
      reveal()
    }
    // Pendant un trajet vers une section, rien n'est calculé ; à l'arrivée on rejoue ce qui est à l'écran.
    const onEnd = () => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) show()
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !root.classList.contains("is-navigating")) show()
      },
      { rootMargin: "0px 0px -8% 0px" },
    )
    io.observe(el)
    window.addEventListener("nav:end", onEnd)
    return () => {
      io.disconnect()
      window.removeEventListener("nav:end", onEnd)
      window.clearTimeout(done)
    }
  }, [variant, delay])

  return (
    <div ref={ref} data-v={variant} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
