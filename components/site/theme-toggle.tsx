"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useApp } from "@/components/providers"
import { currentTheme, setTheme } from "@/lib/theme"

export function ThemeToggle() {
  const { t } = useApp()
  const [dark, setDark] = useState(false)

  // Suit le thème quel que soit l'endroit d'où il est changé (bouton, palette de commandes).
  useEffect(() => {
    const sync = () => setDark(currentTheme() === "dark")
    sync()
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => obs.disconnect()
  }, [])

  const icon = "absolute inset-0 m-auto h-[18px] w-[18px] transition-all duration-500"

  return (
    <button
      type="button"
      onClick={(e) => setTheme(dark ? "light" : "dark", { x: e.clientX, y: e.clientY })}
      aria-label={t.nav.theme}
      aria-pressed={dark}
      className="theme-toggle relative h-9 w-9 text-muted transition-colors hover:text-fg"
    >
      <Sun className={`${icon} ${dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon className={`${icon} ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
    </button>
  )
}
