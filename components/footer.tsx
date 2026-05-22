"use client"

import { motion } from "framer-motion"

export function Footer() {
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
            <span>© 2025 AGBEBAVI Elom Obed</span>
            <span className="mx-2">·</span>
            <a
              href="https://obedelom.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              obedelom.dev
            </a>
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
