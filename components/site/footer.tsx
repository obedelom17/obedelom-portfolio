"use client"

import { ArrowUp } from "lucide-react"
import { useApp } from "@/components/providers"

export function Footer() {
  const { t } = useApp()
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 md:pt-24">
        <p className="wordmark select-none font-serif text-[min(11.5vw,10.5rem)] leading-[0.85]" aria-hidden>
          Obed Agbebavi
        </p>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <p className="label">
          © {new Date().getFullYear()} AGBEBAVI Elom Obed. {t.footer.rights}.
        </p>
        <a
          href="#top"
          className="label group inline-flex items-center gap-3 transition-colors hover:text-fg"
        >
          {t.footer.top}
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line transition-colors duration-300 group-hover:border-fg group-hover:bg-fg group-hover:text-bg">
            <ArrowUp className="h-4 w-4" />
          </span>
        </a>
      </div>
    </footer>
  )
}
