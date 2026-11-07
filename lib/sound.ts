/**
 * Moteur sonore du portfolio, 100 % synthétisé avec Web Audio (aucun fichier audio à charger) :
 *  - des effets (survol, clic, section, thème, langue, ouverture, succès, jeux…) ;
 *  - une musique d'ambiance générative, douce, qui démarre au premier geste du visiteur.
 *
 * Les navigateurs interdisent tout son avant un geste de l'utilisateur : `unlockAudio()` est donc
 * appelé au premier appui / toucher / touche. Les préférences (effets, musique) sont mémorisées ;
 * par défaut les deux sont actifs, et deux boutons les coupent séparément (en-tête du site).
 */

export type Kind =
  | "hover"
  | "click"
  | "tap"
  | "section"
  | "toggle"
  | "theme"
  | "lang"
  | "open"
  | "close"
  | "next"
  | "pop"
  | "toast"
  | "success"
  | "error"
  | "reveal"
  | "key"
  | "bounce"
  | "whoosh"
  | "fanfare"
  | "ready"

type AudioState = { sfx: boolean; music: boolean; unlocked: boolean }

const SERVER: AudioState = { sfx: true, music: true, unlocked: false }
let state: AudioState = SERVER
let prefsRead = false
const listeners = new Set<() => void>()

function emit(next: Partial<AudioState>) {
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function subscribeAudio(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
export function getAudio(): AudioState {
  return state
}
export function getServerAudio(): AudioState {
  return SERVER
}

function readPrefs() {
  if (prefsRead || typeof localStorage === "undefined") return
  prefsRead = true
  try {
    const legacy = localStorage.getItem("sound")
    const sfx = localStorage.getItem("sfx") ?? (legacy === "off" ? "off" : "on")
    const music = localStorage.getItem("music") ?? (legacy === "off" ? "off" : "on")
    emit({ sfx: sfx !== "off", music: music !== "off" })
  } catch {}
}

/** À appeler une fois au montage : lit les préférences mémorisées. */
export function initAudio() {
  readPrefs()
}

/* ------------------------------------------------------------------ */
/* Graphe audio                                                         */
/* ------------------------------------------------------------------ */

type AC = AudioContext
let ctx: AC | null = null
let master: GainNode
let sfxBus: GainNode
let musicBus: GainNode
let musicIn: GainNode
let analyser: AnalyserNode | null = null
let noiseBuf: AudioBuffer
let voices = 0
const MAX_VOICES = 14

function build(): AC | null {
  if (ctx) return ctx
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  const c = new Ctor({ latencyHint: "interactive" })
  ctx = c

  const comp = c.createDynamicsCompressor()
  // Limiteur : volume maximal sans saturation.
  comp.threshold.value = -8
  comp.knee.value = 4
  comp.ratio.value = 20
  comp.attack.value = 0.002
  comp.release.value = 0.12
  master = c.createGain()
  master.gain.value = 1
  master.connect(comp)
  comp.connect(c.destination)

  sfxBus = c.createGain()
  sfxBus.gain.value = state.sfx ? SFX_LEVEL : 0
  sfxBus.connect(master)

  // Musique : filtre doux + écho feutré (réverbération légère).
  musicBus = c.createGain()
  musicBus.gain.value = 0
  musicBus.connect(master)
  analyser = c.createAnalyser()
  analyser.fftSize = 64
  analyser.smoothingTimeConstant = 0.8
  musicBus.connect(analyser)
  musicIn = c.createGain()
  const lp = c.createBiquadFilter()
  lp.type = "lowpass"
  lp.frequency.value = 1700
  lp.Q.value = 0.2
  musicIn.connect(lp)
  lp.connect(musicBus)
  const wet = c.createGain()
  wet.gain.value = 0.42
  const d1 = c.createDelay(1)
  const d2 = c.createDelay(1)
  d1.delayTime.value = 0.37
  d2.delayTime.value = 0.53
  const fb = c.createGain()
  fb.gain.value = 0.4
  const damp = c.createBiquadFilter()
  damp.type = "lowpass"
  damp.frequency.value = 1500
  lp.connect(d1)
  d1.connect(d2)
  d2.connect(damp)
  damp.connect(fb)
  fb.connect(d1)
  damp.connect(wet)
  wet.connect(musicBus)

  noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return c
}

/** À appeler dans un gestionnaire de geste utilisateur (appui, toucher, touche). */
export function unlockAudio() {
  readPrefs()
  const c = build()
  if (!c) return
  if (c.state === "suspended") void c.resume()
  if (!state.unlocked) {
    emit({ unlocked: true })
    if (state.music) startMusic()
  }
}

/**
 * Tente de lancer la musique sans geste (accepté par certains navigateurs : site déjà fréquenté, installé en PWA…).
 * Renvoie vrai si le son tourne ; sinon l'audio reste en attente du premier geste.
 */
export function tryAutoplay(): Promise<boolean> {
  readPrefs()
  if (state.unlocked) return Promise.resolve(true)
  const c = build()
  if (!c) return Promise.resolve(false)
  return new Promise((resolve) => {
    void c.resume().catch(() => {})
    window.setTimeout(() => {
      if (c.state === "running") {
        unlockAudio()
        resolve(true)
      } else resolve(false)
    }, 280)
  })
}

/** Remplit `buf` (32 valeurs, 0-255) avec le spectre de la musique et renvoie le niveau moyen (0 à 1). */
export function readSpectrum(buf: Uint8Array<ArrayBuffer>): number {
  if (!analyser || !musicOn) return 0
  analyser.getByteFrequencyData(buf)
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i]
  return sum / (buf.length * 255)
}

/* ------------------------------------------------------------------ */
/* Briques d'effets                                                     */
/* ------------------------------------------------------------------ */

type ToneOpts = { type?: OscillatorType; vol?: number; to?: number; attack?: number; at?: number; bus?: AudioNode }

function tone(freq: number, dur: number, o: ToneOpts = {}) {
  const c = ctx
  if (!c || voices >= MAX_VOICES) return
  const t = c.currentTime + (o.at ?? 0)
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = o.type ?? "sine"
  osc.frequency.setValueAtTime(freq, t)
  if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(o.to, 20), t + dur)
  const v = o.vol ?? 0.05
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(v, t + (o.attack ?? 0.008))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g)
  g.connect(o.bus ?? sfxBus)
  osc.start(t)
  osc.stop(t + dur + 0.03)
  voices++
  osc.onended = () => {
    voices--
    osc.disconnect()
    g.disconnect()
  }
}

