"use client"

import { useEffect, useRef } from "react"

const VERT = `
attribute vec3 aPos;attribute vec3 aNor;attribute vec2 aUv;
uniform mat3 uRot;uniform float uAsp;
varying vec3 vN;varying vec2 vUv;varying vec3 vP;
void main(){
  vec3 p=uRot*aPos;vN=uRot*aNor;vUv=aUv;vP=p;
  gl_Position=vec4(p.x*0.42/uAsp,p.y*0.42,p.z*0.2,1.);
}`

const FRAG = `
precision mediump float;
uniform vec3 uA;uniform vec3 uB;uniform float uT;uniform float uDark;
varying vec3 vN;varying vec2 vUv;varying vec3 vP;
void main(){
  vec3 n=normalize(vN);
  float fr=pow(1.-abs(n.z),2.4);
  vec3 L=normalize(vec3(-.5,.7,.8));
  float df=.5+.5*dot(n,L);
  vec3 irid=.5+.5*cos(6.2831*(fr*1.1+vUv.x*2.+vec3(0.,.33,.67)+uT*.04));
  float rib=.88+.12*step(.5,fract(vUv.x*80.));
  vec3 base=mix(uA*.28,uA,df);
  vec3 col=base*rib+irid*fr*.7+uB*pow(max(dot(reflect(-L,n),vec3(0,0,1)),0.),28.)*.9;
  col=mix(col,col*.92+.04,uDark);
  gl_FragColor=vec4(col,1.);
}`

function hex(c: string): [number, number, number] {
  const s = c.trim().replace("#", "")
  const f = s.length === 3 ? s.split("").map((x) => x + x).join("") : s.padEnd(6, "0")
  return [parseInt(f.slice(0, 2), 16) / 255, parseInt(f.slice(2, 4), 16) / 255, parseInt(f.slice(4, 6), 16) / 255]
}

function knot() {
  const P = 2, Q = 3, SEG = 240, RAD = 18, TUBE = 0.34
  const pos = (u: number): [number, number, number] => {
    const qu = (Q / P) * u
    const r = 0.5 * (2 + Math.cos(qu))
    return [r * Math.cos(u), r * Math.sin(u), 0.5 * Math.sin(qu)]
  }
  const v: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= SEG; i++) {
    const u = (i / SEG) * Math.PI * 2 * P
    const p1 = pos(u)
    const p2 = pos(u + 0.01)
    const T = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]]
    let N = [p2[0] + p1[0], p2[1] + p1[1], p2[2] + p1[2]]
    let B = [T[1] * N[2] - T[2] * N[1], T[2] * N[0] - T[0] * N[2], T[0] * N[1] - T[1] * N[0]]
    N = [B[1] * T[2] - B[2] * T[1], B[2] * T[0] - B[0] * T[2], B[0] * T[1] - B[1] * T[0]]
    const ln = Math.hypot(N[0], N[1], N[2]) || 1
    const lb = Math.hypot(B[0], B[1], B[2]) || 1
    N = N.map((x) => x / ln)
    B = B.map((x) => x / lb)
    for (let j = 0; j <= RAD; j++) {
      const a = (j / RAD) * Math.PI * 2
      const c = Math.cos(a), s = Math.sin(a)
      const nx = c * N[0] + s * B[0], ny = c * N[1] + s * B[1], nz = c * N[2] + s * B[2]
      v.push(p1[0] + TUBE * nx, p1[1] + TUBE * ny, p1[2] + TUBE * nz, nx, ny, nz, i / SEG, j / RAD)
    }
  }
  for (let i = 0; i < SEG; i++) {
    for (let j = 0; j < RAD; j++) {
      const a = i * (RAD + 1) + j, b = (i + 1) * (RAD + 1) + j
      idx.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }
  return { v: new Float32Array(v), i: new Uint16Array(idx) }
}

