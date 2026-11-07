"use client"

import { useEffect } from "react"
import { useApp } from "@/components/providers"
import { confetti } from "@/lib/confetti"
import { toast } from "@/lib/toast"
import { play } from "@/lib/sound"
import { haptic } from "@/lib/perf"

/**
 * Secouer le téléphone déclenche une pluie de confettis (+ son et vibration).
 * Sur iOS, l'accès aux capteurs se demande au premier toucher, une seule fois.
 */
export function ShakeFx() {
  const { t } = useApp()

  useEffect(() => {
    if (!window.matchMedia("(hover: none), (pointer: coarse)").matches) return
    if (typeof DeviceMotionEvent === "undefined") return
    let hits = 0
    let first = 0
    let cooldown = 0
    let listening = false

    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a) return
      const g = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0)
      const now = performance.now()
      if (g < 26 || now < cooldown) return
      if (now - first > 800) {
        first = now
        hits = 0
      }
      hits++
      if (hits >= 3) {
        hits = 0
        cooldown = now + 4000
        toast(t.ui.shake)
        play("fanfare")
        haptic(40)
        const w = window.innerWidth
        const h = window.innerHeight
        ;[0.25, 0.5, 0.75].forEach((x, i) => window.setTimeout(() => confetti(w * x, h * 0.8), i * 160))
      }
    }
    const listen = () => {
      if (listening) return
      listening = true
      window.addEventListener("devicemotion", onMotion, { passive: true })
    }

    type Ask = { requestPermission?: () => Promise<"granted" | "denied"> }
    const DM = DeviceMotionEvent as unknown as Ask
    const ask = DM.requestPermission
    const onFirstTouch = () => {
      DM.requestPermission!().then((r) => r === "granted" && listen()).catch(() => {})
    }
    if (typeof ask === "function") window.addEventListener("pointerup", onFirstTouch, { once: true, passive: true })
    else listen()

    return () => {
      window.removeEventListener("pointerup", onFirstTouch)
      window.removeEventListener("devicemotion", onMotion)
    }
  }, [t.ui.shake])

  return null
}
