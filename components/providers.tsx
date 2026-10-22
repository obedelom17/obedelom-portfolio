"use client"

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { dictionary, type Dictionary } from "@/lib/i18n"
import type { Lang } from "@/lib/types"

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: Dictionary
}

const AppContext = createContext<Ctx>({
  lang: "fr",
  setLang: () => {},
  t: dictionary.fr,
})

export function Providers({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr")

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("lang")
      if (savedLang === "fr" || savedLang === "en") setLangState(savedLang)
    } catch {}
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

  return (
    <AppContext.Provider value={{ lang, setLang, t: dictionary[lang] }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
