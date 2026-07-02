"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="py-8 border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1 flex-wrap">
            <span>{t.footer.rights}</span>
            <span className="mx-2">·</span>
            <a
              href="https://obedelom.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              obedelom
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
