"use client"

import { useEffect } from "react"
import { haptic, isLite } from "@/lib/perf"
import { createLoop, frame } from "@/lib/frame"

/**
 * Parité mobile des effets réservés à la souris :
 * - onde + étincelles au toucher (comme le clic sur ordinateur) ;
 * - lueur `.spot` qui suit le doigt ;
 * - retour haptique léger sur les boutons et liens (Android) ;
 * - parallaxe du hero pilotée par l'inclinaison du téléphone (gyroscope).
 * Aucune boucle permanente : les écouteurs sont passifs et la parallaxe ne tourne que hero visible.
 */
export function TouchFx() {
  useEffect(() => {
    const touch = window.matchMedia("(hover: none), (pointer: coarse)").matches
    if (!touch) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const root = document.documentElement

    const spotAt = (e: PointerEvent) => {
      const spot = (e.target as Element | null)?.closest?.(".spot") as HTMLElement | null
      if (!spot) return
      const r = spot.getBoundingClientRect()
      spot.style.setProperty("--mx", `${e.clientX - r.left}px`)
      spot.style.setProperty("--my", `${e.clientY - r.top}px`)
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return
      spotAt(e)
      const hit = (e.target as Element | null)?.closest?.("a, button, [role='button'], .spot")
      if (hit) haptic(7)
      if (reduce || isLite()) return
      const host = document.createElement("span")
      host.className = "click-fx"
      host.style.left = `${e.clientX}px`
      host.style.top = `${e.clientY}px`
      host.innerHTML =
        '<i class="click-fx__ring"></i>' +
        Array.from({ length: 6 }, (_, i) => `<i class="click-fx__spark" style="--a:${i * 60}deg"></i>`).join("")
      document.body.appendChild(host)
      window.setTimeout(() => host.remove(), 800)
    }
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !frame.scrolling) spotAt(e)
    }
    document.addEventListener("pointerdown", onDown, { passive: true })
    document.addEventListener("pointermove", onMove, { passive: true })

    // Gyroscope : parallaxe des couches du hero.
    let cleanupGyro = () => {}
    const hero = document.getElementById("top")
    if (hero && !reduce && typeof DeviceOrientationEvent !== "undefined") {
      const layers = Array.from(hero.querySelectorAll<HTMLElement>("[data-depth]"))
      let tx = 0
      let ty = 0
      let cx = 0
      let cy = 0
      let visible = true
      let listening = false

      // La boucle s'endort dès que la parallaxe a rattrapé l'inclinaison : aucun style écrit au repos.
      const loop = createLoop((_n, dt) => {
        if (!visible || frame.scrolling || isLite()) return false
        const k = 1 - Math.exp(-dt / 0.2)
        cx += (tx - cx) * k
        cy += (ty - cy) * k
        for (const l of layers) {
          const d = parseFloat(l.dataset.depth ?? "0") * 0.9
          l.style.transform = `translate3d(${(cx * d).toFixed(2)}px, ${(cy * d).toFixed(2)}px, 0)`
        }
        if (Math.abs(tx - cx) + Math.abs(ty - cy) < 0.002) return false
      })
      const onOri = (e: DeviceOrientationEvent) => {
        const g = Math.max(-25, Math.min(25, e.gamma ?? 0)) / 25
        const b = Math.max(-25, Math.min(25, (e.beta ?? 45) - 45)) / 25
        // Zone morte : les micro-mouvements de la main ne doivent pas réveiller la boucle.
        if (Math.abs(g - tx) + Math.abs(b - ty) < 0.02) return
        tx = g
        ty = b
        loop.wake()
      }
      const listen = () => {
        if (listening) return
        listening = true
        window.addEventListener("deviceorientation", onOri, { passive: true })
      }
      const io = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting
      })
      io.observe(hero)

      type Req = { requestPermission?: () => Promise<"granted" | "denied"> }
      const D = DeviceOrientationEvent as unknown as Req
      let askListener: (() => void) | null = null
      if (typeof D.requestPermission === "function") {
        // iOS : la permission doit suivre un geste de l'utilisateur.
        askListener = () => {
          D.requestPermission!()
            .then((s) => s === "granted" && listen())
            .catch(() => {})
        }
        window.addEventListener("touchend", askListener, { once: true, passive: true })
      } else {
        listen()
      }
      cleanupGyro = () => {
        loop.destroy()
        io.disconnect()
        window.removeEventListener("deviceorientation", onOri)
        if (askListener) window.removeEventListener("touchend", askListener)
      }
    }

    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("pointermove", onMove)
      cleanupGyro()
    }
  }, [])
  return null
}
