"use client"

import { useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, summary"

/**
 * Curseur personnalisé, sur souris uniquement :
 * - un anneau qui suit le pointeur avec un léger retard et grossit sur les liens et boutons ;
 * - une bulle « Voir ↗ » au-dessus des éléments portant `data-cursor="Texte"`.
 * Les positions sont recalculées à chaque image, avec un amortissement indépendant de la fréquence de l'écran.
 */
export function CursorBubble() {
  const bubble = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const b = bubble.current
    const r = ring.current
    const text = label.current
    if (!b || !r || !text) return

    let x = -300
    let y = -300
    let bx = x
    let by = y
    let rx = x
    let ry = y
    let showBubble = false
    let overLink = false
    let seen = false
    let raf = 0
    let last = 0
    let checking = false

    const render = () => {
      b.style.transform = `translate3d(${bx}px, ${by}px, 0)`
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      r.dataset.s = !seen || showBubble ? "hidden" : overLink ? "link" : "idle"
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const kb = 1 - Math.exp(-dt / 0.06)
      const kr = 1 - Math.exp(-dt / 0.11)
      bx += (x - bx) * kb
      by += (y - by) * kb
      rx += (x - rx) * kr
      ry += (y - ry) * kr
      render()
      const moving = Math.abs(x - bx) + Math.abs(y - by) + Math.abs(x - rx) + Math.abs(y - ry) > 0.3
      raf = moving ? requestAnimationFrame(loop) : 0
    }
    const ensure = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }

    const probe = (from: Element | null) => {
      const host = from?.closest?.("[data-cursor]") as HTMLElement | null
      overLink = !!from?.closest?.(INTERACTIVE)
      if (host) {
        const value = host.dataset.cursor ?? ""
        if (text.textContent !== value) text.textContent = value
        if (!showBubble) {
          // À l'apparition, la bulle naît sous le pointeur au lieu de traverser l'écran.
          bx = x
          by = y
          showBubble = true
          b.dataset.active = "true"
        }
      } else if (showBubble) {
        showBubble = false
        b.dataset.active = "false"
      }
      render()
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return
      if (!seen) {
        // Premier mouvement : l'anneau apparaît directement sous le pointeur.
        seen = true
        rx = e.clientX
        ry = e.clientY
      }
      x = e.clientX
      y = e.clientY
      probe(e.target as Element | null)
      ensure()
    }

    // Le défilement fluide déplace le contenu sous un pointeur immobile : on revérifie.
    const onScroll = () => {
      if (checking || !seen) return
      checking = true
      requestAnimationFrame(() => {
        checking = false
        probe(document.elementFromPoint(x, y))
      })
    }

    const onLeave = () => {
      seen = false
      showBubble = false
      overLink = false
      b.dataset.active = "false"
      render()
    }

    // Un clic peut ouvrir la visionneuse par-dessus l'élément : on revérifie ce qui est sous le pointeur.
    const onClick = () => {
      window.setTimeout(() => {
        if (seen) probe(document.elementFromPoint(x, y))
      }, 60)
    }

    document.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("mouseleave", onLeave)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("blur", onLeave)
    document.addEventListener("click", onClick)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("mouseleave", onLeave)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("blur", onLeave)
      document.removeEventListener("click", onClick)
    }
  }, [])

  return (
    <>
      <div ref={ring} className="cursor-ring" data-s="hidden" aria-hidden>
        <div className="cursor-ring__in" />
      </div>
      <div ref={bubble} className="cursor-bubble" data-active="false" aria-hidden>
        <div className="cursor-bubble__inner">
          <span ref={label} />
          <ArrowUpRight className="h-[1.1em] w-[1.1em]" strokeWidth={2.25} />
        </div>
      </div>
    </>
  )
}
