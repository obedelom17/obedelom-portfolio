"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useApp } from "@/components/providers"

export function ThemeToggle() {
  const { t } = useApp()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark")
  }, [])

  const toggle = () => {
    const next = dark ? "light" : "dark"
    const root = document.documentElement
    root.classList.add("theme-anim")
    root.dataset.theme = next
    try {
      localStorage.setItem("theme", next)
    } catch {}
    setDark(!dark)
    window.setTimeout(() => root.classList.remove("theme-anim"), 500)
  }

  const icon = "absolute inset-0 m-auto h-[18px] w-[18px] transition-all duration-500"

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.nav.theme}
      aria-pressed={dark}
      className="theme-toggle relative h-9 w-9 text-muted transition-colors hover:text-fg"
    >
      <Sun className={`${icon} ${dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon className={`${icon} ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
    </button>
  )
}
