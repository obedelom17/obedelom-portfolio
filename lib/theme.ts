export type Theme = "light" | "dark"

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light"
}

/**
 * Change le thème. Sur les navigateurs qui le permettent, le nouveau thème s'étend en cercle
 * depuis le point cliqué (View Transitions) ; sinon, simple fondu des couleurs.
 */
export function setTheme(next: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement
  const apply = () => {
    root.dataset.theme = next
    try {
      localStorage.setItem("theme", next)
    } catch {}
  }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<unknown> } }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (!doc.startViewTransition || reduce) {
    root.classList.add("theme-anim")
    apply()
    window.setTimeout(() => root.classList.remove("theme-anim"), 500)
    return
  }

  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? window.innerHeight / 2
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const transition = doc.startViewTransition(apply)
  transition.ready
    .then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 800, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" } as KeyframeAnimationOptions,
      )
    })
    .catch(() => {})
}
