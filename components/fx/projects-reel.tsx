"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useApp } from "@/components/providers"
import { pick } from "@/lib/pick"
import type { Project } from "@/lib/types"

/**
 * Bande horizontale : la page reste épinglée et les projets défilent de droite à gauche
 * au rythme du défilement vertical. Seul `transform` est animé (compositeur, aucune mise en page).
 * Sur mobile ou avec mouvement réduit : simple rangée glissable avec accroche.
 */
export function ProjectsReel({ projects }: { projects: Project[] }) {
  const { t, lang } = useApp()
  const outer = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (hover: hover) and (prefers-reduced-motion: no-preference)")
    const sync = () => setPinned(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    const o = outer.current
    const tr = track.current
    if (!o || !tr || !pinned) return
    let dist = 0
    let top = 0
    let raf = 0

    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      dist = Math.max(0, tr.scrollWidth - vw)
      o.style.height = `${dist + vh}px`
      top = o.getBoundingClientRect().top + window.scrollY
      update()
    }
    const update = () => {
      raf = 0
      const p = dist > 0 ? Math.min(Math.max((window.scrollY - top) / dist, 0), 1) : 0
      tr.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(tr)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", measure)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", measure)
      o.style.height = ""
      tr.style.transform = ""
    }
  }, [pinned, projects.length])

  if (projects.length < 2) return null

  return (
    <div ref={outer} id="apercu" className={`reel ${pinned ? "reel--pin" : ""}`} aria-label={t.projects.reel}>
      <div className="reel__stage">
        <div className="reel__head mx-auto flex max-w-7xl items-end justify-between px-5 sm:px-8">
          <p className="label flex items-center gap-3">
            <span className="bg-grad h-px w-8" aria-hidden />
            {t.projects.reel}
          </p>
          <span className="reel__bar" aria-hidden>
            <span ref={bar} />
          </span>
        </div>
        <div ref={track} className="reel__track">
          {projects.map((p, i) => {
            const img = p.images?.[0]
            return (
              <a key={p.id} href={`#projet-${p.id}`} className="reel__card spot" data-cursor={t.ui.view}>
                <span className="reel__num font-mono">{String(i + 1).padStart(2, "0")}</span>
                <div className="reel__media">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" loading="lazy" draggable={false} />
                  ) : (
                    <span className="reel__ph font-serif">{p.title.slice(0, 2)}</span>
                  )}
                </div>
                <div className="reel__body">
                  <h3 className="font-serif text-2xl leading-tight md:text-3xl">{p.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{pick(lang, p.description_fr, p.description_en)}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="label">{t.status[p.status] ?? p.status}</span>
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
