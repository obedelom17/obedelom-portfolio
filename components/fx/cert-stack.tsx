"use client"

import { useCallback, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useApp } from "@/components/providers"
import { pick } from "@/lib/pick"
import type { Certification } from "@/lib/types"

/**
 * Paquet de cartes : la carte du dessus se glisse (souris, doigt) ou s'envoie avec les flèches,
 * puis passe à l'arrière. Pendant le glisser, seul le transform de la carte est écrit (aucun rendu React).
 */
export function CertStack({ items, onOpen }: { items: Certification[]; onOpen: (id: string) => void }) {
  const { t, lang } = useApp()
  const [order, setOrder] = useState(() => items.map((_, i) => i))
  const [fresh, setFresh] = useState<number | null>(null)
  const refs = useRef<Record<number, HTMLDivElement | null>>({})
  const busy = useRef(false)
  const drag = useRef<{ x: number; y: number; id: number; moved: boolean; t: number } | null>(null)

  const top = order[0]

  const fly = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return
      const el = refs.current[order[0]]
      if (!el) return
      busy.current = true
      el.style.transition = "transform 0.45s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.45s ease"
      el.style.transform = `translate3d(${dir * 140}%, 6%, 0) rotate(${dir * 18}deg)`
      el.style.opacity = "0"
      window.setTimeout(() => {
        el.style.transition = "none"
        el.style.transform = ""
        el.style.opacity = ""
        setOrder((o) => [...o.slice(1), o[0]])
        busy.current = false
      }, 460)
    },
    [order],
  )

  const back = useCallback(() => {
    if (busy.current) return
    const last = order[order.length - 1]
    setFresh(last)
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)])
    window.setTimeout(() => setFresh(null), 600)
  }, [order])

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy.current || e.button > 0) return
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false, t: performance.now() }
    e.currentTarget.setPointerCapture(e.pointerId)
    e.currentTarget.style.transition = "none"
  }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) d.moved = true
    e.currentTarget.style.transform = `translate3d(${dx}px, ${dy * 0.25}px, 0) rotate(${dx * 0.04}deg)`
  }
  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    const el = e.currentTarget
    const dx = e.clientX - d.x
    const speed = Math.abs(dx) / Math.max(performance.now() - d.t, 1)
    if (!d.moved) {
      el.style.transform = ""
      onOpen(items[top].id)
      return
    }
    if (Math.abs(dx) > 110 || speed > 0.7) {
      fly(dx > 0 ? 1 : -1)
    } else {
      el.style.transition = "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      el.style.transform = ""
    }
  }

  const current = items[top]
  const title = pick(lang, current.title_fr, current.title_en)

  return (
    <div className="stack" role="group" aria-roledescription="carousel" aria-label={t.certifications.label}>
      <div
        className="stack__deck"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") fly(-1)
          else if (e.key === "ArrowLeft") back()
          else if (e.key === "Enter") onOpen(items[top].id)
        }}
      >
        {order.slice(0, 4).map((idx, depth) => {
          const c = items[idx]
          const name = pick(lang, c.title_fr, c.title_en)
          return (
            <div
              key={c.id}
              ref={(n) => {
                refs.current[idx] = n
              }}
              className={`stack__card ${fresh === idx ? "is-fresh" : ""}`}
              style={{ ["--d" as string]: depth, ["--s" as string]: idx % 2 ? 1 : -1 } as React.CSSProperties}
              data-cursor={depth === 0 ? t.ui.view : undefined}
              onPointerDown={depth === 0 ? onDown : undefined}
              onPointerMove={depth === 0 ? onMove : undefined}
              onPointerUp={depth === 0 ? onUp : undefined}
              onPointerCancel={depth === 0 ? onUp : undefined}
              aria-hidden={depth !== 0}
            >
              {c.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.image_url} alt={depth === 0 ? name : ""} draggable={false} loading="lazy" />
              ) : (
                <span className="stack__year font-serif">{c.year}</span>
              )}
            </div>
          )
        })}
      </div>
      <div className="stack__bar">
        <div className="min-w-0">
          <p className="truncate text-sm">{title}</p>
          <p className="label mt-1">
            {current.year} · {items.indexOf(current) + 1} / {items.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={back} aria-label={t.certifications.prev} className="stack__btn">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => fly(-1)} aria-label={t.certifications.next} className="stack__btn">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="label mt-4 text-center">{t.certifications.hint}</p>
    </div>
  )
}
