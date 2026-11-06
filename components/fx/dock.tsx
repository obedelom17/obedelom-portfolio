"use client"

import { useEffect, useRef, useState } from "react"
import { Award, Briefcase, GraduationCap, House, Layers, Mail, Search, SunMoon, User, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useApp } from "@/components/providers"
import { currentTheme, setTheme } from "@/lib/theme"
import { haptic } from "@/lib/perf"
import { frame, onScroll } from "@/lib/frame"

type Item = { id: string; label: string; Icon: LucideIcon; mobile?: boolean }

/**
 * Dock flottant en bas de l'écran (ordinateur) : une icône par section, qui grossit quand le pointeur
 * s'approche (effet de loupe), la section active en accent, une infobulle au survol,
 * et deux raccourcis : recherche rapide et changement de thème.
 */
export function Dock({ showInternships = false }: { showInternships?: boolean }) {
  const { t } = useApp()
  const [active, setActive] = useState("top")
  const [shown, setShown] = useState(false)
  const bar = useRef<HTMLUListElement>(null)

  const items: Item[] = [
    { id: "top", label: "Intro", Icon: House, mobile: true },
    { id: "apropos", label: t.about.label, Icon: User },
    { id: "formation", label: t.nav.education, Icon: GraduationCap },
    ...(showInternships ? [{ id: "stages", label: t.nav.internships, Icon: Briefcase }] : []),
    { id: "projets", label: t.nav.projects, Icon: Layers, mobile: true },
    { id: "competences", label: t.nav.skills, Icon: Wrench, mobile: true },
    { id: "certifications", label: t.nav.certifications, Icon: Award },
    { id: "contact", label: t.nav.contact, Icon: Mail, mobile: true },
  ]
  const key = items.map((i) => i.id).join(",")

  // Section active + apparition après le hero.
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
    const stop = onScroll({
      write: () => {
        const next = frame.y > 520
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

  // Effet de loupe : chaque icône vise une taille selon sa distance au pointeur, puis s'y rend en douceur.
  useEffect(() => {
    const el = bar.current
    if (!el) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-dock]"))
    const cur = nodes.map(() => 1)
    const goal = nodes.map(() => 1)
    let raf = 0
    let last = 0
    let inside = false

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const k = 1 - Math.exp(-dt / 0.07)
      let moving = false
      nodes.forEach((n, i) => {
        cur[i] += (goal[i] - cur[i]) * k
        if (Math.abs(goal[i] - cur[i]) > 0.002) moving = true
        n.style.setProperty("--s", cur[i].toFixed(3))
      })
      raf = moving || inside ? requestAnimationFrame(loop) : 0
    }
    const ensure = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      inside = true
      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect()
        const d = Math.abs(e.clientX - (r.left + r.width / 2))
        goal[i] = 1 + 0.75 * Math.exp(-Math.pow(d / 62, 2))
      })
      ensure()
    }
    const onLeave = () => {
      inside = false
      goal.fill(1)
      ensure()
    }
    el.addEventListener("pointermove", onMove, { passive: true })
    el.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
    }
  }, [key])

  return (
    <nav className="dock" data-on={shown} aria-label={t.ui.rail}>
      <ul ref={bar} className="dock__bar">
        {items.map(({ id, label, Icon, mobile }) => (
          <li key={id} data-m={mobile ? "1" : "0"}>
            <a
              href={`#${id}`}
              data-dock
              data-active={active === id}
              aria-label={label}
              aria-current={active === id ? "true" : undefined}
              tabIndex={shown ? 0 : -1}
              className="dock__item"
              onClick={() => haptic(8)}
            >
              <Icon strokeWidth={1.75} />
              <span className="dock__tip">{label}</span>
            </a>
          </li>
        ))}
        <li className="dock__sep" aria-hidden />
        <li>
          <button
            type="button"
            data-dock
            aria-label={t.cmd.open}
            tabIndex={shown ? 0 : -1}
            className="dock__item"
            onClick={() => {
              haptic(8)
              window.dispatchEvent(new Event("open-palette"))
            }}
          >
            <Search strokeWidth={1.75} />
            <span className="dock__tip">{t.cmd.open}</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            data-dock
            aria-label={t.cmd.theme}
            tabIndex={shown ? 0 : -1}
            className="dock__item"
            onClick={(e) => {
              haptic(8)
              setTheme(currentTheme() === "dark" ? "light" : "dark", { x: e.clientX, y: e.clientY })
            }}
          >
            <SunMoon strokeWidth={1.75} />
            <span className="dock__tip">{t.cmd.theme}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
