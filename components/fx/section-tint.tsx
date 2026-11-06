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
        entries.forEach((e) => {
          if (e.isIntersecting) root.dataset.sec = (e.target as HTMLElement).id
        })
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    secs.forEach((s) => io.observe(s))
    return () => {
      io.disconnect()
    }
  }, [])
  return null
}
