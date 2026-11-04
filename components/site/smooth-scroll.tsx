"use client"

import { useEffect } from "react"

/** Inertie du défilement, en secondes. Plus la valeur est grande, plus le défilement paraît « lourd ». */
const TAU = 0.14

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
 * Défilement fluide avec inertie, sans dépendance.
 * L'animation est cadencée par requestAnimationFrame et calculée avec le temps réel écoulé entre
 * deux images : elle suit donc la fréquence de l'écran (60, 120 ou 144 Hz) sans changer de vitesse.
 * Actif uniquement avec une souris ou un pavé tactile ; le tactile mobile garde son défilement natif.
 */
export function SmoothScroll() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!fine || reduce) return

    const root = document.documentElement
    root.classList.add("smooth-scroll")

    let current = window.scrollY
    let target = current
    let raf = 0
    let last = 0
    let running = false

    const limit = () => Math.max(0, root.scrollHeight - window.innerHeight)
    const clamp = (v: number) => Math.min(Math.max(v, 0), limit())

    const tick = (now: number) => {
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

    const scrollBy = (dy: number) => {
      if (!running) {
        current = window.scrollY
        target = current
      }
      target = clamp(target + dy)
      start()
    }

    const scrollTo = (y: number) => {
      if (!running) current = window.scrollY
      target = clamp(y)
      start()
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
      scrollBy(dy)
    }

    // Défilement natif (barre de défilement, retour arrière du navigateur) : on resynchronise.
    const onScroll = () => {
      if (running) return
      current = window.scrollY
      target = current
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
      scrollTo(el ? el.getBoundingClientRect().top + window.scrollY - offset : 0)
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
          return scrollTo(0)
        case "End":
          e.preventDefault()
          return scrollTo(limit())
      }
    }

    const onResize = () => {
      target = clamp(target)
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onResize)
    document.addEventListener("click", onClick)
    document.addEventListener("keydown", onKey)

    return () => {
      cancelAnimationFrame(raf)
      root.classList.remove("smooth-scroll")
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onResize)
      document.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  return null
}