/** Nœud de tore en WebGL pur : irisation sur les bords, nervures, rotation liée au pointeur et au défilement. */
export function Hero3D() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (!window.matchMedia("(min-width: 1024px)").matches) return
    const gl = cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "low-power" })
    if (!gl) return

    const mk = (t: number, src: string) => {
      const s = gl.createShader(t)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const g = knot()
    const vb = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, vb)
    gl.bufferData(gl.ARRAY_BUFFER, g.v, gl.STATIC_DRAW)
    const ib = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.i, gl.STATIC_DRAW)
    const stride = 8 * 4
    const attr = (n: string, size: number, off: number) => {
      const l = gl.getAttribLocation(prog, n)
      gl.enableVertexAttribArray(l)
      gl.vertexAttribPointer(l, size, gl.FLOAT, false, stride, off)
    }
    attr("aPos", 3, 0)
    attr("aNor", 3, 12)
    attr("aUv", 2, 24)
    gl.enable(gl.DEPTH_TEST)

    const U = (n: string) => gl.getUniformLocation(prog, n)
    const uRot = U("uRot"), uAsp = U("uAsp"), uA = U("uA"), uB = U("uB"), uT = U("uT"), uDark = U("uDark")

    const colors = () => {
      const cs = getComputedStyle(document.documentElement)
      gl.uniform3f(uA, ...hex(cs.getPropertyValue("--accent") || "#059669"))
      gl.uniform3f(uB, ...hex(cs.getPropertyValue("--accent-2") || "#10b981"))
      gl.uniform1f(uDark, document.documentElement.dataset.theme === "dark" ? 1 : 0)
    }
    colors()
    const mo = new MutationObserver(colors)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const r = cv.getBoundingClientRect()
      cv.width = Math.max(2, Math.floor(r.width * dpr))
      cv.height = Math.max(2, Math.floor(r.height * dpr))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform1f(uAsp, cv.width / cv.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)

    let tx = 0, ty = 0, cx = 0, cy = 0
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    document.addEventListener("pointermove", onMove, { passive: true })

    const rotation = (ax: number, ay: number, az: number) => {
      const cxr = Math.cos(ax), sxr = Math.sin(ax), cyr = Math.cos(ay), syr = Math.sin(ay), czr = Math.cos(az), szr = Math.sin(az)
      // Rz * Rx * Ry, en colonnes (WebGL)
      const rx = [1, 0, 0, 0, cxr, sxr, 0, -sxr, cxr]
      const ryM = [cyr, 0, -syr, 0, 1, 0, syr, 0, cyr]
      const rz = [czr, szr, 0, -szr, czr, 0, 0, 0, 1]
      const mul = (a: number[], b: number[]) => {
        const o = new Array<number>(9).fill(0)
        for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) o[c * 3 + r] += a[k * 3 + r] * b[c * 3 + k]
        return o
      }
      return new Float32Array(mul(rz, mul(rx, ryM)))
    }

    let visible = true
    let raf = 0
    const t0 = performance.now()
    let last = t0
    const frame = (now: number) => {
      raf = 0
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!document.documentElement.classList.contains("is-scrolling")) {
        const k = 1 - Math.exp(-dt / 0.2)
        cx += (tx - cx) * k
        cy += (ty - cy) * k
        const t = (now - t0) / 1000
        gl.uniform1f(uT, t)
        gl.uniformMatrix3fv(uRot, false, rotation(0.5 + cy * 0.35, t * 0.28 + cx * 0.6, window.scrollY * 0.0018))
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.drawElements(gl.TRIANGLES, g.i.length, gl.UNSIGNED_SHORT, 0)
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const kick = () => !raf && (raf = requestAnimationFrame(frame))
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) {
        last = performance.now()
        kick()
      }
    })
    io.observe(cv)
    const onVis = () => !document.hidden && kick()
    document.addEventListener("visibilitychange", onVis)
    kick()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      mo.disconnect()
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("visibilitychange", onVis)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  return <canvas ref={ref} className="hero-3d" aria-hidden />
}
