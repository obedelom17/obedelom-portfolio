"use client"

import { useState } from "react"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Lightbox } from "@/components/lightbox"
import { pick } from "@/lib/pick"
import type { Certification } from "@/lib/types"
import { Section } from "./section"
import { Tilt } from "@/components/tilt"

export function Certifications({ items, index = "06" }: { items: Certification[]; index?: string }) {
  const { t, lang } = useApp()
  const [open, setOpen] = useState<number | null>(null)
  const withImage = items.filter((c) => c.image_url)
  const images = withImage.map((c) => c.image_url as string)

  return (
    <Section id="certifications" index={index} label={t.certifications.label} title={t.certifications.title}>
      {items.length === 0 ? (
        <p className="text-muted">{t.certifications.empty}</p>
      ) : (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c, i) => {
            const title = pick(lang, c.title_fr, c.title_en)
            const imageIndex = withImage.findIndex((x) => x.id === c.id)
            return (
              <Reveal key={c.id} delay={(i % 3) * 90} variant={i % 2 ? "blur" : "rotate"}>
                <figure className="vskew">
                  {c.image_url ? (
                    <Tilt max={6}>
                    <button
                      type="button"
                      onClick={() => setOpen(imageIndex)}
                      data-cursor={t.ui.view}
                      data-liquid
                      className="group/cert block w-full overflow-hidden border border-line bg-card shadow-[0_0_0_0_rgba(0,0,0,0)] transition-[box-shadow,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
                      aria-label={title}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image_url}
                        alt={title}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover object-top transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/cert:scale-[1.05]"
                      />
                    </button>
                    </Tilt>
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
