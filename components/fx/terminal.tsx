"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"
import { useApp } from "@/components/providers"

type Row = { kind: "cmd" | "out"; text: string }

/**
 * Faux terminal qui se tape tout seul quand il entre à l'écran : commandes lettre par lettre,
 * puis les réponses ligne par ligne. Le texte complet reste lisible par les lecteurs d'écran.
 */
export function Terminal({ projectCount }: { projectCount: number }) {
  const { t, lang } = useApp()
  const [rows, setRows] = useState<Row[]>([])
  const [typing, setTyping] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const run = useRef(0)
  const started = useRef(false)

  const fill = useCallback((s: string) => s.replace("{projects}", String(projectCount)), [projectCount])

  const play = useCallback(() => {
    const id = ++run.current
    const lines = t.terminal.lines
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const wait = (ms: number) => new Promise<void>((res) => window.setTimeout(res, ms))
    const alive = () => run.current === id

    if (reduce) {
      setRows(lines.flatMap((l) => [{ kind: "cmd" as const, text: l.cmd }, ...l.out.map((o) => ({ kind: "out" as const, text: fill(o) }))]))
      setTyping(false)
      return
    }

    setRows([])
    setTyping(true)
    ;(async () => {
      await wait(350)
      for (const l of lines) {
        if (!alive()) return
        setRows((r) => [...r, { kind: "cmd", text: "" }])
        for (let i = 1; i <= l.cmd.length; i++) {
          if (!alive()) return
          const part = l.cmd.slice(0, i)
          setRows((r) => [...r.slice(0, -1), { kind: "cmd", text: part }])
          await wait(24 + Math.random() * 38)
        }
        await wait(260)
        for (const o of l.out) {
          if (!alive()) return
          setRows((r) => [...r, { kind: "out", text: fill(o) }])
          await wait(150)
        }
        await wait(420)
      }
      if (alive()) setTyping(false)
    })()
  }, [t, fill])

  // Démarre une seule fois, à l'arrivée à l'écran.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true
          play()
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      run.current++
    }
  }, [play])

  // Changement de langue : on rejoue dans la nouvelle langue si le terminal a déjà démarré.
  const shown = useRef(lang)
  useEffect(() => {
    if (shown.current === lang) return
    shown.current = lang
    if (started.current) play()
  }, [lang, play])

  const all = t.terminal.lines.flatMap((l) => [l.cmd, ...l.out.map(fill)]).join(". ")

  return (
    <div ref={root} className="term glow-border glow-border--on">
      <div className="term__bar">
        <span className="term__dot" aria-hidden />
        <span className="term__dot" aria-hidden />
        <span className="term__dot" aria-hidden />
        <span className="label ml-3 normal-case tracking-normal">{t.terminal.title}</span>
        <button
          type="button"
          onClick={play}
          aria-label={t.terminal.replay}
          className="label ml-auto inline-flex items-center gap-2 px-1 py-1 transition-colors hover:text-fg"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.terminal.replay}</span>
        </button>
      </div>
      <p className="sr-only">{all}</p>
      <div className="term__body" aria-hidden>
        {rows.map((r, i) => (
          <p key={i} className={r.kind === "cmd" ? "term__cmd" : "term__out"}>
            {r.kind === "cmd" && <span className="term__prompt">$</span>}
            {r.text}
            {typing && i === rows.length - 1 && <span className="term__caret" />}
          </p>
        ))}
        {rows.length === 0 && (
          <p className="term__cmd">
            <span className="term__prompt">$</span>
            <span className="term__caret" />
          </p>
        )}
      </div>
    </div>
  )
}
