"use client"

import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { skills } from "@/lib/skills"
import { Section } from "./section"

export function Skills({ index = "04" }: { index?: string }) {
  const { t } = useApp()
  return (
    <Section id="competences" index={index} label={t.skills.label} title={t.skills.title}>
      <ul>
        {skills.map((s) => (
          <li key={s.key}>
            <Reveal>
              <div className="grid grid-cols-12 items-center gap-4 border-t border-line py-6 last:border-b">
                <p className="label col-span-12 sm:col-span-3">{t.skills.categories[s.key]}</p>
                <ul className="col-span-9 flex flex-wrap gap-2 sm:col-span-7">
                  {s.items.map((it) => (
                    <li
                      key={it.name}
                      className="flex items-center gap-2.5 border border-line py-1.5 pl-1.5 pr-3 text-sm transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-fg hover:bg-card"
                    >
                      <span className="flex h-7 w-7 items-center justify-center bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/tech/${it.icon}.svg`} alt="" width={20} height={20} className="h-5 w-5" />
                      </span>
                      {it.name}
                    </li>
                  ))}
                </ul>
                <div
                  className="col-span-3 flex justify-end gap-1 sm:col-span-2"
                  role="img"
                  aria-label={`${t.skills.level} ${s.level} / 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className={`pip h-2.5 w-2.5 ${n <= s.level ? "bg-accent" : "border border-line"}`}
                      style={{ ["--i" as string]: n } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </Section>
  )
}
