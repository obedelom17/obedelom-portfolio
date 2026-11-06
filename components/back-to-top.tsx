"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUp } from "lucide-react"
import { useApp } from "@/components/providers"

const R = 21
const C = 2 * Math.PI * R

/** Bouton « haut de page » avec anneau de progression, visible après un peu de défilement. */
export function BackToTop() {
  const { t } = useApp()
  const arc = useRef<SVGCircleElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0
      if (arc.current) arc.current.style.strokeDashoffset = String(C * (1 - p))
      setShow(window.scrollY > 700)
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

  return (
    <a
      href="#top"
      aria-label={t.ui.top}
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-[45] flex h-12 w-12 items-center justify-center rounded-full bg-bg shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-110 sm:right-8 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <circle cx="24" cy="24" r={R} fill="none" stroke="var(--line)" strokeWidth="2" />
        <circle
          ref={arc}
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C}
        />
      </svg>
      <ArrowUp className="relative h-4 w-4" />
    </a>
  )
}
