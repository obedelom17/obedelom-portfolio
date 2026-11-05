"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/components/providers"

/** Deux lignes de très grand texte qui glissent en sens opposés au rythme du défilement. */
export function ScrollBand() {
  const { t } = useApp()
  const text = t.ui.band
  const root = useRef<HTMLDivElement>(null)
  const a = useRef<HTMLDivElement>(null)
  const b = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(Math.max((vh - r.top) / (vh + r.height), 0), 1)
      if (a.current) a.current.style.transform = `translate3d(${(-p * 30).toFixed(2)}%, 0, 0)`
      if (b.current) b.current.style.transform = `translate3d(${(-30 + p * 30).toFixed(2)}%, 0, 0)`
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  const row = (outline: boolean) =>
    Array.from({ length: 6 }, (_, i) => (
      <span key={i} className="flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16">
        <span className={outline ? "outline-text" : ""}>{text}</span>
        <span className="text-gradient-star text-[0.5em]">✦</span>
      </span>
    ))

  return (
    <div ref={root} className="overflow-hidden border-t border-line py-10 md:py-16" aria-hidden>
      <div ref={a} className="flex w-max font-serif text-[min(15vw,11rem)] leading-[1.02] will-change-transform">
        {row(false)}
      </div>
      <div ref={b} className="flex w-max font-serif text-[min(15vw,11rem)] leading-[1.02] will-change-transform" style={{ transform: "translate3d(-30%,0,0)" }}>
        {row(true)}
      </div>
    </div>
  )
}
