"use client"

import { useRef } from "react"
import { ArrowDownRight } from "lucide-react"
import { useApp } from "@/components/providers"
import { CountUp } from "@/components/count-up"
import { Magnetic } from "@/components/magnetic"

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
      <div className="hero-orb hero-orb--a" aria-hidden />
      <div className="hero-orb hero-orb--b" aria-hidden />
      <div ref={glow} className="hero-glow" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-36 sm:px-8 md:pt-48">
        <div className="hero-badge" aria-hidden>
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

        <p className="label fade-up flex items-center gap-3" style={{ ["--d" as string]: "100ms" } as React.CSSProperties}>
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          {t.hero.kicker}
        </p>

        <h1 className="mt-10 max-w-5xl font-serif text-[2.7rem] leading-[1.02] sm:text-7xl lg:text-[5.6rem]">
          <span className="line">
            <span className="line__in" style={{ ["--d" as string]: "200ms" } as React.CSSProperties}>
              {l1}
            </span>
          </span>
          <span className="line">
            <span className="line__in" style={{ ["--d" as string]: "320ms" } as React.CSSProperties}>
              {l2}
            </span>
          </span>
          <span className="line">
            <span className="line__in" style={{ ["--d" as string]: "440ms" } as React.CSSProperties}>
              <em className="text-shine not-italic">{l3}</em>
            </span>
          </span>
        </h1>

        <div className="mt-16 grid gap-10 md:grid-cols-12">
          <p
            className="fade-up max-w-xl text-lg leading-relaxed text-muted md:col-span-6 md:col-start-1"
            style={{ ["--d" as string]: "700ms" } as React.CSSProperties}
          >
            {t.hero.intro}
          </p>
          <div
            className="fade-up flex flex-wrap items-center gap-8 md:col-span-6 md:justify-end"
            style={{ ["--d" as string]: "850ms" } as React.CSSProperties}
          >
            <Magnetic>
              <a
                href="#projets"
                className="btn-grad inline-flex items-center gap-3 bg-fg px-7 py-4 text-sm font-medium text-bg"
              >
                {t.hero.projects}
                <ArrowDownRight className="h-4 w-4" />
              </a>
            </Magnetic>
            <a href="#contact" className="link-underline pb-0.5 text-sm font-medium">
              {t.hero.contact}
            </a>
          </div>
        </div>

        <dl
          className="fade-up mt-24 grid grid-cols-3 border-y border-line"
          style={{ ["--d" as string]: "1000ms" } as React.CSSProperties}
        >
          {stats.map((s, i) => (
            <div key={s.k} className={`px-2 py-7 sm:px-8 ${i > 0 ? "border-l border-line" : ""}`}>
              <dt className="label">{s.k}</dt>
              <dd className="mt-3 font-serif text-4xl sm:text-7xl">{s.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