type NoiseOpts = { type?: BiquadFilterType; f0: number; f1?: number; q?: number; vol?: number; at?: number; attack?: number }

function noise(dur: number, o: NoiseOpts) {
  const c = ctx
  if (!c || voices >= MAX_VOICES) return
  const t = c.currentTime + (o.at ?? 0)
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  src.loop = true
  const f = c.createBiquadFilter()
  f.type = o.type ?? "bandpass"
  f.Q.value = o.q ?? 1.2
  f.frequency.setValueAtTime(o.f0, t)
  if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(o.f1, 20), t + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.vol ?? 0.04, t + (o.attack ?? Math.min(0.03, dur / 3)))
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f)
  f.connect(g)
  g.connect(sfxBus)
  src.start(t, Math.random() * 0.5)
  src.stop(t + dur + 0.03)
  voices++
  src.onended = () => {
    voices--
    src.disconnect()
    f.disconnect()
    g.disconnect()
  }
}

let lastHover = 0
let lastReveal = 0
let lastKey = 0
let lastBounce = 0

/** Joue un effet. `intensity` (0 à 1) règle la force des effets qui en dépendent (rebonds…). */
export function play(kind: Kind, intensity = 0.5) {
  if (!state.sfx || !state.unlocked) return
  const c = ctx
  if (!c) return
  if (c.state !== "running") {
    if (c.state === "suspended" && !document.hidden) void c.resume()
    return
  }
  const now = performance.now()

  switch (kind) {
    case "hover":
      if (now - lastHover < 70) return
      lastHover = now
      tone(1500, 0.05, { to: 1950, vol: 0.016 })
      break
    case "click":
      tone(540, 0.1, { to: 330, type: "triangle", vol: 0.05 })
      noise(0.03, { type: "highpass", f0: 3200, vol: 0.02 })
      break
    case "tap":
      tone(720, 0.07, { to: 480, type: "triangle", vol: 0.04 })
      break
    case "section":
      tone(300, 0.24, { to: 640, vol: 0.03 })
      tone(900, 0.3, { to: 1350, vol: 0.012, at: 0.05 })
      break
    case "toggle":
      tone(660, 0.16, { to: 990, type: "triangle", vol: 0.05 })
      break
    case "theme":
      noise(0.4, { f0: 380, f1: 3400, q: 0.9, vol: 0.045 })
      tone(523, 0.28, { to: 784, type: "triangle", vol: 0.035 })
      break
    case "lang":
      tone(880, 0.07, { type: "triangle", vol: 0.04 })
      tone(1175, 0.09, { type: "triangle", vol: 0.04, at: 0.07 })
      break
    case "open":
      noise(0.3, { f0: 300, f1: 2400, q: 0.8, vol: 0.05 })
      tone(392, 0.28, { to: 587, vol: 0.03 })
      break
    case "close":
      noise(0.26, { f0: 2400, f1: 300, q: 0.8, vol: 0.04 })
      tone(587, 0.24, { to: 330, vol: 0.025 })
      break
    case "next":
      noise(0.14, { f0: 900, f1: 2600, q: 1, vol: 0.03 })
      tone(640, 0.08, { to: 860, type: "triangle", vol: 0.03 })
      break
    case "pop":
      tone(700, 0.08, { to: 1100, vol: 0.05 })
      break
    case "toast":
    case "success":
      tone(523, 0.18, { vol: 0.05 })
      tone(659, 0.18, { vol: 0.05, at: 0.08 })
      tone(784, 0.32, { vol: 0.05, at: 0.16 })
      tone(1568, 0.4, { vol: 0.012, at: 0.16 })
      break
    case "error":
      tone(190, 0.26, { to: 120, type: "triangle", vol: 0.06 })
      tone(150, 0.3, { to: 95, type: "triangle", vol: 0.04, at: 0.09 })
      break
    case "reveal":
      if (now - lastReveal < 260) return
      lastReveal = now
      noise(0.42, { f0: 1900, f1: 800, q: 0.7, vol: 0.016, attack: 0.1 })
      tone(1245, 0.18, { vol: 0.008, attack: 0.04 })
      break
    case "key":
      if (now - lastKey < 28) return
      lastKey = now
      noise(0.022, { type: "highpass", f0: 2600 + Math.random() * 900, vol: 0.028 })
      break
    case "bounce": {
      if (now - lastBounce < 45) return
      lastBounce = now
      const v = Math.max(0, Math.min(1, intensity))
      tone(170 + v * 230, 0.13, { to: 80 + v * 40, vol: 0.012 + v * 0.07 })
      break
    }
    case "whoosh":
      noise(0.34, { f0: 500, f1: 3000, q: 0.7, vol: 0.05 })
      break
    case "fanfare":
      ;[523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.34, { type: "triangle", vol: 0.05, at: i * 0.08 }))
      noise(0.6, { type: "highpass", f0: 5000, vol: 0.015, at: 0.3 })
      break
    case "ready":
      ;[392, 523, 659].forEach((f) => tone(f, 0.9, { vol: 0.035, attack: 0.18 }))
      noise(0.7, { f0: 600, f1: 2800, q: 0.6, vol: 0.03, attack: 0.15 })
      break
  }
}

