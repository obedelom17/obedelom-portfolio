import type { ReactNode } from "react"

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
    <section id={id} className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-12 md:py-28">
        <div className="md:col-span-3">
          <p className="label">
            <span className="text-accent">{index}</span> &nbsp; {label}
          </p>
          {title ? (
            <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">{title}</h2>
          ) : null}
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  )
}
