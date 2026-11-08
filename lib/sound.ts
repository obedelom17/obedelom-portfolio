/**
 * Moteur sonore du portfolio, 100 % synthétisé avec Web Audio (aucun fichier audio à charger) :
 *  - des effets (survol, clic, section, thème, langue, ouverture, succès, jeux…) ;
 *  - une vraie pièce de piano douce et émouvante (composée dans le code, jouée en boucle), qui démarre au premier geste du visiteur.
 *    Option : déposer un fichier `public/music/background.mp3` pour le jouer à la place de la pièce synthétisée.
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
let noiseBuf: AudioBuffer
let voices = 0
const MAX_VOICES = 14

/** Réponse impulsionnelle d'une grande salle douce : bruit stéréo qui s'éteint, aigus amortis. */
function makeReverb(c: AC, secs: number) {
  const len = Math.floor(c.sampleRate * secs)
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < len; i++) {
      const x = i / len
      lp += (Math.random() * 2 - 1 - lp) * 0.3
      d[i] = lp * Math.pow(1 - x, 2.6) * (x < 0.01 ? x / 0.01 : 1)
    }
  }
  return buf
}

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

  // Musique : ton chaud et feutré + réverbération de salle (réponse impulsionnelle synthétisée).
  musicBus = c.createGain()
  musicBus.gain.value = 0
  musicBus.connect(master)
  musicIn = c.createGain()
  const soft = c.createBiquadFilter()
  soft.type = "lowpass"
  soft.frequency.value = 4200
  soft.Q.value = 0.3
  musicIn.connect(soft)
  soft.connect(musicBus)
  const room = c.createConvolver()
  room.buffer = makeReverb(c, 3.6)
  const wet = c.createGain()
  wet.gain.value = 0.55
  soft.connect(room)
  room.connect(wet)
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
/* Musique : « Lumière douce » — pièce de piano en boucle              */
/* ------------------------------------------------------------------ */

/** Pour jouer un vrai morceau (mp3) à la place de la pièce synthétisée : le déposer ici dans `public/`. */
const MUSIC_FILE = "/music/background.mp3"
/** Niveaux : le piano est synthétisé bas à la source ; le limiteur final évite toute saturation. */
const MUSIC_LEVEL = 1.15
const FILE_LEVEL = 0.4
const SFX_LEVEL = 10

const NOTE_IDX: Record<string, number> = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 }
function hz(name: string) {
  const m = /^([A-G]#?)(\d)$/.exec(name)
  if (!m) return 440
  const midi = (parseInt(m[2], 10) + 1) * 12 + NOTE_IDX[m[1]]
  return 440 * Math.pow(2, (midi - 69) / 12)
}

type Bar = { bass: string; arp: string[]; mel: [number, string, number][] }
/** Un temps = environ 57 battements par minute : lent, respirant. */
const BEAT = 1.05
/** Ordre de l'arpège (indices dans `arp`), une croche sur deux temps. */
const ARP = [0, 1, 2, 3, 2, 1, 3, 2]

// La mineur — Fa — Do — Sol, puis la montée émouvante vers Mi : la progression qui serre le cœur.
const AM7 = { bass: "A2", arp: ["E3", "A3", "C4", "E4"] }
const FMAJ7 = { bass: "F2", arp: ["C4", "A3", "C4", "E4"] }
const CMAJ7 = { bass: "C3", arp: ["G3", "B3", "E4", "G4"] }
const GADD9 = { bass: "G2", arp: ["B3", "D4", "G4", "A4"] }
const DM9 = { bass: "D3", arp: ["A3", "C4", "E4", "F4"] }
const E = { bass: "E2", arp: ["B3", "E4", "G#4", "B4"] }

const SONG: Bar[] = [
  // Couplet : la mélodie se pose, simple, presque murmurée.
  { ...AM7, mel: [[0, "E5", 2.6], [3, "D5", 1]] },
  { ...FMAJ7, mel: [[0, "C5", 2], [2, "A4", 1], [3, "C5", 1]] },
  { ...CMAJ7, mel: [[0, "E5", 3], [3, "G5", 1]] },
  { ...GADD9, mel: [[0, "D5", 2], [2, "B4", 1.8]] },
  { ...AM7, mel: [[0, "C5", 1.5], [1.5, "E5", 1.5], [3, "G5", 1]] },
  { ...FMAJ7, mel: [[0, "F5", 2], [2, "E5", 1], [3, "C5", 1]] },
  { ...DM9, mel: [[0, "D5", 2], [2, "F5", 1], [3, "E5", 1]] },
  { ...E, mel: [[0, "B4", 2], [2, "G#4", 2]] },
  // Refrain : la mélodie monte, s'ouvre, puis redescend pour mieux revenir.
  { ...AM7, mel: [[0, "A5", 3], [3, "G5", 1]] },
  { ...FMAJ7, mel: [[0, "A5", 1.5], [1.5, "G5", 1.5], [3, "F5", 1]] },
  { ...CMAJ7, mel: [[0, "G5", 2], [2, "E5", 2]] },
  { ...GADD9, mel: [[0, "B4", 1], [1, "D5", 1], [2, "G5", 2]] },
  { ...AM7, mel: [[0, "E5", 3], [3, "C5", 1]] },
  { ...FMAJ7, mel: [[0, "A4", 1], [1, "C5", 1], [2, "F5", 2]] },
  { ...DM9, mel: [[0, "F5", 2], [2, "E5", 1], [3, "D5", 1]] },
  { ...E, mel: [[0, "B4", 2], [2, "G#4", 1], [3, "B4", 1]] },
]

let musicOn = false
let ducked = false
let chordTimer = 0
let barIdx = 0
let nextBarAt = 0
let fileMode = false
let fileTrack: HTMLAudioElement | null = null
let fileProbe: Promise<boolean> | null = null

/** Une note de piano doux : fondamentale + harmoniques qui s'éteignent à des vitesses différentes. */
function pianoNote(freq: number, t: number, dur: number, vol: number, parts: number) {
  const c = ctx
  if (!c) return
  const amps = [1, 0.3, 0.09]
  for (let p = 0; p < parts; p++) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = "sine"
    osc.frequency.value = freq * (p + 1)
    osc.detune.value = (Math.random() - 0.5) * 5
    const d = dur / (1 + p * 0.8)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(vol * amps[p], t + 0.014)
    g.gain.exponentialRampToValueAtTime(0.0001, t + d)
    osc.connect(g)
    g.connect(musicIn)
    osc.start(t)
    osc.stop(t + d + 0.1)
    osc.onended = () => {
      osc.disconnect()
      g.disconnect()
    }
  }
}