/* ------------------------------------------------------------------ */
/* Musique d'ambiance générative                                        */
/* ------------------------------------------------------------------ */

const CHORDS: number[][] = [
  [146.83, 220.0, 261.63, 329.63, 349.23], // Ré mineur 9
  [116.54, 174.61, 220.0, 293.66, 349.23], // Si♭ majeur 7
  [174.61, 220.0, 261.63, 329.63, 392.0], // Fa majeur 9
  [130.81, 196.0, 293.66, 329.63, 392.0], // Do add9
]
const BELLS = [587.33, 659.25, 783.99, 880.0, 1046.5]
const CHORD_LEN = 9
/** Niveaux maximum : les sons sont synthétisés très bas à la source, ces gains les montent au plus fort ; le limiteur final évite toute saturation. */
const MUSIC_LEVEL = 3.4
const SFX_LEVEL = 10

let musicOn = false
let chordTimer = 0
let bellTimer = 0
let chordIdx = 0

function voice(freq: number, t: number, len: number, vol: number) {
  const c = ctx
  if (!c) return
  for (const det of [-5, 5]) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = "sine"
    osc.frequency.value = freq
    osc.detune.value = det
    const a = 3.2
    const r = 4.2
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(vol, t + a)
    g.gain.setValueAtTime(vol, t + len - r * 0.4)
    g.gain.linearRampToValueAtTime(0.0001, t + len + r)
    osc.connect(g)
    g.connect(musicIn)
    osc.start(t)
    osc.stop(t + len + r + 0.1)
    osc.onended = () => {
      osc.disconnect()
      g.disconnect()
    }
  }
}

