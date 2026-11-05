"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const GLYPHS = "!<>-_\\/[]{}=+*^?#%&01"

/** Effet « décodage » : les lettres sont remplacées par des symboles puis se fixent une à une. */
export function useScramble(text: string) {
  const [out, setOut] = useState(text)
  const raf = useRef(0)

  useEffect(() => {
    setOut(text)
    return () => cancelAnimationFrame(raf.current)
  }, [text])

  const run = useCallback(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const duration = 380 + text.length * 28
    let lastDraw = 0
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      if (now - lastDraw > 40 || p >= 1) {
        lastDraw = now
        const fixed = Math.floor(p * text.length)
        let s = ""
        for (let i = 0; i < text.length; i++) {
          const c = text[i]
          s += i < fixed || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        }
        setOut(p >= 1 ? text : s)
      }
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }, [text])

  return [out, run] as const
}

/** Texte qui se décode au survol, ou automatiquement après `delay` ms avec `auto`. */
export function Scramble({ text, auto = false, delay = 0, className = "" }: { text: string; auto?: boolean; delay?: number; className?: string }) {
  const [out, run] = useScramble(text)

  useEffect(() => {
    if (!auto) return
    const id = window.setTimeout(run, delay)
    return () => window.clearTimeout(id)
  }, [auto, delay, run])

  return (
    <span className={className} onMouseEnter={run} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  )
}
