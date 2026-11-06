"use client"

import { useEffect, useRef } from "react"
import { ArrowUpRight } from "lucide-react"
import { onScrollIdle } from "@/lib/frame"

const INTERACTIVE = "a, button, [role='button'], input, textarea, select, label, summary"

/**
 * Curseur personnalisé, sur souris uniquement. Le curseur du système est masqué : seul reste
 * - un rond plein, inversé par rapport au fond (toujours visible), qui suit le pointeur avec du retard,
 *   s'étire dans le sens du mouvement, grossit sur les liens et rétrécit au clic ;
 * - une bulle « Voir ↗ » au-dessus des éléments portant `data-cursor="Texte"` ;
 * - une lueur douce qui accompagne le pointeur sur toute la page.
 * Les positions sont recalculées à chaque image, avec un amortissement indépendant de la fréquence de l'écran.
 */
export function CursorBubble() {
  const bubble = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const spot = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    const b = bubble.current
    const r = ring.current
    const s = spot.current
    const text = label.current
    if (!b || !r || !s || !text) return

    const html = document.documentElement
    html.classList.add("cursor-hidden")

    let x = -300
    let y = -300
    let bx = x
    let by = y
    let rx = x
    let ry = y
    let sx = x
    let sy = y
    let showBubble = false
    let overLink = false
    let pressed = false
    let seen = false
    let raf = 0
    let last = 0

    const state = () => (!seen || showBubble ? "hidden" : pressed ? "down" : overLink ? "link" : "idle")

    const render = (stretch = 0, angle = 0) => {
      b.style.transform = `translate3d(${bx}px, ${by}px, 0)`
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) rotate(${angle}rad) scale(${1 + stretch}, ${1 - stretch * 0.45})`
      s.style.transform = `translate3d(${sx}px, ${sy}px, 0)`
      r.dataset.s = state()
      s.dataset.on = seen ? "true" : "false"
    }

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const kb = 1 - Math.exp(-dt / 0.06)
      const kr = 1 - Math.exp(-dt / 0.075)
      const ks = 1 - Math.exp(-dt / 0.22)
      bx += (x - bx) * kb
      by += (y - by) * kb
      rx += (x - rx) * kr
      ry += (y - ry) * kr
      sx += (x - sx) * ks
      sy += (y - sy) * ks
      const dx = x - rx
      const dy = y - ry
      const dist = Math.hypot(dx, dy)
      render(Math.min(dist / 110, 0.55), Math.atan2(dy, dx))
      const moving = dist + Math.abs(x - bx) + Math.abs(y - by) + Math.abs(x - sx) + Math.abs(y - sy) > 0.4
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
        // Premier mouvement : tout apparaît directement sous le pointeur.
        seen = true
        rx = sx = e.clientX
        ry = sy = e.clientY
      }
      x = e.clientX
      y = e.clientY
      probe(e.target as Element | null)
      ensure()
    }

    // Le contenu défile sous un pointeur immobile : on revérifie ce qui est dessous UNE fois, à l'arrêt du
    // défilement (elementFromPoint force un calcul de mise en page : jamais pendant le mouvement).
    const stopIdle = onScrollIdle(() => {
      if (seen) probe(document.elementFromPoint(x, y))
    })

    const onLeave = () => {
      seen = false
      showBubble = false
      overLink = false
      pressed = false
      b.dataset.active = "false"
      render()
    }
    const onDown = () => {
      pressed = true
      render()
    }
    const onUp = () => {
      pressed = false
      render()
      // Un clic peut ouvrir la visionneuse par-dessus l'élément : on revérifie ce qui est sous le pointeur.
      window.setTimeout(() => {
        if (seen) probe(document.elementFromPoint(x, y))
      }, 60)
    }

    document.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("pointerup", onUp)
    html.addEventListener("mouseleave", onLeave)
    window.addEventListener("blur", onLeave)

    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove("cursor-hidden")
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointerup", onUp)
      html.removeEventListener("mouseleave", onLeave)
      stopIdle()
      window.removeEventListener("blur", onLeave)
    }
  }, [])

  return (
    <>
      <div ref={spot} className="cursor-spot" data-on="false" aria-hidden />
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
