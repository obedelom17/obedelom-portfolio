"use client"

import { useApp } from "@/components/providers"

export function Footer() {
  const { t } = useApp()
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <p className="label">
          © {new Date().getFullYear()} AGBEBAVI Elom Obed. {t.footer.rights}.
        </p>
        <a href="#top" className="label link-underline pb-0.5">
          {t.footer.top}
        </a>
      </div>
    </footer>
  )
}