function nextChord() {
  const c = ctx
  if (!c || !musicOn) return
  // Contexte en veille (onglet masqué) : on ne programme rien, pour ne pas empiler d'accords.
  if (c.state === "running" && !document.hidden) {
    const t = c.currentTime + 0.05
    const chord = CHORDS[chordIdx % CHORDS.length]
    chord.forEach((f, i) => voice(f, t, CHORD_LEN, i === 0 ? 0.03 : 0.017))
    chordIdx++
  }
  chordTimer = window.setTimeout(nextChord, (CHORD_LEN - 0.8) * 1000)
}

function nextBell() {
  const c = ctx
  if (!c || !musicOn) return
  if (c.state === "running" && !document.hidden && Math.random() < 0.85) {
    const f = BELLS[Math.floor(Math.random() * BELLS.length)]
    const t = c.currentTime + 0.02
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = "sine"
    osc.frequency.value = f
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 3.2)
    osc.connect(g)
    g.connect(musicIn)
    osc.start(t)
    osc.stop(t + 3.3)
    osc.onended = () => {
      osc.disconnect()
      g.disconnect()
    }
  }
  bellTimer = window.setTimeout(nextBell, 2400 + Math.random() * 3600)
}

function startMusic() {
  const c = ctx
  if (!c || musicOn) return
  musicOn = true
  musicBus.gain.cancelScheduledValues(c.currentTime)
  musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime)
  musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, c.currentTime + 4)
  nextChord()
  bellTimer = window.setTimeout(nextBell, 3500)
}

function stopMusic() {
  const c = ctx
  musicOn = false
  window.clearTimeout(chordTimer)
  window.clearTimeout(bellTimer)
  if (!c) return
  musicBus.gain.cancelScheduledValues(c.currentTime)
  musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime)
  musicBus.gain.linearRampToValueAtTime(0, c.currentTime + 1.2)
}

export function setSfx(on: boolean) {
  readPrefs()
  emit({ sfx: on })
  try {
    localStorage.setItem("sfx", on ? "on" : "off")
  } catch {}
  if (ctx) sfxBus.gain.value = on ? SFX_LEVEL : 0
  if (on) {
    unlockAudio()
    play("toggle")
  }
}

export function setMusic(on: boolean) {
  readPrefs()
  emit({ music: on })
  try {
    localStorage.setItem("music", on ? "on" : "off")
  } catch {}
  if (on) {
    unlockAudio()
    startMusic()
  } else stopMusic()
}

export function toggleSfx() {
  setSfx(!state.sfx)
}
export function toggleMusic() {
  setMusic(!state.music)
}

/** Onglet masqué : la musique se tait et le contexte audio se met en veille ; il repart au retour. */
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const c = ctx
    if (!c || !state.unlocked) return
    if (document.hidden) {
      musicBus.gain.cancelScheduledValues(c.currentTime)
      musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime)
      musicBus.gain.linearRampToValueAtTime(0, c.currentTime + 0.4)
      window.setTimeout(() => {
        if (document.hidden && ctx) void ctx.suspend()
      }, 500)
    } else {
      void c.resume().then(() => {
        if (musicOn) {
          musicBus.gain.cancelScheduledValues(c.currentTime)
          musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime)
          musicBus.gain.linearRampToValueAtTime(MUSIC_LEVEL, c.currentTime + 2.5)
        }
      })
    }
  })
}

/* Compatibilité avec l'ancienne interface. */
export const soundEnabled = () => state.sfx
export const initSound = () => {
  readPrefs()
  return state.sfx
}
export const setSound = (on: boolean) => {
  setSfx(on)
  setMusic(on)
}
