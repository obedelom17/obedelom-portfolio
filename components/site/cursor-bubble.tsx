"use client"

import { useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"

/**
 * Bulle qui suit la souris au-dessus des éléments portant `data-cursor="Texte"`.
 * Le texte de la bulle est celui de l'attribut. La position est calculée à chaque image
 * (requestAnimationFrame), avec un amortissement indépendant de la fréquence de l'écran.
 * Absente sur écran tactile.
 */
export function CursorBubble() {
  const wrap = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const el = wrap.current
    const text = label.current
    if (!el || !text) return

    let x = -300
    let y = -300
    let cx = x
    let cy = y
    let active = false
    let raf = 0
    let last = 0
    let checking = false

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const k = 1 - Math.exp(-dt / 0.07)
      cx += (x - cx) * k
      cy += (y - cy) * k
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
      if (active || Math.abs(x - cx) + Math.abs(y - cy) > 0.3) raf = requestAnimationFrame(loop)
      else raf = 0
    }
    const ensure = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }

    const setActive = (value: string | null) => {
      if (value === null) {
        if (active) {
          active = false
          el.dataset.active = "false"
        }
        return
      }
      if (text.textContent !== value) text.textContent = value
      if (!active) {
        // À l'apparition, la bulle naît sous le pointeur au lieu de traverser l'écran.
        cx = x
        cy = y
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`
        active = true
        el.dataset.active = "true"
      }
      ensure()
    }

    const probe = (from: Element | null) => {
      const host = from?.closest?.("[data-cursor]") as HTMLElement | null
      setActive(host ? host.dataset.cursor ?? "" : null)
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return
      x = e.clientX
      y = e.clientY
      probe(e.target as Element | null)
      if (active) ensure()
    }

    // Le défilement fluide déplace le contenu sous un pointeur immobile : on revérifie.
    const onScroll = () => {
      if (checking) return
      checking = true
      requestAnimationFrame(() => {
        checking = false
        if (x < 0 && y < 0) return
        probe(document.elementFromPoint(x, y))
      })
    }

    const onLeave = () => setActive(null)

    // Un clic peut ouvrir la visionneuse par-dessus l'élément : on revérifie ce qui est sous le pointeur.
    const onClick = () => {
      window.setTimeout(() => {
        if (x < 0 && y < 0) return
        probe(document.elementFromPoint(x, y))
      }, 60)
    }

    document.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    document.documentElement.addEventListener("mouseleave", onLeave)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("blur", onLeave)
    document.addEventListener("click", onClick)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
      document.documentElement.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("blur", onLeave)
      document.removeEventListener("click", onClick)
    }
  }, [])

  return (
    <div ref={wrap} className="cursor-bubble" data-active="false" aria-hidden>
      <div className="cursor-bubble__inner">
        <span ref={label} />
        <ArrowUpRight className="h-[1.1em] w-[1.1em]" strokeWidth={2.25} />
      </div>
    </div>
  )
}
