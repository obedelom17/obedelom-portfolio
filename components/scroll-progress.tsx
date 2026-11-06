"use client"

import { useEffect, useRef } from "react"
import { frame, onScroll } from "@/lib/frame"

/** Fine barre de progression de lecture, en haut de l'écran. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let last = -1
    return onScroll({
      write: () => {
        const el = bar.current
        if (!el || frame.progress === last) return
        last = frame.progress
        el.style.transform = `scaleX(${frame.progress.toFixed(4)})`
      },
    })
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]" aria-hidden>
      <div ref={bar} className="bg-grad h-full origin-left" style={{ transform: "scaleX(0)" }} />
    </div>
  )
}
