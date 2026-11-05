"use client"

import { useEffect } from "react"

/**
 * Mouvement du hero, branché sur la section #top par attributs :
 * - [data-depth="n"]   : couche qui bouge avec le pointeur (parallaxe, n = amplitude en px, signe = sens) ;
 * - [data-hero-title]  : titre incliné en 3D vers le pointeur ;
 * - [data-hero-exit]   : contenu qui s'estompe et recule quand on défile.
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
    let raf = 0
    let last = performance.now()
    let visible = true

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const r = hero.getBoundingClientRect()
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2
      ty = ((e.clientY - r.top) / Math.max(r.height, 1) - 0.5) * 2
    }
    const onLeave = () => {
      tx = 0
      ty = 0
    }
    const scrollFx = () => {
      if (!exit) return
      const p = Math.min(Math.max(window.scrollY / (window.innerHeight * 0.85), 0), 1)
      exit.style.opacity = String(1 - p * 1.1 < 0 ? 0 : 1 - p * 1.1)
      exit.style.transform = `translate3d(0, ${(p * 70).toFixed(1)}px, 0) scale(${(1 - p * 0.05).toFixed(3)})`
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      if (!visible) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const k = 1 - Math.exp(-dt / 0.18)
      cx += (tx - cx) * k
      cy += (ty - cy) * k
      for (const l of layers) {
        const d = parseFloat(l.dataset.depth ?? "0")
        l.style.transform = `translate3d(${(cx * d).toFixed(2)}px, ${(cy * d).toFixed(2)}px, 0)`
      }
      if (title) title.style.transform = `perspective(1400px) rotateY(${(cx * 3.2).toFixed(2)}deg) rotateX(${(-cy * 2.4).toFixed(2)}deg)`
    }

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      last = performance.now()
    })
    io.observe(hero)
    scrollFx()
    window.addEventListener("scroll", scrollFx, { passive: true })
    if (fine) {
      hero.addEventListener("pointermove", onMove, { passive: true })
      hero.addEventListener("pointerleave", onLeave)
      raf = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("scroll", scrollFx)
      hero.removeEventListener("pointermove", onMove)
      hero.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return null
}
