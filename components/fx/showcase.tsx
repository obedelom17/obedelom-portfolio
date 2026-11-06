"use client"

import { useEffect, useRef } from "react"
import { useApp } from "@/components/providers"
import { toast } from "@/lib/toast"

const DWELL = 4200
const REEL_MS = 6500

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2)

/**
 * Mode vitrine : le site se parcourt seul, section par section, puis recommence.
 * Lancement : touche D ou bouton de l'île dynamique. Le moindre geste (molette, clavier, clic, souris) l'arrête.
 */
export function Showcase() {
  const { t } = useApp()
  const tRef = useRef(t)
  tRef.current = t

  useEffect(() => {
    const root = document.documentElement
    let running = false
    let timer = 0
    let raf = 0
    let step = 0
    let originX = 0
    let originY = 0
    let armed = false

    const announce = (on: boolean) => window.dispatchEvent(new CustomEvent("showcase:state", { detail: on }))
    const targets = () => Array.from(document.querySelectorAll<HTMLElement>("main > section[id], main .reel[id]"))

    const stop = (say = true) => {
      if (!running) return
      running = false
      armed = false
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
      root.classList.remove("showcase")
      removeStopListeners()
      announce(false)
      if (say) toast(tRef.current.ui.showcaseOff)
    }

    const go = (id: string) => {
      const a = document.createElement("a")
      a.href = `#${id}`
      document.body.appendChild(a)
      a.click()
      a.remove()
    }

    const runReel = (el: HTMLElement, done: () => void) => {
      const start = el.getBoundingClientRect().top + window.scrollY
      const end = start + Math.max(0, el.offsetHeight - window.innerHeight)
      const t0 = performance.now()
      const frame = (now: number) => {
        if (!running) return
        const p = Math.min((now - t0) / REEL_MS, 1)
        window.scrollTo(0, start + (end - start) * ease(p))
        if (p < 1) raf = requestAnimationFrame(frame)
        else timer = window.setTimeout(done, 600)
      }
      raf = requestAnimationFrame(frame)
    }

    const next = () => {
      if (!running) return
      const list = targets()
      if (!list.length) return stop(false)
      if (step >= list.length) step = 0
      const el = list[step++]
      go(el.id)
      if (el.classList.contains("reel")) {
        timer = window.setTimeout(() => runReel(el, next), 1400)
      } else {
        timer = window.setTimeout(next, DWELL)
      }
    }

    const onWheel = () => stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "d") return
      stop()
    }
    const onDown = () => stop()
    const onMove = (e: PointerEvent) => {
      if (!armed) {
        armed = true
        originX = e.clientX
        originY = e.clientY
        return
      }
      if (Math.hypot(e.clientX - originX, e.clientY - originY) > 40) stop()
    }
    const addStopListeners = () => {
      window.addEventListener("wheel", onWheel, { passive: true })
      window.addEventListener("touchstart", onDown, { passive: true })
      document.addEventListener("keydown", onKey)
      document.addEventListener("pointerdown", onDown)
      document.addEventListener("pointermove", onMove, { passive: true })
    }
    function removeStopListeners() {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onDown)
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointermove", onMove)
    }

    const start = () => {
      if (running) return
      running = true
      armed = false
      step = 1
      root.classList.add("showcase")
      announce(true)
      toast(tRef.current.ui.showcaseOn)
      // Petit délai : le geste qui a lancé le mode ne doit pas l'arrêter aussitôt.
      timer = window.setTimeout(() => {
        addStopListeners()
        go("top")
        timer = window.setTimeout(next, DWELL)
      }, 900)
    }

    const toggle = () => (running ? stop() : start())
    const onToggle = () => toggle()
    const onKeyStart = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.key.toLowerCase() !== "d") return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      toggle()
    }
    window.addEventListener("showcase:toggle", onToggle)
    document.addEventListener("keydown", onKeyStart)
    return () => {
      window.removeEventListener("showcase:toggle", onToggle)
      document.removeEventListener("keydown", onKeyStart)
      stop(false)
    }
  }, [])

  return null
}
