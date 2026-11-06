/**
 * Niveau de performance de l'appareil.
 *
 * `deviceTier()` : estimation au démarrage (cœurs, mémoire, économie de données).
 * `perfLevel()`  : niveau d'effets réellement appliqué, ajusté en direct par le PerfGovernor.
 *   0 = tous les effets
 *   1 = « lite » : fond WebGL, halos, traînée, grain et particules coupés ; reste fluide et beau
 *   2 = « min »  : en plus, flou, défilement lissé par script, grilles interactives et 3D coupés
 * Les niveaux sont des classes sur <html> (`perf-lite`, `perf-min`) pour que le CSS puisse réagir sans script.
 */
export type Tier = "high" | "mid" | "low"
export type Level = 0 | 1 | 2

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }

let cached: Tier | null = null

export function deviceTier(): Tier {
  if (cached) return cached
  if (typeof navigator === "undefined") return "high"
  const n = navigator as Nav
  const cores = n.hardwareConcurrency ?? 8
  const mem = n.deviceMemory ?? 8
  const save = n.connection?.saveData === true
  if (save || cores <= 2 || mem <= 2) cached = "low"
  else if (cores <= 4 || mem <= 4) cached = "mid"
  else cached = "high"
  return cached
}

export function perfLevel(): Level {
  if (typeof document === "undefined") return 0
  const c = document.documentElement.classList
  return c.contains("perf-min") ? 2 : c.contains("perf-lite") ? 1 : 0
}

export function isLite() {
  return perfLevel() >= 1
}

export function isMin() {
  return perfLevel() >= 2
}

const KEY = "perf-level"
const TTL = 3 * 24 * 3600 * 1000

export function setPerfLevel(level: Level, persist = true) {
  const root = document.documentElement
  if (perfLevel() === level) return
  root.classList.toggle("perf-lite", level >= 1)
  root.classList.toggle("perf-min", level >= 2)
  if (persist) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ l: level, t: Date.now() }))
    } catch {}
  }
  window.dispatchEvent(new Event("perf:change"))
}

/** Niveau mémorisé lors d'une visite récente (évite de re-dégrader à chaque ouverture). */
export function storedLevel(): Level | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as { l: Level; t: number }
    if (Date.now() - v.t > TTL) return null
    return v.l === 1 || v.l === 2 ? v.l : 0
  } catch {
    return null
  }
}

/** Appelle `cb` à chaque changement de niveau. Renvoie la fonction de nettoyage. */
export function onPerfChange(cb: (level: Level) => void) {
  const h = () => cb(perfLevel())
  window.addEventListener("perf:change", h)
  return () => window.removeEventListener("perf:change", h)
}

export function isTouch() {
  return typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches
}

/** Vibration courte (Android). Sans effet ailleurs. */
export function haptic(ms = 8) {
  try {
    if ("vibrate" in navigator && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) navigator.vibrate(ms)
  } catch {}
}
