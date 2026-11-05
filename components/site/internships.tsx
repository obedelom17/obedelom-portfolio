"use client"

import { ArrowUpRight } from "lucide-react"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { isHttpUrl } from "@/lib/media"
import { pick, pickList } from "@/lib/pick"
import type { Internship } from "@/lib/types"
import { Section } from "./section"

function InternshipBlock({ item, first }: { item: Internship; first: boolean }) {
  const { t, lang } = useApp()
  const f = t.internships

  const role = pick(lang, item.role_fr, item.role_en)
  const description = pick(lang, item.description_fr, item.description_en)
  const missions = pickList(lang, item.missions_fr, item.missions_en)
  const stack = item.stack ?? []
  const site = isHttpUrl(item.website_url) ? item.website_url.trim() : null
  const stats = [
    { label: f.period, value: item.period },
    { label: f.duration, value: item.duration },
    { label: f.location, value: item.location },
  ].filter((s) => s.value && s.value.trim())

  return (
    <article className={first ? "" : "mt-24 border-t border-line pt-24"}>
      {item.image_url && (
        <Reveal>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="overflow-hidden border border-line">
              <img
                src={item.image_url}
                alt={item.company}
                className="wipe aspect-[16/9] w-full object-cover object-[50%_40%]"
              />
            </div>
            <figcaption className="label mt-3">
              {item.company}
              {item.location ? `, ${item.location}` : ""}
            </figcaption>
          </figure>
        </Reveal>
      )}

      <div className={`${item.image_url ? "mt-12" : ""} grid gap-10 lg:grid-cols-12`}>
        {(item.logo_url || site) && (
          <Reveal className="lg:col-span-4">
            <div className="flex h-full flex-col justify-between gap-8">
              {item.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo_url}
                  alt={`${f.logoAlt} ${item.company}`}
                  className="h-28 w-auto max-w-full self-start border border-line object-contain"
                />
              )}
              {site && (
                <a
                  href={site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-1 self-start pb-0.5 text-sm font-medium"
                >
                  {f.site}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              )}
            </div>
          </Reveal>
        )}
        <Reveal className={item.logo_url || site ? "lg:col-span-8" : "lg:col-span-12"} delay={80}>
          <h3 className="font-serif text-3xl leading-tight md:text-4xl">{item.company}</h3>
          {role && (
            <p className="label mt-3">
              <span className="text-fg">{role}</span>
            </p>
          )}
          {description && <p className="mt-6 text-lg leading-relaxed md:text-xl">{description}</p>}
        </Reveal>
      </div>

      {stats.length > 0 && (
        <dl
          className="mt-14 grid border-y border-line"
          style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
        >
          {stats.map((s, i) => (
            <div key={s.label} className={`px-2 py-6 sm:px-6 ${i > 0 ? "border-l border-line" : ""}`}>
              <dt className="label">{s.label}</dt>
              <dd className="mt-2 break-words font-serif text-xl leading-tight sm:text-2xl md:text-3xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(missions.length > 0 || stack.length > 0) && (
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          {missions.length > 0 && (
            <div className="lg:col-span-7">
              <h4 className="label">{f.missionsTitle}</h4>
              <ul className="mt-4">
                {missions.map((m, i) => (
                  <li key={`${i}-${m}`}>
                    <Reveal>
                      <div className="border-t border-line py-5 last:border-b">
                        <p className="leading-relaxed md:text-lg">{m}</p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {stack.length > 0 && (
            <div className="lg:col-span-5 lg:col-start-8">
              <h4 className="label">{f.stackTitle}</h4>
              <Reveal>
                <p className="mt-4 border-t border-fg pt-5 leading-relaxed">{stack.join(" / ")}</p>
              </Reveal>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export function Internships({ items, index }: { items: Internship[]; index: string }) {
  const { t } = useApp()
  if (items.length === 0) return null

  return (
    <Section id="stages" index={index} label={t.internships.label} title={t.internships.title}>
      {items.map((item, i) => (
        <InternshipBlock key={item.id} item={item} first={i === 0} />
      ))}
    </Section>
  )
}
