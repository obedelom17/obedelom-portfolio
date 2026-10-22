"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { dictionary, type Dictionary } from "@/lib/i18n"
import type { Lang } from "@/lib/types"

type Theme = "light" | "dark"

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Dictionary
  theme: Theme
  toggleTheme: () => void
}

const AppContext = createContext<Ctx>({
  lang: "fr",
  setLang: () => {},
  t: dictionary.fr,
  theme: "light",
  toggleTheme: () => {},
})

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr")
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("lang")
      if (savedLang === "fr" || savedLang === "en") setLangState(savedLang)
    } catch {}
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light")
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem("lang", l)
    } catch {}
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark"
      document.documentElement.classList.toggle("dark", next === "dark")
      try {
        localStorage.setItem("theme", next)
      } catch {}
      return next
    })
  }, [])

  return (
    <AppContext.Provider value={{ lang, setLang, t: dictionary[lang], theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
