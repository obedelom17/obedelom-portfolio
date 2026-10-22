"use client"

import { ArrowDownRight } from "lucide-react"
import { useApp } from "@/components/providers"

const stack = ["Next.js", "React", "TypeScript", "Django", "Supabase", "PostgreSQL", "Tailwind CSS"]

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

  return (
    <section id="top" className="mx-auto max-w-7xl px-5 pb-20 pt-36 sm:px-8 md:pt-48">
      <p className="label flex items-center gap-3">
        <span className="inline-block h-2 w-2 bg-accent" aria-hidden />
        {t.hero.kicker}
      </p>

      <h1 className="mt-10 max-w-5xl font-serif text-[2.6rem] leading-[1.02] sm:text-7xl lg:text-[6.2rem]">
        {l1} <em className="not-italic text-accent">{l2}</em> {l3}
      </h1>

      <div className="mt-16 grid gap-10 md:grid-cols-12">
        <p className="max-w-xl text-lg leading-relaxed text-muted md:col-span-6 md:col-start-1">{t.hero.intro}</p>
        <div className="flex flex-wrap items-center gap-6 md:col-span-6 md:justify-end">
          <a
            href="#projets"
            className="inline-flex items-center gap-2 bg-fg px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
          >
            {t.hero.projects}
            <ArrowDownRight className="h-4 w-4" />
          </a>
          <a href="#contact" className="link-underline pb-0.5 text-sm font-medium">
            {t.hero.contact}
          </a>
        </div>
      </div>

      <dl className="mt-24 grid grid-cols-3 border-y border-line">
        {[
          { v: String(projectCount).padStart(2, "0"), k: t.hero.stats.projects },
          { v: String(certificationCount).padStart(2, "0"), k: t.hero.stats.certifications },
          { v: String(firstYear), k: t.hero.stats.since },
        ].map((s, i) => (
          <div key={s.k} className={`px-2 py-6 sm:px-6 ${i > 0 ? "border-l border-line" : ""}`}>
            <dt className="label">{s.k}</dt>
            <dd className="mt-2 font-serif text-4xl sm:text-6xl">{s.v}</dd>
          </div>
        ))}
      </dl>

      <ul className="label mt-8 flex flex-wrap gap-x-5 gap-y-2" aria-label="Technologies">
        {stack.map((s, i) => (
          <li key={s} className="flex items-center gap-5">
            {s}
            {i < stack.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
