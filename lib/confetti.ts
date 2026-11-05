/** Gerbe de confettis qui retombe, dessinée sur un canevas temporaire. */
export function confetti(originX: number, originY: number) {
  if (typeof window === "undefined") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const canvas = document.createElement("canvas")
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = window.innerWidth
  const h = window.innerHeight
  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:130;pointer-events:none"
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.scale(dpr, dpr)
  document.body.appendChild(canvas)

  const css = getComputedStyle(document.documentElement)
  const colors = [
    css.getPropertyValue("--accent").trim() || "#059669",
    css.getPropertyValue("--accent-2").trim() || "#0891b2",
    "#fbbf24",
    "#f472b6",
    "#ffffff",
  ]

  const pieces = Array.from({ length: 110 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5
    const speed = 7 + Math.random() * 11
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      round: Math.random() < 0.3,
    }
  })

  const t0 = performance.now()
  let last = t0
  const frame = (now: number) => {
    const dt = Math.min((now - last) / 16.67, 3)
    last = now
    ctx.clearRect(0, 0, w, h)
    const age = (now - t0) / 1000
    for (const p of pieces) {
      p.vy += 0.34 * dt
      p.vx *= Math.pow(0.985, dt)
      p.vy *= Math.pow(0.99, dt)
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vr * dt
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, 3.4 - age))
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      }
      ctx.restore()
    }
    if (age < 3.4) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
