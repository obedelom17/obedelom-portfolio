"use client"

import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { ScrollWords } from "@/components/scroll-words"
import { Section } from "./section"

export function About() {
  const { t } = useApp()
  return (
    <Section id="apropos" index="01" label={t.about.label}>
      <ScrollWords text={t.about.text} className="font-serif text-2xl leading-snug md:text-4xl md:leading-[1.2]" />
      <div className="mt-16 grid gap-5 sm:grid-cols-3">
        {t.about.facts.map((f, i) => (
          <Reveal key={f.title} delay={i * 110} className="h-full">
            <div className="h-full border border-line p-6 transition-[transform,border-color,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-fg hover:bg-card">
              <span className="label">
                <span className="text-accent">{String(i + 1).padStart(2, "0")}</span>
              </span>
              <h3 className="mt-8 font-serif text-xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
