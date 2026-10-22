"use client"

import { ArrowUpRight } from "lucide-react"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Section } from "./section"

export function Education() {
  const { t } = useApp()
  const f = t.formation

  return (
    <Section id="formation" index="02" label={f.label} title={f.title}>
      <Reveal>
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/iai/iai-lome.webp"
            alt={f.caption}
            width={1800}
            height={1350}
            className="aspect-[16/9] w-full border border-line object-cover object-[50%_40%]"
          />
          <figcaption className="label mt-3">{f.caption}</figcaption>
        </figure>
      </Reveal>

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <div className="flex h-full flex-col justify-between gap-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/iai/iai-logo.webp"
              alt={f.logoAlt}
              width={224}
              height={188}
              className="h-28 w-auto self-start border border-line"
            />
            <a
              href="https://www.iai-togo.tg"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex items-center gap-1 self-start pb-0.5 text-sm font-medium"
            >
              {f.site}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-8" delay={80}>
          <p className="text-lg leading-relaxed md:text-xl">{f.intro}</p>
        </Reveal>
      </div>

      <dl className="mt-14 grid grid-cols-3 border-y border-line">
        {f.stats.map((s, i) => (
          <div key={s.label} className={`px-2 py-6 sm:px-6 ${i > 0 ? "border-l border-line" : ""}`}>
            <dt className="label">{s.label}</dt>
            <dd className="mt-2 font-serif text-3xl sm:text-5xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-14 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h3 className="label">{f.diplomasTitle}</h3>
          <ul className="mt-4">
            {f.diplomas.map((d) => (
              <li key={d.title}>
                <Reveal>
                  <div className="border-t border-line py-5 last:border-b">
                    <p className="font-serif text-xl leading-snug md:text-2xl">{d.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{d.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <h3 className="label">{f.mineTitle}</h3>
          <Reveal>
            <p className="mt-4 border-t border-fg pt-5 leading-relaxed">{f.mine}</p>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
