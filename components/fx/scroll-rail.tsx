"use client"

import { useEffect, useRef, useState } from "react"
import { useApp } from "@/components/providers"
import { frame, onScroll } from "@/lib/frame"

/** Navigation latérale (grands écrans) : un repère par section, la section active s'allonge, et un pourcentage de lecture. */
export function ScrollRail({ showInternships = false }: { showInternships?: boolean }) {
  const { t } = useApp()
  const [active, setActive] = useState("top")
  const [shown, setShown] = useState(false)
  const pct = useRef<HTMLSpanElement>(null)

  const items = [
    { id: "top", label: "Intro" },
    { id: "apropos", label: t.about.label },
    { id: "formation", label: t.nav.education },
    ...(showInternships ? [{ id: "stages", label: t.nav.internships }] : []),
    { id: "projets", label: t.nav.projects },
    { id: "competences", label: t.nav.skills },
    { id: "certifications", label: t.nav.certifications },
    { id: "contact", label: t.nav.contact },
  ]
  const key = items.map((i) => i.id).join(",")

  useEffect(() => {
    const els = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    els.forEach((el) => io.observe(el))
    let on = false
    let last = -1
    const stop = onScroll({
      write: () => {
        const p = Math.round(frame.progress * 100)
        if (pct.current && p !== last) {
          last = p
          pct.current.textContent = String(p).padStart(2, "0")
        }
        const next = frame.y > 240
        if (next !== on) {
          on = next
          setShown(next)
        }
      },
    })
    return () => {
      io.disconnect()
      stop()
    }
  }, [key])

  return (
    <nav className="scroll-rail" data-on={shown} aria-label={t.ui.rail}>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} data-active={active === it.id} aria-label={it.label} className="scroll-rail__item">
              <span className="scroll-rail__label">{it.label}</span>
              <span className="scroll-rail__tick" />
            </a>
          </li>
        ))}
      </ul>
      <p className="scroll-rail__pct">
        <span ref={pct}>00</span>%
      </p>
    </nav>
  )
}
