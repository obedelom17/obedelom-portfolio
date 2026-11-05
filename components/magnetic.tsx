"use client"

import { useRef, type ReactNode } from "react"

/** Le contenu est légèrement attiré par le pointeur quand il s'en approche. Souris uniquement. */
export function Magnetic({
  children,
  strength = 0.28,
  className = "",
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el || e.pointerType !== "mouse") return
    const r = el.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) * strength
    const dy = (e.clientY - (r.top + r.height / 2)) * strength
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
  }
  const leave = () => {
    if (ref.current) ref.current.style.transform = "translate3d(0, 0, 0)"
  }

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`inline-block ${className}`}
      style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {children}
    </div>
  )
}
