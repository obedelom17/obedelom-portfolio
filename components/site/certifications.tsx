"use client"

import { useState } from "react"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Lightbox } from "@/components/lightbox"
import { pick } from "@/lib/pick"
import type { Certification } from "@/lib/types"
import { Section } from "./section"

export function Certifications({ items }: { items: Certification[] }) {
  const { t, lang } = useApp()
  const [open, setOpen] = useState<number | null>(null)
  const withImage = items.filter((c) => c.image_url)
  const images = withImage.map((c) => c.image_url as string)

  return (
    <Section id="certifications" index="06" label={t.certifications.label} title={t.certifications.title}>
      {items.length === 0 ? (
        <p className="text-muted">{t.certifications.empty}</p>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c, i) => {
            const title = pick(lang, c.title_fr, c.title_en)
            const imageIndex = withImage.findIndex((x) => x.id === c.id)
            return (
              <Reveal key={c.id} delay={(i % 3) * 70}>
                <figure>
                  {c.image_url ? (
                    <button
                      type="button"
                      onClick={() => setOpen(imageIndex)}
                      className="block w-full overflow-hidden border border-line bg-card"
                      aria-label={title}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image_url}
                        alt={title}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
                      />
                    </button>
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center border border-line bg-card">
                      <span className="font-serif text-5xl text-line">{c.year}</span>
                    </div>
                  )}
                  <figcaption className="mt-4 flex items-start justify-between gap-4">
                    <span className="text-sm leading-snug">{title}</span>
                    <span className="label shrink-0">{c.year}</span>
                  </figcaption>
                </figure>
              </Reveal>
            )
          })}
        </div>
      )}
      {open !== null && open >= 0 && (
        <Lightbox images={images} index={open} alt={t.certifications.label} onChange={setOpen} onClose={() => setOpen(null)} />
      )}
    </Section>
  )
}
