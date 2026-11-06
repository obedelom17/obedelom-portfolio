"use client"

import { useEffect } from "react"

/** Inertie de la molette, en secondes. Plus la valeur est grande, plus le défilement paraît « lourd ». */
const TAU = 0.125

/** Multiplicateur de la molette : plus grand = défilement plus rapide. */
const WHEEL_SPEED = 1.05

/** Courbe des déplacements vers une section : départ et arrivée très doux, aucun à-coup. */
const ease = (p: number) => (p < 0.5 ? 16 * p ** 5 : 1 - (-2 * p + 2) ** 5 / 2)

function inNestedScroller(start: EventTarget | null, dy: number) {
  let el = start instanceof HTMLElement ? start : null
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = getComputedStyle(el)
    if ((overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
      const atTop = el.scrollTop <= 0 && dy < 0
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1 && dy > 0
      if (!atTop && !atBottom) return true
    }
    el = el.parentElement
  }
  return false
}

/**
 * Défilement fluide, sans dépendance, cadencé par requestAnimationFrame sur le temps réel écoulé
 * (identique à 60, 120 ou 144 Hz).
 * - Molette et clavier (souris ou pavé tactile) : inertie exponentielle.
 * - Liens d'ancre, tous appareils : déplacement chronométré avec courbe d'accélération douce.
 *   Pendant ce trajet, la classe `is-navigating` est posée sur <html> : les apparitions de contenu
 *   et les changements d'ambiance sont suspendus, puis rejoués à l'arrivée (événement `nav:end`).
 *   Le trajet ne fait donc que déplacer la page, sans aucun autre calcul : zéro saccade.
 * Le tactile garde son défilement natif.
 */
export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    const root = document.documentElement
    root.classList.add("smooth-scroll")

    let current = window.scrollY
    let target = current
    let raf = 0
    let last = 0
    let running = false
    let glide: { from: number; to: number; t0: number; dur: number } | null = null

    const limit = () => Math.max(0, root.scrollHeight - window.innerHeight)
    const clamp = (v: number) => Math.min(Math.max(v, 0), limit())

    const endGlide = () => {
      if (!glide) return
      glide = null
      root.classList.remove("is-navigating")
      window.dispatchEvent(new Event("nav:end"))
    }

    const tick = (now: number) => {
      if (glide) {
        const p = Math.min((now - glide.t0) / glide.dur, 1)
        current = glide.from + (glide.to - glide.from) * ease(p)
        window.scrollTo(0, current)
        if (p >= 1) {
          current = target = glide.to
          running = false
          endGlide()
          return
        }
        raf = requestAnimationFrame(tick)
        return
      }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      current += (target - current) * (1 - Math.exp(-dt / TAU))
      if (Math.abs(target - current) < 0.1) {
        current = target
        running = false
      }
      window.scrollTo(0, current)
      if (running) raf = requestAnimationFrame(tick)
    }

    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }

    const stop = () => {
      cancelAnimationFrame(raf)
      running = false
      endGlide()
      current = target = window.scrollY
    }

    const scrollBy = (dy: number) => {
      if (glide) stop()
      if (!running) {
        current = window.scrollY
        target = current
      }
      target = clamp(target + dy)
      start()
    }

    const glideTo = (y: number) => {
      const to = clamp(y)
      const from = window.scrollY
      const dist = Math.abs(to - from)
      if (dist < 2) return
      cancelAnimationFrame(raf)
      current = from
      target = to
      const dur = Math.min(1700, Math.max(750, 600 + dist * 0.22))
      glide = { from, to, t0: performance.now(), dur }
      root.classList.add("is-navigating")
      running = true
      raf = requestAnimationFrame(tick)
    }

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.defaultPrevented) return
      if (document.body.style.overflow === "hidden") return // visionneuse ouverte
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      if (inNestedScroller(e.target, e.deltaY)) return
      e.preventDefault()
      let dy = e.deltaY
      if (e.deltaMode === 1) dy *= 33
      else if (e.deltaMode === 2) dy *= window.innerHeight
      scrollBy(dy * WHEEL_SPEED)
    }

    // Défilement natif (barre de défilement, retour arrière du navigateur) : on resynchronise.
    const onScroll = () => {
      if (running) return
      current = window.scrollY
      target = current
    }

    // Un doigt posé pendant un trajet l'interrompt immédiatement.
    const onTouch = () => {
      if (glide) stop()
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest?.("a[href^='#']") as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute("href") ?? ""
      if (hash.length < 2) return
      const id = decodeURIComponent(hash.slice(1))
      const el = id === "top" ? null : document.getElementById(id)
      if (id !== "top" && !el) return
      e.preventDefault()
      const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
      glideTo(el ? el.getBoundingClientRect().top + window.scrollY - offset : 0)
      history.replaceState(null, "", hash)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      if (document.body.style.overflow === "hidden") return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A|VIDEO|IFRAME)$/.test(t.tagName))) return
      const page = window.innerHeight * 0.9
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          return scrollBy(70)
        case "ArrowUp":
          e.preventDefault()
          return scrollBy(-70)
        case "PageDown":
          e.preventDefault()
          return scrollBy(page)
        case "PageUp":
          e.preventDefault()
          return scrollBy(-page)
        case " ":
          e.preventDefault()
          return scrollBy(e.shiftKey ? -page : page)
        case "Home":
          e.preventDefault()
          return glideTo(0)
        case "End":
          e.preventDefault()
          return glideTo(limit())
      }
    }

    const onResize = () => {
      target = clamp(target)
    }

    if (fine) window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    window.addEventListener("touchstart", onTouch, { passive: true })
    document.addEventListener("click", onClick)
    if (fine) document.addEventListener("keydown", onKey)

    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove("smooth-scroll", "is-navigating")
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("touchstart", onTouch)
      document.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return null
}
