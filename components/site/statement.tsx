"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/components/providers"
import { createLoop } from "@/lib/frame"
import { perfLevel } from "@/lib/perf"

/**
 * Manifeste en lettres géantes. Le texte est en contour ; une lampe (souris ou doigt) le remplit de couleur
 * là où elle passe. Sans pointeur (téléphone au repos), la lampe se promène seule d'un mot à l'autre,
 * donc l'effet se voit partout. Boucle active uniquement quand la section est à l'écran.
 */
export function Statement() {
  const { t } = useApp()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    let w = 1
    let h = 1
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let hold = 0 // fin du contrôle manuel
    const measure = () => {
      w = el.clientWidth
      h = el.clientHeight
      if (!x && !y) x = tx = w * 0.3
      if (!y) y = ty = h * 0.4
    }
    measure()

    const loop = createLoop((now, dt) => {
      if (perfLevel() >= 2) return false
      if (now > hold) {
        const s = now / 1000
        tx = w * (0.5 + 0.42 * Math.sin(s * 0.55))
        ty = h * (0.5 + 0.34 * Math.sin(s * 0.83 + 1.2))
      }
      const k = 1 - Math.exp(-dt * (now > hold ? 3 : 10))
      x += (tx - x) * k
      y += (ty - y) * k
      el.style.setProperty("--sx", `${x.toFixed(1)}px`)
      el.style.setProperty("--sy", `${y.toFixed(1)}px`)
    })

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? loop.wake() : loop.sleep()), { rootMargin: "80px" })
    io.observe(el)
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      hold = performance.now() + 1800
    }
    el.addEventListener("pointermove", move, { passive: true })
    el.addEventListener("pointerdown", move, { passive: true })
    window.addEventListener("resize", measure, { passive: true })
    return () => {
      io.disconnect()
      loop.destroy()
      el.removeEventListener("pointermove", move)
      el.removeEventListener("pointerdown", move)
      window.removeEventListener("resize", measure)
    }
  }, [])

  const lines = t.statement.lines
  return (
    <section ref={root} className="statement relative overflow-hidden border-t border-line" aria-label={t.statement.kicker}>
      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-40">
        <p className="label mb-8 flex items-center gap-3">
          <span className="bg-grad h-px w-8" aria-hidden />
          {t.statement.kicker}
        </p>
        <div className="statement__stack font-serif">
          <div className="statement__text statement__text--base" aria-hidden>
            {lines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </div>
          <h2 className="statement__text statement__text--lit">
            {lines.map((l) => (
              <span key={l} className="block">{l}</span>
            ))}
          </h2>
        </div>
        <p className="label mt-10 opacity-70">{t.statement.hint}</p>
      </div>
    </section>
  )
}
