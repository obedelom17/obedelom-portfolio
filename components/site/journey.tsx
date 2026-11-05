"use client"

import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { pick } from "@/lib/pick"
import type { JourneyItem } from "@/lib/types"
import { Section } from "./section"

export function Journey({ items, index = "05" }: { items: JourneyItem[]; index?: string }) {
  const { t, lang } = useApp()
  return (
    <Section id="parcours" index={index} label={t.journey.label} title={t.journey.title}>
      {items.length === 0 ? (
        <p className="text-muted">{t.journey.empty}</p>
      ) : (
        <ol>
          {items.map((item) => (
            <li key={item.id}>
              <Reveal>
                <div className="group grid grid-cols-12 gap-4 border-t border-line py-6 transition-colors duration-500 hover:bg-card last:border-b">
                  <p className="label col-span-3 pt-1.5 sm:col-span-2">
                    <span className="transition-colors duration-500 group-hover:text-accent">{item.year}</span>
                  </p>
                  <div className="col-span-9 sm:col-span-10 md:grid md:grid-cols-10 md:gap-4">
                    <h3 className="font-serif text-xl leading-snug transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 md:col-span-5 md:text-2xl">
                      {pick(lang, item.title_fr, item.title_en)}
                    </h3>
                    <p className="mt-1 text-sm text-muted md:col-span-5 md:mt-1.5">
                      {pick(lang, item.description_fr, item.description_en)}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </Section>
  )
}
