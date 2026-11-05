import type { ReactNode } from "react"
import { Reveal } from "@/components/reveal"

export function Section({
  id,
  index,
  label,
  title,
  children,
}: {
  id: string
  index: string
  label: string
  title?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="relative border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-24 sm:px-8 md:grid-cols-12 md:py-36">
        <div className="md:col-span-3">
          <div className="md:sticky md:top-28">
            <Reveal variant="left">
              <span className="outline-num block font-serif text-7xl leading-none md:text-8xl">{index}</span>
              <p className="label mt-6 flex items-center gap-3">
                <span className="bg-grad h-px w-8" aria-hidden />
                {label}
              </p>
              {title ? <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">{title}</h2> : null}
            </Reveal>
          </div>
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  )
}
