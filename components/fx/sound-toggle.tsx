"use client"

import { useSyncExternalStore } from "react"
import { getAudio, getServerAudio, setMusic, setSfx, subscribeAudio } from "@/lib/sound"
import { useApp } from "@/components/providers"

/** État sonore partagé (effets, musique, déblocage). */
export function useAudio() {
  return useSyncExternalStore(subscribeAudio, getAudio, getServerAudio)
}

/** Coupe ou rétablit d'un coup les effets et la musique. */
export function toggleAllSound() {
  const a = getAudio()
  const on = !(a.sfx || a.music)
  setSfx(on)
  setMusic(on)
}

/**
 * Bouton son de l'en-tête : barres d'égaliseur animées quand la musique joue, barrées quand tout est coupé.
 * Les barres n'animent que `transform` (compositeur), et s'arrêtent en mode économie.
 */
export function SoundToggle({ className = "" }: { className?: string }) {
  const { t } = useApp()
  const a = useAudio()
  const on = a.sfx || a.music
  const playing = a.music && a.unlocked

  return (
    <button
      type="button"
      onClick={toggleAllSound}
      aria-label={on ? t.ui.soundOff : t.ui.soundOn}
      aria-pressed={on}
      data-nosound
      className={`sound-toggle relative inline-flex h-9 w-9 items-center justify-center text-muted transition-colors hover:text-fg ${className}`}
    >
      <span className="eq" data-on={playing} data-off={!on} aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      {!on && <span className="sound-toggle__slash" aria-hidden />}
    </button>
  )
}
