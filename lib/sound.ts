/** Sons d'interface synthétisés (aucun fichier audio). Désactivés par défaut, préférence mémorisée. */
type Kind = "hover" | "click" | "section" | "toggle"

let ctx: AudioContext | null = null
let enabled = false
let lastHover = 0

export function soundEnabled() {
  return enabled
}

export function initSound() {
  try {
    enabled = localStorage.getItem("sound") === "on"
  } catch {}
  return enabled
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

export function setSound(on: boolean) {
  enabled = on
  try {
    localStorage.setItem("sound", on ? "on" : "off")
  } catch {}
  if (on) {
    audio()
    play("toggle")
  }
}

export function play(kind: Kind) {
  if (!enabled) return
  const c = audio()
  if (!c) return
  const now = c.currentTime
  if (kind === "hover") {
    const t = performance.now()
    if (t - lastHover < 70) return
    lastHover = t
  }
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)
  const cfg = {
    hover: { f: [1400, 1800], d: 0.045, v: 0.012, w: "sine" },
    click: { f: [520, 340], d: 0.09, v: 0.03, w: "triangle" },
    section: { f: [300, 620], d: 0.22, v: 0.02, w: "sine" },
    toggle: { f: [660, 990], d: 0.16, v: 0.03, w: "triangle" },
  }[kind] as { f: [number, number]; d: number; v: number; w: OscillatorType }
  o.type = cfg.w
  o.frequency.setValueAtTime(cfg.f[0], now)
  o.frequency.exponentialRampToValueAtTime(cfg.f[1], now + cfg.d)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(cfg.v, now + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, now + cfg.d)
  o.start(now)
  o.stop(now + cfg.d + 0.02)
}