/** Un coussin chaud (cordes très douces) sous le piano, qui se fond d'un accord au suivant. */
function pad(freq: number, t: number, len: number, vol: number) {
  const c = ctx
  if (!c) return
  const a = 1.7
  const r = 2.6
  for (const det of [-6, 6]) {
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = "triangle"
    osc.frequency.value = freq
    osc.detune.value = det
    g.gain.setValueAtTime(0.0001, t)
    g.gain.linearRampToValueAtTime(vol, t + a)
    g.gain.setValueAtTime(vol, t + len - 0.3)
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

function scheduleBar() {
  const bar = SONG[barIdx % SONG.length]
  barIdx++
  const t0 = nextBarAt
  const human = () => (Math.random() - 0.5) * 0.03
  const notes = bar.arp.map(hz)

  pianoNote(hz(bar.bass), t0, 5.6, 0.16, 2)
  ARP.forEach((k, i) => pianoNote(notes[k], t0 + (i * BEAT) / 2 + human(), 3.4, i % 4 === 0 ? 0.07 : 0.05, 2))
  bar.mel.forEach(([beat, n, len]) => pianoNote(hz(n), t0 + beat * BEAT + human(), 2.4 + len * BEAT * 1.3, 0.14, 3))
  pad(hz(bar.bass) * 2, t0, 4 * BEAT, 0.012)
  pad(notes[1], t0, 4 * BEAT, 0.009)

  nextBarAt += 4 * BEAT
}

/** Programme la musique quelques secondes à l'avance (jamais dans un onglet masqué). */
function pump() {
  const c = ctx
  if (!c || !musicOn || fileMode) return
  if (c.state === "running" && !document.hidden) {
    if (nextBarAt < c.currentTime + 0.1) nextBarAt = c.currentTime + 0.15
    while (nextBarAt < c.currentTime + 3) scheduleBar()
  }
  chordTimer = window.setTimeout(pump, 800)
}

function startGenerative() {
  window.clearTimeout(chordTimer)
  fileMode = false
  nextBarAt = 0
  pump()
}

function probeFile() {
  fileProbe ??= fetch(MUSIC_FILE, { method: "HEAD" })
    .then((r) => r.ok && (r.headers.get("content-type") || "").startsWith("audio"))
    .catch(() => false)
  return fileProbe
}

function playFile() {
  const c = ctx
  if (!c) return
  window.clearTimeout(chordTimer)
  fileMode = true
  if (!fileTrack) {
    const a = new Audio(MUSIC_FILE)
    a.loop = true
    a.preload = "auto"
    const src = c.createMediaElementSource(a)
    const g = c.createGain()
    g.gain.value = FILE_LEVEL
    src.connect(g)
    g.connect(musicBus)
    fileTrack = a
  }
  void fileTrack.play().catch(() => {})
}

function startMusic() {
  const c = ctx
  if (!c || musicOn) return
  musicOn = true
  musicBus.gain.cancelScheduledValues(c.currentTime)
  musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime)
  musicBus.gain.linearRampToValueAtTime(ducked ? 0 : MUSIC_LEVEL, c.currentTime + 5)
  void probeFile().then((ok) => {
    if (!musicOn || !ctx) return
    if (ok) playFile()
    else startGenerative()
  })
}

function stopMusic() {
  const c = ctx
  musicOn = false
  window.clearTimeout(chordTimer)
  if (fileTrack) {
    const a = fileTrack
    window.setTimeout(() => {
      if (!musicOn) a.pause()
    }, 1400)
  }
  if (!c) return
  musicBus.gain.cancelScheduledValues(c.currentTime)
  musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime)
  musicBus.gain.linearRampToValueAtTime(0, c.currentTime + 1.2)
}

/** Coupe en douceur la musique pendant qu'une vidéo a du son, et la rétablit ensuite. */
export function duckMusic(on: boolean) {
  if (ducked === on) return
  ducked = on
  const c = ctx
  if (!c || !musicOn) return
  musicBus.gain.cancelScheduledValues(c.currentTime)
  musicBus.gain.setValueAtTime(musicBus.gain.value, c.currentTime)
  musicBus.gain.linearRampToValueAtTime(on ? 0 : MUSIC_LEVEL, c.currentTime + (on ? 0.6 : 2))
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
          musicBus.gain.linearRampToValueAtTime(ducked ? 0 : MUSIC_LEVEL, c.currentTime + 2.5)
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
