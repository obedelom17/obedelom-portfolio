"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: ReactNode
  className?: string
  delay?: number
  variant?: "up" | "left" | "right" | "scale" | "clip" | "blur" | "rotate" | "flip" | "zoom" | "skew"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    const root = document.documentElement
    const show = () => {
      setVisible(true)
      io.disconnect()
      window.removeEventListener("nav:end", onEnd)
    }
    // Pendant un trajet vers une section, rien n'est calculé ; à l'arrivée on rejoue ce qui est à l'écran.
    const onEnd = () => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) show()
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !root.classList.contains("is-navigating")) show()
      },
      { rootMargin: "0px 0px -8% 0px" },
    )
    io.observe(el)
    window.addEventListener("nav:end", onEnd)
    return () => {
      io.disconnect()
      window.removeEventListener("nav:end", onEnd)
    }
  }, [])

  return (
    <div
      ref={ref}
      data-v={variant}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
