"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, Download, Github, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useLanguage } from "@/contexts/language-context"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "#accueil", label: t.nav.home },
    { href: "#apropos", label: t.nav.about },
    { href: "#competences", label: t.nav.skills },
    { href: "#projets", label: t.nav.projects },
    { href: "#design", label: t.nav.design },
    { href: "#parcours", label: t.nav.timeline },
    { href: "#certifications", label: t.nav.certifications },
    { href: "#contact", label: t.nav.contact },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="#accueil" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">AEO</span>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <span className="hidden sm:inline text-sm text-muted-foreground">obedelom.dev</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-white neon-cyan"
              asChild
            >
              <a href="/cvobed.pdf" download="CV_AGBEBAVI_Elom_Obed.pdf">
                <Download className="w-4 h-4 mr-2" />
                {t.nav.downloadCV}
              </a>
            </Button>
          </div>

          {/* Mobile right side : CV + toggles + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Lang toggle mobile */}
            <button
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="px-2 py-1 text-xs font-semibold rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              {lang === "fr" ? "EN" : "FR"}
            </button>

            {/* Theme toggle mobile */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {/* CV button mobile */}
            <a
              href="/cvobed.pdf"
              download="CV_AGBEBAVI_Elom_Obed.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              CV
            </a>

            {/* Hamburger */}
            <button
              className="text-foreground p-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-background/95 backdrop-blur-md border-b border-border"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-1 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-3 pt-3 border-t border-border">
              <Button size="sm" className="bg-primary text-white hover:bg-primary/90 neon-cyan flex-1" asChild>
                <a href="/cvobed.pdf" download="CV_AGBEBAVI_Elom_Obed.pdf">
                  <Download className="w-4 h-4 mr-2" />
                  {t.nav.downloadCV}
                </a>
              </Button>
              <Button size="sm" variant="outline" className="border-muted-foreground/30 flex-1" asChild>
                <a href="https://github.com/obedelom17" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
