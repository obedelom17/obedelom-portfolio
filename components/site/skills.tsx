"use client"

import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { skills } from "@/lib/skills"
import { Section } from "./section"

export function Skills() {
  const { t } = useApp()
  return (
    <Section id="competences" index="03" label={t.skills.label} title={t.skills.title}>
      <ul>
        {skills.map((s) => (
          <li key={s.key}>
            <Reveal>
              <div className="grid grid-cols-12 items-baseline gap-4 border-t border-line py-5 last:border-b">
                <p className="label col-span-12 sm:col-span-3">{t.skills.categories[s.key]}</p>
                <p className="col-span-9 font-serif text-xl leading-snug sm:col-span-7 md:text-2xl">{s.items}</p>
                <div
                  className="col-span-3 flex justify-end gap-1 sm:col-span-2"
                  role="img"
                  aria-label={`${t.skills.level} ${s.level} / 5`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`h-2.5 w-2.5 ${n <= s.level ? "bg-fg" : "border border-line"}`} />
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
