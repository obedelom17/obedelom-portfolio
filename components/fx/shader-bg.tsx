"use client"

import { useEffect, useRef } from "react"

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

const FRAG = `
precision highp float;
uniform vec2 uRes;uniform float uT;uniform vec2 uM;uniform vec3 uA;uniform vec3 uB;uniform vec3 uBg;
uniform vec3 uR[4];
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;
  vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);
  vec2 m=(uM-.5*uRes)/min(uRes.x,uRes.y);
  float d=length(p-m);
  p+=(p-m)*exp(-d*4.)*.12;
  for(int i=0;i<4;i++){
    if(uR[i].z>0.){
      vec2 c=(uR[i].xy-.5*uRes)/min(uRes.x,uRes.y);
      float r=length(p-c);float k=uR[i].z;
      p+=normalize(p-c+1e-4)*sin(r*24.-k*9.)*exp(-r*3.5)*exp(-k*1.6)*.05;
    }
  }
  float t=uT*.07;
  vec2 q=vec2(fbm(p*1.4+t),fbm(p*1.4+vec2(5.2,1.3)-t));
  vec2 r=vec2(fbm(p*1.6+q*2.2+vec2(1.7,9.2)+t*1.4),fbm(p*1.6+q*2.2+vec2(8.3,2.8)-t*1.2));
  float f=fbm(p*1.2+r*2.4);
  vec3 col=mix(uBg,uA,smoothstep(.25,.85,f)*.55);
  col=mix(col,uB,smoothstep(.45,1.,length(q))*.38);
  col+=uA*exp(-d*3.2)*.16;
  float vig=smoothstep(1.25,.25,length(uv-.5)*1.4);
  col=mix(uBg,col,vig);
  col+=(h(gl_FragCoord.xy+uT)-.5)*.018;
  gl_FragColor=vec4(col,1.);
}`

function hex(c: string): [number, number, number] {
  const s = c.trim().replace("#", "")
  const f = s.length === 3 ? s.split("").map((x) => x + x).join("") : s.padEnd(6, "0")
  return [parseInt(f.slice(0, 2), 16) / 255, parseInt(f.slice(2, 4), 16) / 255, parseInt(f.slice(4, 6), 16) / 255]
}

/**
 * Fond génératif WebGL : champ de bruit fluide déformé par le pointeur, avec ondes au clic.
 * Couleurs lues dans les variables CSS (suit le thème). Pause hors écran, onglet masqué ou mouvement réduit.
 */
export function ShaderBg() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
    if (!gl) return

    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!
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

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "p")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const U = (n: string) => gl.getUniformLocation(prog, n)
    const uRes = U("uRes"), uT = U("uT"), uM = U("uM"), uA = U("uA"), uB = U("uB"), uBg = U("uBg"), uR = U("uR")

    const colors = () => {
      const cs = getComputedStyle(document.documentElement)
      const a = hex(cs.getPropertyValue("--accent") || "#059669")
      const b = hex(cs.getPropertyValue("--accent-2") || "#10b981")
      const bg = hex(cs.getPropertyValue("--bg") || "#ffffff")
      gl.uniform3f(uA, ...a)
      gl.uniform3f(uB, ...b)
      gl.uniform3f(uBg, ...bg)
    }
    colors()
    const mo = new MutationObserver(colors)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25) * 0.6
    const resize = () => {
      const r = cv.getBoundingClientRect()
      cv.width = Math.max(2, Math.floor(r.width * dpr))
      cv.height = Math.max(2, Math.floor(r.height * dpr))
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(uRes, cv.width, cv.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)

    let mx = cv.width / 2, my = cv.height / 2, tx = mx, ty = my
    const ripples = new Float32Array(12)
    const born = [0, 0, 0, 0]
    let ri = 0
    const host = cv.parentElement ?? cv
    const toLocal = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      return [(e.clientX - r.left) * dpr, (r.height - (e.clientY - r.top)) * dpr] as const
    }
    const onMove = (e: PointerEvent) => {
      const [x, y] = toLocal(e)
      tx = x
      ty = y
    }
    const onDown = (e: PointerEvent) => {
      const [x, y] = toLocal(e)
      ripples[ri * 3] = x
      ripples[ri * 3 + 1] = y
      born[ri] = performance.now()
      ri = (ri + 1) % 4
    }
    host.addEventListener("pointermove", onMove, { passive: true })
    host.addEventListener("pointerdown", onDown, { passive: true })

    let visible = true
    let raf = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      raf = 0
      mx += (tx - mx) * 0.06
      my += (ty - my) * 0.06
      gl.uniform1f(uT, (now - t0) / 1000)
      gl.uniform2f(uM, mx, my)
      for (let i = 0; i < 4; i++) {
        const age = born[i] ? (now - born[i]) / 1000 : 99
        ripples[i * 3 + 2] = age < 3 ? age + 0.001 : 0
      }
      gl.uniform3fv(uR, ripples)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
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
      host.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerdown", onDown)
      document.removeEventListener("visibilitychange", onVis)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  return <canvas ref={ref} className="shader-bg" aria-hidden />
}
