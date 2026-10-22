"use client"

import { useState } from "react"
import { ArrowUpRight, Maximize2, Plus } from "lucide-react"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Lightbox } from "@/components/lightbox"
import { pick, pickList } from "@/lib/pick"
import type { Project } from "@/lib/types"
import { Section } from "./section"

function ProjectRow({ project, number, defaultOpen }: { project: Project; number: string; defaultOpen: boolean }) {
  const { t, lang } = useApp()
  const [open, setOpen] = useState(defaultOpen)
  const [current, setCurrent] = useState(0)
  const [zoom, setZoom] = useState(false)
  const images = project.images ?? []
  const features = pickList(lang, project.features_fr, project.features_en)

  return (
    <article className="border-t border-line last:border-b">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group grid w-full grid-cols-12 items-baseline gap-4 py-7 text-left"
      >
        <span className="label col-span-2 sm:col-span-1">{number}</span>
        <span className="col-span-10 font-serif text-3xl leading-none transition-colors group-hover:text-accent-hover sm:col-span-6 md:text-5xl">
          {project.title}
        </span>
        <span className="label col-span-9 col-start-3 hidden truncate sm:col-span-3 sm:col-start-auto sm:block">
          {(project.stack ?? []).slice(0, 3).join(" / ")}
        </span>
        <span className="label col-span-10 col-start-3 flex items-center justify-between gap-3 sm:col-span-2 sm:col-start-auto sm:justify-end">
          <span className="hidden text-fg md:inline">{t.status[project.status] ?? project.status}</span>
          <Plus className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-45" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="grid gap-8 pb-12 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-2">
            {images.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setZoom(true)}
                  className="group/img relative block w-full overflow-hidden border border-line bg-card"
                  aria-label={`${t.projects.zoom} : ${project.title}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[current]}
                    alt={`${project.title} ${current + 1}`}
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover object-top"
                  />
                  <span className="absolute bottom-3 right-3 bg-bg p-2 opacity-0 transition-opacity group-hover/img:opacity-100">
                    <Maximize2 className="h-4 w-4" />
                  </span>
                </button>
                {images.length > 1 && (
                  <div className="mt-3 flex gap-2">
                    {images.map((src, i) => (
                      <button
                        key={src + i}
                        type="button"
                        onClick={() => setCurrent(i)}
                        aria-label={`${project.title} ${i + 1}`}
                        aria-current={i === current}
                        className={`h-12 w-20 overflow-hidden border transition-opacity ${
                          i === current ? "border-fg" : "border-line opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-4">
            <p className="leading-relaxed text-muted">{pick(lang, project.description_fr, project.description_en)}</p>

            {features.length > 0 && (
              <ul className="mt-6 space-y-2 text-sm">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3 border-t border-line pt-2">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-accent" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {project.stack?.length > 0 && <p className="label mt-6">{project.stack.join(" / ")}</p>}

            {(project.demo_url || project.code_url) && (
              <div className="mt-6 flex flex-wrap gap-6 text-sm font-medium">
                {project.demo_url && (
                  <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1 pb-0.5">
                    {t.projects.demo}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
                {project.code_url && (
                  <a href={project.code_url} target="_blank" rel="noopener noreferrer" className="link-underline inline-flex items-center gap-1 pb-0.5">
                    {t.projects.code}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {zoom && (
        <Lightbox images={images} index={current} alt={project.title} onChange={setCurrent} onClose={() => setZoom(false)} />
      )}
    </article>
  )
}

export function Projects({ projects }: { projects: Project[] }) {
  const { t } = useApp()
  return (
    <Section id="projets" index="02" label={t.projects.label} title={t.projects.title}>
      {projects.length === 0 ? (
        <p className="text-muted">{t.projects.empty}</p>
      ) : (
        <div>
          {projects.map((p, i) => (
            <Reveal key={p.id}>
              <ProjectRow project={p} number={String(i + 1).padStart(2, "0")} defaultOpen={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
