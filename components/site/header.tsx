"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { useApp } from "@/components/providers"

export function Header() {
  const { t, lang, setLang } = useApp()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const links = [
    { href: "#projets", label: t.nav.projects },
    { href: "#competences", label: t.nav.skills },
    { href: "#parcours", label: t.nav.journey },
    { href: "#certifications", label: t.nav.certifications },
    { href: "#contact", label: t.nav.contact },
  ]

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors ${
        scrolled || open ? "border-b border-line bg-bg/90 backdrop-blur" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-serif text-xl tracking-tight" onClick={() => setOpen(false)}>
          Obed Agbebavi
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigation principale">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted transition-colors hover:text-fg">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            aria-label={t.nav.language}
            className="label px-2 py-2 transition-colors hover:text-fg"
          >
            <span className={lang === "fr" ? "text-fg" : ""}>FR</span>
            <span className="mx-1">/</span>
            <span className={lang === "en" ? "text-fg" : ""}>EN</span>
          </button>
          <a
            href="/cvobed.pdf"
            download="CV_AGBEBAVI_Elom_Obed.pdf"
            className="ml-2 hidden border border-fg px-3 py-1.5 text-sm transition-colors hover:bg-fg hover:text-bg md:inline-block"
          >
            {t.nav.cv}
          </a>
          <button
            type="button"
            className="p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.nav.close : t.nav.menu}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line px-5 pb-6 pt-2 md:hidden" aria-label="Navigation mobile">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-4 font-serif text-2xl"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/cvobed.pdf"
            download="CV_AGBEBAVI_Elom_Obed.pdf"
            className="mt-5 inline-block border border-fg px-4 py-2 text-sm"
          >
            {t.nav.cv}
          </a>
        </nav>
      )}
    </header>
  )
}
