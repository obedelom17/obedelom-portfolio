"use client"

import { useEffect } from "react"

/**
 * Teinte d'ambiance par section : écrit l'identifiant de la section visible dans `data-sec`
 * et la progression de page dans `--page`. Le CSS en fait varier la lueur de fond.
 */
export function SectionTint() {
  useEffect(() => {
    const root = document.documentElement
    const secs = Array.from(document.querySelectorAll<HTMLElement>("main > section[id]"))
    const io = new IntersectionObserver(
      (entries) => {
        if (root.classList.contains("is-navigating")) return
        entries.forEach((e) => {
          if (e.isIntersecting) root.dataset.sec = (e.target as HTMLElement).id
        })
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    secs.forEach((s) => io.observe(s))
    // Pas de changement d'ambiance pendant un trajet : on applique la section d'arrivée.
    const onEnd = () => {
      const mid = window.innerHeight / 2
      for (const s of secs) {
        const r = s.getBoundingClientRect()
        if (r.top <= mid && r.bottom > mid) {
          root.dataset.sec = s.id
          break
        }
      }
    }
    window.addEventListener("nav:end", onEnd)
    return () => {
      io.disconnect()
      window.removeEventListener("nav:end", onEnd)
    }
  }, [])
  return null
}
