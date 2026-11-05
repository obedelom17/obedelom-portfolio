"use client"

import { useEffect, useState } from "react"

/** Liste de mots qui se relaient avec une animation de glissement. */
export function RotatingWords({ words }: { words: string[] }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (words.length < 2) return
    const id = window.setInterval(() => setI((v) => (v + 1) % words.length), 2600)
    return () => window.clearInterval(id)
  }, [words.length])

  return (
    <span className="rotator">
      <span key={i} className="rotator__word">
        {words[i % Math.max(words.length, 1)]}
      </span>
    </span>
  )
}
