"use client"

import { useEffect } from "react"
import { getAudio, initAudio, play, subscribeAudio, tryAutoplay, unlockAudio } from "@/lib/sound"

const INTERACTIVE = "a, button, [role='button'], summary, label, input[type='checkbox'], input[type='radio'], select"

/**
 * Chef d'orchestre du son. Un seul composant, un seul écouteur par type d'événement :
 *  - débloque l'audio au premier geste (obligatoire sur tous les navigateurs) et lance la musique ;
 *  - survol (souris), clic / toucher sur les boutons et liens ;
 *  - changement de section, de thème et de langue ;
 *  - apparition des visuels (événement `fx:reveal`).
 * Les éléments portant `data-nosound` sont ignorés (ils jouent leur propre son).
 */
export function AudioDirector() {
  useEffect(() => {
    initAudio()
    void tryAutoplay()
    const root = document.documentElement

    // 1. Premier geste : déblocage.
    const gestures = ["pointerdown", "touchend", "keydown", "click"] as const
    const unlock = () => unlockAudio()
    gestures.forEach((g) => window.addEventListener(g, unlock, { capture: true, passive: true }))
    const stopUnlock = () => gestures.forEach((g) => window.removeEventListener(g, unlock, { capture: true }))
    let announced = false
    const unsub = subscribeAudio(() => {
      const a = getAudio()
      if (a.unlocked) {
        stopUnlock()
        if (!announced) {
          announced = true
          window.setTimeout(() => play("ready"), 80)
        }
      }
    })

    // 2. Survol et clic.
    const target = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null
      return el && !el.closest("[data-nosound]") ? el : null
    }
    let lastOver: Element | null = null
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return
      const el = target(e)
      if (!el || el === lastOver) return
      lastOver = el
      play("hover")
    }
    const onOut = () => {
      lastOver = null
    }
    const onDown = (e: PointerEvent) => {
      if (!target(e)) return
      play(e.pointerType === "mouse" ? "click" : "tap")
    }
    document.addEventListener("pointerover", onOver, { passive: true })
    document.addEventListener("pointerout", onOut, { passive: true })
    document.addEventListener("pointerdown", onDown, { passive: true })

    // 3. Section, thème, langue.
    let sec = root.dataset.sec
    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.attributeName === "data-sec") {
          if (root.dataset.sec !== sec) {
            sec = root.dataset.sec
            play("section")
          }
        } else if (m.attributeName === "data-theme") play("theme")
        else if (m.attributeName === "lang") play("lang")
      }
    })
    mo.observe(root, { attributes: true, attributeFilter: ["data-sec", "data-theme", "lang"] })

    // 4. Apparition des visuels.
    const onReveal = () => play("reveal")
    window.addEventListener("fx:reveal", onReveal)

    return () => {
      stopUnlock()
      unsub()
      mo.disconnect()
      document.removeEventListener("pointerover", onOver)
      document.removeEventListener("pointerout", onOut)
      document.removeEventListener("pointerdown", onDown)
      window.removeEventListener("fx:reveal", onReveal)
    }
  }, [])

  return null
}
