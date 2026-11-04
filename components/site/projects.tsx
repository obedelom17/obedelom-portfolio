"use client"

import { useState } from "react"
import { ArrowUpRight, Maximize2 } from "lucide-react"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Lightbox } from "@/components/lightbox"
import { VideoPlayer, VideoThumb } from "@/components/media-player"
import { buildMedia } from "@/lib/media"
import { pick, pickList } from "@/lib/pick"
import type { Project } from "@/lib/types"
import { Section } from "./section"

function ProjectRow({ project, number }: { project: Project; number: string }) {
  const { t, lang } = useApp()
  const [current, setCurrent] = useState(0)
  const [zoom, setZoom] = useState(false)
  // Les vidéos passent avant les images : la première est affichée d'emblée et démarre toute seule.
  const media = buildMedia(project.images, project.videos)
  const active = media[current] ?? media[0]
  const features = pickList(lang, project.features_fr, project.features_en)

  return (
    <article className="border-t border-line last:border-b">
      <div className="grid grid-cols-12 items-baseline gap-4 pt-8">
        <span className="label col-span-2 sm:col-span-1">{number}</span>
        <h3 className="col-span-10 font-serif text-3xl leading-none sm:col-span-8 md:text-5xl">{project.title}</h3>
        <span className="label col-span-10 col-start-3 sm:col-span-3 sm:col-start-auto sm:text-right">
          <span className="text-fg">{t.status[project.status] ?? project.status}</span>
        </span>
      </div>

        <div className="grid gap-8 pb-14 pt-8 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-2">
            {media.length > 0 && active && (
              <>
                {active.kind === "video" ? (
                  <div className="relative w-full overflow-hidden border border-line bg-black">
                    <VideoPlayer
                      key={active.src}
                      item={active}
                      title={`${project.title} ${current + 1}`}
                      className={`aspect-[16/10] w-full ${active.embed ? "" : "object-contain"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setZoom(true)}
                      aria-label={`${t.projects.zoom} : ${project.title}`}
                      className="absolute right-3 top-3 bg-bg p-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setZoom(true)}
                    data-cursor={t.ui.view}
                    className="group/img relative block w-full overflow-hidden border border-line bg-card"
                    aria-label={`${t.projects.zoom} : ${project.title}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={active.src}
                      alt={`${project.title} ${current + 1}`}
                      className="aspect-[16/10] w-full object-cover object-top transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/img:scale-[1.04]"
                    />
                    <span className="absolute bottom-3 right-3 bg-bg p-2 opacity-0 transition-opacity group-hover/img:opacity-100">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </button>
                )}
                {media.length > 1 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {media.map((m, i) => (
                      <button
                        key={m.src + i}
                        type="button"
                        onClick={() => setCurrent(i)}
                        aria-label={`${m.kind === "video" ? t.projects.video : project.title} ${i + 1}`}
                        aria-current={i === current}
                        className={`h-12 w-20 overflow-hidden border transition-opacity ${
                          i === current ? "border-fg" : "border-line opacity-60 hover:opacity-100"
                        }`}
                      >
                        {m.kind === "video" ? (
                          <VideoThumb item={m} />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.src} alt="" className="h-full w-full object-cover object-top" />
                        )}
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

      {zoom && (
        <Lightbox media={media} index={current} alt={project.title} onChange={setCurrent} onClose={() => setZoom(false)} />
      )}
    </article>
  )
}

export function Projects({ projects, index = "03" }: { projects: Project[]; index?: string }) {
  const { t } = useApp()
  return (
    <Section id="projets" index={index} label={t.projects.label} title={t.projects.title}>
      {projects.length === 0 ? (
        <p className="text-muted">{t.projects.empty}</p>
      ) : (
        <div>
          {projects.map((p, i) => (
            <Reveal key={p.id}>
              <ProjectRow project={p} number={String(i + 1).padStart(2, "0")} />
            </Reveal>
          ))}
        </div>
      )}
    </Section>
  )
}
