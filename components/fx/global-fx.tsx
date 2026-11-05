"use client"

import { useEffect } from "react"
import { useApp } from "@/components/providers"
import { confetti } from "@/lib/confetti"
import { toast } from "@/lib/toast"

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"]

/**
 * Effets transversaux, un seul écouteur par type d'événement :
 * - lueur qui suit la souris sur tout élément `.spot` ;
 * - onde + étincelles à chaque clic ;
 * - code Konami : pluie de confettis.
 */
export function GlobalFx() {
  const { t } = useApp()

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const spot = (e.target as Element | null)?.closest?.(".spot") as HTMLElement | null
      if (!spot) return
      const r = spot.getBoundingClientRect()
      spot.style.setProperty("--mx", `${e.clientX - r.left}px`)
      spot.style.setProperty("--my", `${e.clientY - r.top}px`)
    }

    const onDown = (e: PointerEvent) => {
      if (reduce || e.pointerType !== "mouse" || e.button !== 0) return
      const host = document.createElement("span")
      host.className = "click-fx"
      host.style.left = `${e.clientX}px`
      host.style.top = `${e.clientY}px`
      host.innerHTML =
        '<i class="click-fx__ring"></i>' +
        Array.from({ length: 8 }, (_, i) => `<i class="click-fx__spark" style="--a:${i * 45}deg"></i>`).join("")
      document.body.appendChild(host)
      window.setTimeout(() => host.remove(), 800)
    }

    let idx = 0
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      idx = k === KONAMI[idx] ? idx + 1 : k === KONAMI[0] ? 1 : 0
      if (idx === KONAMI.length) {
        idx = 0
        toast(t.ui.konami)
        const w = window.innerWidth
        const h = window.innerHeight
        ;[0.15, 0.35, 0.5, 0.65, 0.85].forEach((x, i) => window.setTimeout(() => confetti(w * x, h * 0.85), i * 220))
      }
    }

    if (fine) {
      document.addEventListener("pointermove", onMove, { passive: true })
      document.addEventListener("pointerdown", onDown, { passive: true })
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [t.ui.konami])

  return null
}
