"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { translations, Lang } from "@/lib/translations"

interface LanguageContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: typeof translations["fr"]
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  t: translations.fr,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr")

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
