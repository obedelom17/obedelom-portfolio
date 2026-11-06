"use client"

import { useEffect, useRef } from "react"

/**
 * Transitions :
 * - lien vers une autre page : deux panneaux se referment, la page change, puis s'ouvrent à l'arrivée ;
 * - lien vers une section : un trait de lumière balaie le haut de l'écran.
 * Seuls transform et opacity sont animés.
 */
export function PageCurtain() {
  const host = useRef<HTMLDivElement>(null)
  const sweep = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = host.current
    const sw = sweep.current
    if (!el || !sw) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    try {
      if (sessionStorage.getItem("curtain") === "1") {
        sessionStorage.removeItem("curtain")
        if (!reduce) {
          el.dataset.s = "cover"
          requestAnimationFrame(() => requestAnimationFrame(() => (el.dataset.s = "open")))
          window.setTimeout(() => (el.dataset.s = ""), 900)
        }
      }
    } catch {}

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname) {
        if (url.hash && !reduce) {
          sw.classList.remove("is-on")
          void sw.offsetWidth
          sw.classList.add("is-on")
        }
        return
      }
      if (reduce) return
      e.preventDefault()
      e.stopPropagation()
      el.dataset.s = "close"
      try {
        sessionStorage.setItem("curtain", "1")
      } catch {}
      window.setTimeout(() => location.assign(url.href), 520)
    }
    document.addEventListener("click", onClick, true)
    return () => document.removeEventListener("click", onClick, true)
  }, [])

  return (
    <>
      <div ref={host} className="curtain-fx" aria-hidden>
        <i />
        <i />
      </div>
      <span ref={sweep} className="sweep-fx" aria-hidden />
    </>
  )
}
