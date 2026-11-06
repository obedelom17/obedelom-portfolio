import type { ReactNode } from "react"
import { Reveal } from "@/components/reveal"
import { SplitWords } from "@/components/split-words"
import { ScrollFillNum } from "@/components/fx/scroll-fill-num"
import { DotGrid } from "@/components/fx/dot-grid"

export function Section({
  id,
  index,
  label,
  title,
  glow = false,
  grid = false,
  children,
}: {
  id: string
  index: string
  label: string
  title?: string
  glow?: boolean
  grid?: boolean
  children: ReactNode
}) {
  return (
    <section id={id} className="relative border-t border-line">
      <span className="sec-line" aria-hidden />
      {glow && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="hero-orb hero-orb--a" style={{ top: "auto", bottom: "-18rem" }} />
          <div className="hero-orb hero-orb--b" style={{ bottom: "auto", top: "-6rem" }} />
        </div>
      )}
      {grid && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <DotGrid />
        </div>
      )}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:py-36 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <div className="lg:sticky lg:top-28">
            <Reveal variant="left">
              <span className="block origin-left font-serif text-7xl leading-none md:text-8xl">
                <ScrollFillNum value={index} />
              </span>
              <p className="label mt-6 flex items-center gap-3">
                <span className="bg-grad h-px w-8" aria-hidden />
                {label}
              </p>
              {title ? (
                <h2 className="vskew mt-4 font-serif text-3xl leading-tight md:text-4xl lg:text-2xl xl:text-3xl">
                  <SplitWords text={title} />
                </h2>
              ) : null}
            </Reveal>
          </div>
        </div>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </section>
  )
}
