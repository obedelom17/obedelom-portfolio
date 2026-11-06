/**
 * Niveau de performance de l'appareil, lu une seule fois.
 * - "high"  : ordinateur ou téléphone récent, tous les effets
 * - "mid"   : effets complets, canevas en résolution réduite
 * - "low"   : appareil modeste ou économie de données, effets lourds désactivés
 * Le PerfGovernor peut ensuite abaisser le niveau en direct si la fluidité chute.
 */
export type Tier = "high" | "mid" | "low"

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

export function isLite() {
  return typeof document !== "undefined" && document.documentElement.classList.contains("perf-lite")
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
