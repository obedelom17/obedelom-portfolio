/**
 * Moteur d'images partagé par tout le site.
 *
 * Pourquoi : avant, chaque effet avait sa propre boucle requestAnimationFrame et son propre écouteur
 * de défilement. Chacun lisait la géométrie (getBoundingClientRect) puis écrivait un style, ce qui
 * obligeait le navigateur à recalculer la mise en page plusieurs fois par image (« layout thrashing »).
 *
 * Maintenant :
 *  - `createLoop`   : une seule boucle rAF pour toutes les animations continues. Une boucle qui n'a plus
 *                     rien à animer s'endort (zéro coût) et se réveille avec `wake()`.
 *  - `onScroll`     : un seul écouteur de défilement ; à chaque image, TOUTES les lectures passent d'abord,
 *                     puis TOUTES les écritures. Une seule mise en page par image, quel que soit le nombre d'effets.
 *                     Les effets rattachés à un élément ne sont calculés que lorsqu'il est proche de l'écran.
 */

export const frame = {
  /** Position de défilement, mise à jour une fois par image. */
  y: 0,
  vh: 0,
  vw: 0,
  /** Hauteur défilable totale et progression de lecture (0 à 1), mesurées une seule fois par image. */
  max: 0,
  progress: 0,
  /** Vitesse de défilement lissée, en px/s (signée). */
  velocity: 0,
  /** Vrai pendant le défilement et 120 ms après. N'écrit rien dans le DOM. */
  scrolling: false,
}

/* ------------------------------------------------------------------ */
/* Boucle partagée                                                      */
/* ------------------------------------------------------------------ */

type Step = (now: number, dt: number) => boolean | void

type LoopEntry = {
  step: Step
  last: number
  minGap: number
  awake: boolean
}

const loops = new Set<LoopEntry>()
let rafId = 0

function runLoops(now: number) {
  rafId = 0
  let any = false
  for (const l of loops) {
    if (!l.awake) continue
    if (l.minGap && now - l.last < l.minGap) {
      any = true
      continue
    }
    const dt = l.last ? Math.min((now - l.last) / 1000, 0.05) : 0.016
    l.last = now
    if (l.step(now, dt) === false) l.awake = false
    else any = true
  }
  if (any && !document.hidden) rafId = requestAnimationFrame(runLoops)
}

export type Loop = { wake: () => void; sleep: () => void; destroy: () => void }

/**
 * Crée une animation continue. `step` renvoie `false` quand il n'y a plus rien à animer :
 * la boucle s'endort jusqu'au prochain `wake()`. `fps` limite la cadence (ex. 30 pour les fonds lents).
 */
export function createLoop(step: Step, opts: { fps?: number } = {}): Loop {
  const entry: LoopEntry = { step, last: 0, minGap: opts.fps ? 1000 / opts.fps - 2 : 0, awake: false }
  loops.add(entry)
  return {
    wake() {
      if (entry.awake) return
      entry.awake = true
      entry.last = 0
      if (!rafId && !document.hidden) rafId = requestAnimationFrame(runLoops)
    },
    sleep() {
      entry.awake = false
    },
    destroy() {
      entry.awake = false
      loops.delete(entry)
    },
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !rafId) {
      for (const l of loops) l.last = 0
      rafId = requestAnimationFrame(runLoops)
    }
  })
}

/* ------------------------------------------------------------------ */
/* Défilement                                                           */
/* ------------------------------------------------------------------ */

export type ScrollTask = {
  /** Si fourni, la tâche n'est exécutée que lorsque cet élément est proche de l'écran. */
  el?: Element | null
  /** Phase de lecture : mesures uniquement (getBoundingClientRect, scrollHeight…). */
  read?: () => void
  /** Phase d'écriture : styles uniquement. */
  write?: () => void
}

type Internal = ScrollTask & { near: boolean }

