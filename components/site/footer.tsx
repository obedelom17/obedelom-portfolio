"use client"

import { ArrowUp } from "lucide-react"
import { useApp } from "@/components/providers"
import { LocalTime } from "./local-time"
import { ProximityText } from "@/components/fx/proximity-text"
import { Magnetic } from "@/components/magnetic"
import { ElasticLine } from "@/components/fx/elastic-line"
import { GithubPulse } from "@/components/fx/github-pulse"

export function Footer() {
  const { t } = useApp()
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8 md:pt-16">
        <ElasticLine />
        <p className="wordmark select-none font-serif text-[min(11.5vw,10.5rem)] leading-[0.85]" aria-hidden>
          <ProximityText text="Obed Agbebavi" />
        </p>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <div className="space-y-2">
          <p className="label flex items-center gap-2">
            <span className="relative flex h-2 w-2" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Lomé, Togo · <LocalTime /> GMT
          </p>
          <GithubPulse />
          <p className="label">
            © {new Date().getFullYear()} AGBEBAVI Elom Obed. {t.footer.rights}.
          </p>
        </div>
        <Magnetic strength={0.35}>
          <a
            href="#top"
            className="label group inline-flex items-center gap-3 transition-colors hover:text-fg"
          >
            {t.footer.top}
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition-[colors,transform] duration-300 group-hover:-translate-y-1 group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
              <ArrowUp className="h-4 w-4" />
            </span>
          </a>
        </Magnetic>
      </div>
    </footer>
  )
}
