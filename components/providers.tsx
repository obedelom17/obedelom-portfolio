"use client"

import { flushSync } from "react-dom"
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
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (doc.startViewTransition && !reduce) {
      const root = document.documentElement
      root.dataset.vt = "lang"
      const vt = doc.startViewTransition(() => flushSync(() => setLangState(l))) as { finished?: Promise<unknown> } | undefined
      const clear = () => {
        delete root.dataset.vt
      }
      if (vt?.finished) vt.finished.then(clear, clear)
      else window.setTimeout(clear, 700)
    }
    else setLangState(l)
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
