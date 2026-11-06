"use client"

import { useEffect, useRef } from "react"

/**
 * Distorsion « liquide » des images au survol : un filtre SVG partagé dont l'intensité monte en douceur
 * sur l'image des éléments `[data-liquid]`, puis retombe à zéro (le filtre est retiré une fois au repos).
 */
export function LiquidFilter() {
  const disp = useRef<SVGFEDisplacementMapElement>(null)

  useEffect(() => {
    const map = disp.current
    if (!map) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let host: HTMLElement | null = null
    let img: HTMLElement | null = null
    let target = 0
    let cur = 0
    let raf = 0
    let last = 0

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      cur += (target - cur) * (1 - Math.exp(-dt / 0.2))
      map.setAttribute("scale", cur.toFixed(2))
      if (target === 0 && cur < 0.4) {
        if (img) img.style.filter = ""
        img = null
        cur = 0
        raf = 0
        return
      }
      raf = requestAnimationFrame(loop)
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const h = (e.target as Element | null)?.closest?.("[data-liquid]") as HTMLElement | null
      if (h === host) return
      host = h
      const im = h?.querySelector("img") as HTMLElement | null
      if (!h || !im) {
        target = 0
        return
      }
      if (img && img !== im) img.style.filter = ""
      img = im
      im.style.filter = "url(#liquid-fx)"
      target = 26
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }

    document.addEventListener("pointerover", onOver, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("pointerover", onOver)
      if (img) img.style.filter = ""
    }
  }, [])

  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <filter id="liquid-fx" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.009 0.016" numOctaves="2" seed="7" result="noise" />
        <feDisplacementMap ref={disp} in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}
