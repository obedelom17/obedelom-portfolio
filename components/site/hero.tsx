"use client"

import { Fragment, useRef } from "react"
import { ArrowDownRight } from "lucide-react"
import { useApp } from "@/components/providers"
import { CountUp } from "@/components/count-up"
import { Magnetic } from "@/components/magnetic"
import { ParticleField } from "@/components/particle-field"
import { RotatingWords } from "./rotating-words"
import { Scramble } from "./scramble"
import { Roll } from "@/components/fx/roll"
import { HeroMotion } from "@/components/fx/hero-motion"

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as React.CSSProperties

/** Mots qui montent un à un depuis le masque de leur ligne. */
function Words({ text, base, className = "" }: { text: string; base: number; className?: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <Fragment key={`${i}-${w}`}>
          <span className={`word-in ${className}`} style={d(base + i * 80)}>
            {w}
          </span>{" "}
        </Fragment>
      ))}
    </>
  )
}

export function Hero({
  projectCount,
  certificationCount,
  firstYear,
}: {
  projectCount: number
  certificationCount: number
  firstYear: number
}) {
  const { t } = useApp()
  const [l1, l2, l3] = t.hero.title
  const glow = useRef<HTMLDivElement>(null)

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || !glow.current) return
    const r = e.currentTarget.getBoundingClientRect()
    glow.current.style.transform = `translate3d(${e.clientX - r.left - 300}px, ${e.clientY - r.top - 300}px, 0)`
  }

  const stats = [
    { v: <CountUp to={projectCount} />, k: t.hero.stats.projects },
    { v: <CountUp to={certificationCount} />, k: t.hero.stats.certifications },
    { v: <span>{firstYear}</span>, k: t.hero.stats.since },
  ]

  return (
    <section id="top" onPointerMove={onMove} className="relative overflow-hidden">
      <div className="hero-grid" aria-hidden />
      <div className="pointer-events-none absolute inset-0" data-depth="-34" aria-hidden>
        <div className="hero-orb hero-orb--a" />
      </div>
      <div className="pointer-events-none absolute inset-0" data-depth="28" aria-hidden>
        <div className="hero-orb hero-orb--b" />
      </div>
      <HeroMotion />
      <ParticleField />
      <div ref={glow} className="hero-glow" aria-hidden />

      <div data-hero-exit className="relative mx-auto max-w-7xl px-5 pb-32 pt-36 sm:px-8 md:pt-48">
        <div className="hero-badge" data-depth="16" aria-hidden>
          <svg viewBox="0 0 120 120" className="hero-badge__ring">
            <defs>
              <path id="badge-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
            </defs>
            <text fontSize="9.5" letterSpacing="3.2" fill="currentColor" style={{ textTransform: "uppercase" }}>
              <textPath href="#badge-circle">{t.hero.badge}</textPath>
            </text>
          </svg>
          <ArrowDownRight className="hero-badge__icon h-6 w-6" />
        </div>

        <p className="label fade-up flex items-center gap-3" style={d(100)}>
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <Scramble text={t.hero.kicker} auto delay={900} />
        </p>

        <h1 data-hero-title className="hero-title mt-10 max-w-5xl font-serif text-[2.7rem] leading-[1.02] sm:text-7xl lg:text-[5.6rem]">
          <span className="line">
            <Words text={l1} base={200} />
          </span>
          <span className="line">
            <Words text={l2} base={380} />
          </span>
          <span className="line">
            <Words text={l3} base={520} className="text-shine" />
          </span>
        </h1>

        <p className="fade-up mt-8 flex items-center gap-3 font-mono text-sm md:text-base" style={d(900)}>
          <span className="text-gradient-star">→</span>
          <RotatingWords words={t.hero.roles} />
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <p className="fade-up max-w-xl text-lg leading-relaxed text-muted md:col-span-6 md:col-start-1" style={d(1000)}>
            {t.hero.intro}
          </p>
          <div className="fade-up flex flex-wrap items-center gap-8 md:col-span-6 md:justify-end" style={d(1100)}>
            <Magnetic>
              <a
                href="#projets"
                className="btn-grad roll-host inline-flex items-center gap-3 bg-fg px-7 py-4 text-sm font-medium text-bg"
              >
                <Roll text={t.hero.projects} />
                <ArrowDownRight className="h-4 w-4" />
              </a>
            </Magnetic>
            <a href="#contact" className="link-underline pb-0.5 text-sm font-medium">
              {t.hero.contact}
            </a>
          </div>
        </div>

        <dl className="fade-up focus-cols mt-20 grid grid-cols-3 border-y border-line" style={d(1250)}>
          {stats.map((s, i) => (
            <div key={s.k} className={`spot px-2 py-7 sm:px-8 ${i > 0 ? "border-l border-line" : ""}`}>
              <dt className="label">{s.k}</dt>
              <dd className="mt-3 font-serif text-4xl sm:text-7xl">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="scroll-hint" aria-hidden>
        <span className="label">Scroll</span>
        <span className="scroll-hint__line" />
      </div>
    </section>
  )
}
