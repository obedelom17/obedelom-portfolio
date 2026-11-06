"use client"

import { useRef, type ReactNode } from "react"

/** Carte qui s'incline en 3D vers le pointeur (souris) ou vers le doigt posé (tactile), avec un reflet qui suit. */
export function Tilt({ children, max = 7, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translate3d(0, -4px, 0)`
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`)
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`)
  }
  const release = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") leave()
  }
  const leave = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)"
  }

  return (
    <div
      ref={ref}
      onPointerDown={move}
      onPointerMove={move}
      onPointerUp={release}
      onPointerCancel={leave}
      onPointerLeave={leave}
      className={`tilt relative ${className}`}
      style={{ transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)", transformStyle: "preserve-3d" }}
    >
      {children}
      <div className="tilt-glare" aria-hidden />
    </div>
  )
}
