"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useApp } from "@/components/providers"
import { buildMedia } from "@/lib/media"
import type { Project } from "@/lib/types"
import { Roll } from "./roll"

function previewOf(p: Project): string | null {
  const media = buildMedia(p.images, p.videos)
  const img = media.find((m) => m.kind === "image")
  if (img) return img.src
  const vid = media.find((m) => m.kind === "video" && m.poster)
  return vid && vid.kind === "video" ? (vid.poster ?? null) : null
}

/**
 * Sommaire des projets : au survol, un aperçu suit le pointeur (avec inertie et inclinaison selon la vitesse).
 * Un clic mène à la réalisation correspondante.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const { t } = useApp()
  const [active, setActive] = useState(-1)
  const box = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const el = box.current
    const ul = list.current
    if (!el || !ul) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    let x = 0
    let y = 0
    let px = 0
    let py = 0
    let rot = 0
    let raf = 0
    let last = performance.now()
    let on = false

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const k = 1 - Math.exp(-dt / 0.09)
      px += (x - px) * k
      py += (y - py) * k
      const vx = (x - px) * 0.06
      rot += (Math.max(-14, Math.min(14, vx)) - rot) * 0.2
      el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) rotate(${rot.toFixed(2)}deg)`
      const moving = Math.abs(x - px) + Math.abs(y - py) + Math.abs(rot) > 0.3
      raf = moving || on ? requestAnimationFrame(loop) : 0
    }
    const onMove = (e: PointerEvent) => {
      x = e.clientX + 40
      y = e.clientY
      if (!on) {
        px = x
        py = y
        on = true
      }
      if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(loop)
      }
    }
    const onLeave = () => {
      on = false
      setActive(-1)
    }
    ul.addEventListener("pointermove", onMove, { passive: true })
    ul.addEventListener("pointerleave", onLeave)
    return () => {
      cancelAnimationFrame(raf)
      ul.removeEventListener("pointermove", onMove)
      ul.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  if (projects.length < 2) return null
  return (
    <div className="mb-16">
      <p className="label mb-4">{t.ui.all}</p>
      <ul ref={list} className="pidx focus-list">
        {projects.map((p, i) => (
          <li key={p.id}>
            <a
              href={`#projet-${p.id}`}
              className="pidx__row roll-host"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(-1)}
            >
              <span className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
              <span className="pidx__title font-serif text-2xl md:text-4xl">
                <Roll text={p.title} />
              </span>
              <span className="label hidden sm:block">{(p.stack ?? []).slice(0, 3).join(" · ")}</span>
              <ArrowUpRight className="pidx__arrow h-5 w-5" />
            </a>
          </li>
        ))}
      </ul>
      <div ref={box} className="pidx__preview" data-on={active >= 0} aria-hidden>
        {projects.map((p, i) => {
          const src = previewOf(p)
          return src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={src} alt="" decoding="async" data-active={i === active} />
          ) : null
        })}
      </div>
    </div>
  )
}
