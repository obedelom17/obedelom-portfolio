"use client"

import { useEffect } from "react"

/**
 * Pose la classe `is-scrolling` sur <html> pendant le défilement.
 * Le CSS coupe alors le survol et les canevas décoratifs se mettent en pause :
 * tout le budget de l'image est laissé au défilement, puis tout reprend dès l'arrêt.
 */
export function ScrollFlag() {
  useEffect(() => {
    const root = document.documentElement
    let timer = 0
    let on = false
    const onScroll = () => {
      if (!on) {
        on = true
        root.classList.add("is-scrolling")
      }
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        on = false
        root.classList.remove("is-scrolling")
      }, 140)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("scroll", onScroll)
      root.classList.remove("is-scrolling")
    }
  }, [])
  return null
}