const tasks = new Set<Internal>()
const idleCbs = new Set<() => void>()
let attached = false
let scheduled = 0
let lastY = 0
let lastT = 0
let idleTimer = 0
let io: IntersectionObserver | null = null
const ioMap = new Map<Element, Internal[]>()

function flush(now: number) {
  scheduled = 0
  const y = window.scrollY
  const dt = lastT ? Math.max((now - lastT) / 1000, 0.004) : 0.016
  const inst = (y - lastY) / dt
  frame.velocity += (inst - frame.velocity) * Math.min(1, dt / 0.12)
  if (Math.abs(frame.velocity) < 0.5) frame.velocity = 0
  lastY = y
  lastT = now
  frame.y = y
  frame.vh = window.innerHeight
  frame.vw = window.innerWidth
  frame.max = Math.max(0, document.documentElement.scrollHeight - frame.vh)
  frame.progress = frame.max > 0 ? Math.min(Math.max(y / frame.max, 0), 1) : 0

  const live: Internal[] = []
  for (const t of tasks) if (t.near) live.push(t)
  for (const t of live) t.read?.()
  for (const t of live) t.write?.()

  // Tant que la vitesse n'est pas retombée, on continue à produire des images (pour l'amortissement).
  if (frame.velocity !== 0) schedule()
}

function schedule() {
  if (!scheduled) scheduled = requestAnimationFrame(flush)
}

function onScrollEvent() {
  frame.scrolling = true
  schedule()
  window.clearTimeout(idleTimer)
  idleTimer = window.setTimeout(() => {
    frame.scrolling = false
    frame.velocity = 0
    schedule()
    idleCbs.forEach((cb) => cb())
  }, 120)
}

function onResize() {
  frame.vh = window.innerHeight
  frame.vw = window.innerWidth
  schedule()
}

function attach() {
  if (attached) return
  attached = true
  frame.y = lastY = window.scrollY
  frame.vh = window.innerHeight
  frame.vw = window.innerWidth
  window.addEventListener("scroll", onScrollEvent, { passive: true })
  window.addEventListener("resize", onResize, { passive: true })
}

function detach() {
  if (!attached || tasks.size || idleCbs.size) return
  attached = false
  window.removeEventListener("scroll", onScrollEvent)
  window.removeEventListener("resize", onResize)
  window.cancelAnimationFrame(scheduled)
  scheduled = 0
}

function watch(task: Internal) {
  if (!task.el) return
  if (typeof IntersectionObserver === "undefined") return
  if (!io) {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const list = ioMap.get(e.target)
          if (!list) continue
          for (const t of list) t.near = e.isIntersecting
        }
        schedule()
      },
      { rootMargin: "240px 0px 240px 0px" },
    )
  }
  task.near = false
  const list = ioMap.get(task.el) ?? []
  list.push(task)
  ioMap.set(task.el, list)
  if (list.length === 1) io.observe(task.el)
}

function unwatch(task: Internal) {
  if (!task.el || !io) return
  const list = ioMap.get(task.el)
  if (!list) return
  const next = list.filter((t) => t !== task)
  if (next.length) ioMap.set(task.el, next)
  else {
    ioMap.delete(task.el)
    io.unobserve(task.el)
  }
}

/** Branche une tâche sur le défilement. Renvoie la fonction de nettoyage. Exécute une première fois à l'ajout. */
export function onScroll(task: ScrollTask): () => void {
  const t: Internal = { ...task, near: true }
  tasks.add(t)
  attach()
  watch(t)
  schedule()
  return () => {
    tasks.delete(t)
    unwatch(t)
    detach()
  }
}

/** Appelle `cb` une fois, peu après l'arrêt du défilement. */
export function onScrollIdle(cb: () => void): () => void {
  idleCbs.add(cb)
  attach()
  return () => {
    idleCbs.delete(cb)
    detach()
  }
}

/** Force une passe de lecture/écriture (après un changement de mise en page, par exemple). */
export function requestScrollFrame() {
  schedule()
}
