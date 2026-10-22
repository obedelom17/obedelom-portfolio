"use client"

import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Section } from "./section"

export function About() {
  const { t } = useApp()
  return (
    <Section id="apropos" index="01" label={t.about.label}>
      <Reveal>
        <p className="font-serif text-2xl leading-snug md:text-4xl md:leading-[1.2]">{t.about.text}</p>
      </Reveal>
      <div className="mt-14 grid gap-8 sm:grid-cols-3">
        {t.about.facts.map((f, i) => (
          <Reveal key={f.title} delay={i * 80}>
            <div className="border-t border-fg pt-4">
              <h3 className="text-sm font-medium">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
