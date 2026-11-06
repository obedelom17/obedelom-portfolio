"use client"

import { useEffect } from "react"
import { createLoop, frame, onScroll } from "@/lib/frame"
import { isMin } from "@/lib/perf"

/**
 * Mouvement du hero, branché sur la section #top par attributs :
 * - [data-depth="n"]   : couche qui bouge avec le pointeur (parallaxe, n = amplitude en px, signe = sens) ;
 * - [data-hero-title]  : titre incliné en 3D vers le pointeur ;
 * - [data-hero-exit]   : contenu qui s'estompe et recule quand on défile.
 *
 * La boucle d'animation ne tourne que le temps que le pointeur « rattrape » sa cible, puis elle s'endort :
 * plus aucun style n'est écrit au repos.
 */
export function HeroMotion() {
  useEffect(() => {
    const hero = document.getElementById("top")
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const layers = Array.from(hero.querySelectorAll<HTMLElement>("[data-depth]"))
    const title = hero.querySelector<HTMLElement>("[data-hero-title]")
    const exit = hero.querySelector<HTMLElement>("[data-hero-exit]")
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let visible = true

    const paint = () => {
      for (const l of layers) {
        const d = parseFloat(l.dataset.depth ?? "0")
        l.style.transform = `translate3d(${(cx * d).toFixed(2)}px, ${(cy * d).toFixed(2)}px, 0)`
      }
      if (title) {
        title.style.transform =
          Math.abs(cx) + Math.abs(cy) < 0.002
            ? ""
            : `perspective(1400px) rotateY(${(cx * 3.2).toFixed(2)}deg) rotateX(${(-cy * 2.4).toFixed(2)}deg)`
      }
    }

    const loop = createLoop((_n, dt) => {
      if (!visible || isMin()) return false
      const k = 1 - Math.exp(-dt / 0.18)
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      if (Math.abs(tx - cx) + Math.abs(ty - cy) < 0.0015) {
        cx = tx
        cy = ty
        paint()
        return false
      }
      paint()
    })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const r = hero.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2
      loop.wake()
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      loop.wake()
    }

    let p = 0
    let lastP = -1
    const stop = onScroll({
      el: hero,
      read: () => {
        p = Math.min(Math.max(frame.y / (frame.vh * 0.85), 0), 1)
      },
      write: () => {
        if (!exit || Math.abs(p - lastP) < 0.002) return
        lastP = p
        exit.style.opacity = String(Math.max(0, 1 - p * 1.1).toFixed(3))
        exit.style.transform = `translate3d(0, ${(p * 70).toFixed(1)}px, 0) scale(${(1 - p * 0.05).toFixed(3)})`
      },
    })

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && (tx !== cx || ty !== cy)) loop.wake()
    })
    io.observe(hero)
    if (fine) {
      hero.addEventListener("pointermove", onMove, { passive: true })
      hero.addEventListener("pointerleave", onLeave)
    }
    return () => {
      loop.destroy()
      io.disconnect()
      stop()
      hero.removeEventListener("pointermove", onMove)
      hero.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return null
}
