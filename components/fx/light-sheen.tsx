"use client"

import { useEffect, useRef } from "react"
import { createLoop } from "@/lib/frame"

/**
 * Source de lumière globale : un halo doux, en fusion « lumière douce », suit la souris ou le doigt
 * avec de l'inertie et éclaire tout le site (textes, cartes, images) comme une vraie lampe.
 * Aucune boucle permanente : elle s'endort dès que le halo a rejoint sa cible.
 */
export function LightSheen() {
  const el = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = el.current
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const SIZE = 640
    let x = window.innerWidth * 0.6
    let y = window.innerHeight * 0.35
    let tx = x
    let ty = y
    const loop = createLoop((_n, dt) => {
      const k = 1 - Math.exp(-dt * 7)
      x += (tx - x) * k
      y += (ty - y) * k
      node.style.transform = `translate3d(${(x - SIZE / 2).toFixed(1)}px, ${(y - SIZE / 2).toFixed(1)}px, 0)`
      return Math.abs(tx - x) + Math.abs(ty - y) > 0.4
    })
    const move = (e: PointerEvent) => {
      tx = e.clientX
      ty = e.clientY
      node.dataset.on = "1"
      loop.wake()
    }
    document.addEventListener("pointermove", move, { passive: true })
    document.addEventListener("pointerdown", move, { passive: true })
    return () => {
      document.removeEventListener("pointermove", move)
      document.removeEventListener("pointerdown", move)
      loop.destroy()
    }
  }, [])

  return <div ref={el} className="light-sheen" aria-hidden />
}
