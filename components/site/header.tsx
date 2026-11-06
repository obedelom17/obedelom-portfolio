"use client"

import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import { useApp } from "@/components/providers"
import { Magnetic } from "@/components/magnetic"
import { PaletteButton } from "@/components/command-palette"
import { ThemeToggle } from "./theme-toggle"
import { useScramble } from "./scramble"

function NavLink({ href, label, on }: { href: string; label: string; on: boolean }) {
  const [out, run] = useScramble(label)
  return (
    <a
      href={href}
      onMouseEnter={run}
      aria-label={label}
      aria-current={on ? "true" : undefined}
      className={`relative py-1 text-sm transition-colors duration-300 hover:text-fg ${on ? "text-fg" : "text-muted"}`}
    >
      <span aria-hidden>{out}</span>
      <span
        className={`bg-grad absolute -bottom-0.5 left-0 h-px transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          on ? "w-full" : "w-0"
        }`}
        aria-hidden
      />
    </a>
  )
}

export function Header({ showInternships = false }: { showInternships?: boolean }) {
  const { t, lang, setLang } = useApp()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState("")

  useEffect(() => {
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 8)
      const dy = y - lastY
      if (Math.abs(dy) > 6) {
        setHidden(dy > 0 && y > 480)
        lastY = y
      }
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Surligne le lien de la section actuellement au centre de l'écran.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return
    const ids = [
      "top",
      "apropos",
      "formation",
      ...(showInternships ? ["stages"] : []),
      "projets",
      "competences",
      "certifications",
      "contact",
    ]
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id === "top" || e.target.id === "apropos" ? "" : e.target.id)
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [showInternships])

  const links = [
    { href: "#formation", label: t.nav.education },
    ...(showInternships ? [{ href: "#stages", label: t.nav.internships }] : []),
    { href: "#projets", label: t.nav.projects },
    { href: "#competences", label: t.nav.skills },
    { href: "#certifications", label: t.nav.certifications },
    { href: "#contact", label: t.nav.contact },
  ]

  return (
    <>
    <a href="#main" className="skip-link">
      {t.ui.skip}
    </a>
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled || open ? "border-b border-line bg-bg/95" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-serif text-xl" onClick={() => setOpen(false)}>
          Obed Agbebavi
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
        </a>

        <nav className="hidden items-center gap-5 xl:flex xl:gap-8" aria-label="Navigation principale">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} on={active === l.href.slice(1)} />
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <PaletteButton />
          <ThemeToggle />
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
          <Magnetic className="ml-2 hidden xl:inline-block" strength={0.2}>
            <a
              href="/cvobed.pdf"
              download="CV_AGBEBAVI_Elom_Obed.pdf"
              className="btn-grad inline-block border border-fg px-3 py-1.5 text-sm"
            >
              {t.nav.cv}
            </a>
          </Magnetic>
          <button
            type="button"
            className="p-2 xl:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t.nav.close : t.nav.menu}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-line px-5 pb-6 pt-2 xl:hidden" aria-label="Navigation mobile">
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
    </>
  )
}
