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
    <section id="top" className="mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 md:pt-40">
      <div className="grid items-end gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="label flex items-center gap-3">
            <span className="inline-block h-2 w-2 bg-accent" aria-hidden />
            {t.hero.kicker}
          </p>
          <h1 className="mt-8 font-serif text-[2.9rem] leading-[0.98] tracking-tight sm:text-7xl lg:text-[5.5rem]">
            {l1}
            <br />
            <em className="text-accent">{l2}</em>
            <br />
            {l3}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted">{t.hero.intro}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <a
              href="#projets"
              className="inline-flex items-center gap-2 bg-fg px-6 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent hover:text-accent-fg"
            >
              {t.hero.projects}
              <ArrowDownRight className="h-4 w-4" />
            </a>
            <a href="#contact" className="link-underline pb-0.5 text-sm font-medium">
              {t.hero.contact}
            </a>
          </div>
        </div>

        <figure className="lg:col-span-4">
          <div className="relative mx-auto max-w-sm lg:max-w-none">
            <div className="absolute -bottom-3 -right-3 h-full w-full border border-accent" aria-hidden />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/photo-obed.webp"
              alt="AGBEBAVI Elom Obed"
              width={1000}
              height={1334}
              className="relative aspect-[4/5] w-full object-cover object-top"
              fetchPriority="high"
            />
          </div>
          <figcaption className="label mt-6 flex justify-between">
            <span>{t.hero.photoCaption}</span>
            <span>6.17°N 1.23°E</span>
          </figcaption>
        </figure>
      </div>

      <dl className="mt-20 grid grid-cols-3 border-y border-line">
        {[
          { v: String(projectCount).padStart(2, "0"), k: t.hero.stats.projects },
          { v: String(certificationCount).padStart(2, "0"), k: t.hero.stats.certifications },
          { v: String(firstYear), k: t.hero.stats.since },
        ].map((s, i) => (
          <div key={s.k} className={`px-2 py-6 sm:px-6 ${i > 0 ? "border-l border-line" : ""}`}>
            <dt className="label order-2">{s.k}</dt>
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
