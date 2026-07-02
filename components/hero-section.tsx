"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, ExternalLink, Mail, Code2, Globe, Download } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, end, duration])

  return <span ref={ref}>{count}</span>
}

export function HeroSection() {
  const { t } = useLanguage()

  const stats = [
    { value: 5, label: t.hero.stats.certifications },
    { value: 8, label: t.hero.stats.projects },   // ✅ mis à jour : 8 projets
    { value: 3, label: t.hero.stats.languages },
    { value: 1, label: t.hero.stats.passion },
  ]

  return (
    <section id="accueil" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      {/* Background blobs — clippés par overflow-hidden */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <div className="absolute top-1/4 left-0 w-48 h-48 md:w-64 md:h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-0 w-48 h-48 md:w-64 md:h-64 bg-secondary/20 rounded-full blur-3xl translate-x-1/2" />

      <div className="w-full max-w-4xl mx-auto px-5 sm:px-8 py-10 md:py-20 relative z-10">
        <div className="flex flex-col items-center text-center gap-6 md:gap-8">

          {/* Titre */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="text-foreground">{t.hero.greeting}</span>
              <br />
              <span className="text-primary">Obed</span>
            </h1>
          </motion.div>

          {/* Role + Location */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              <span className="text-base md:text-xl font-medium text-primary">{t.hero.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="text-base md:text-xl font-medium text-muted-foreground">{t.hero.location}</span>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-4 gap-4 md:gap-12 w-full max-w-sm md:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary block">
                  <AnimatedCounter end={stat.value} />
                </span>
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Boutons CTA */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 neon-cyan w-full sm:w-auto px-6"
              asChild
            >
              <a href="#projets">
                <ExternalLink className="w-4 h-4 mr-2" />
                {t.hero.cta.projects}
              </a>
            </Button>
            <Button
              size="lg"
              className="bg-secondary text-white hover:bg-secondary/90 neon-violet w-full sm:w-auto px-6"
              asChild
            >
              <a href="#contact">
                <Mail className="w-4 h-4 mr-2" />
                {t.hero.cta.contact}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border text-foreground hover:border-primary hover:text-primary w-full sm:w-auto px-6"
              asChild
            >
              <a href="/cvobed.pdf" download="CV_AGBEBAVI_Elom_Obed.pdf">
                <Download className="w-4 h-4 mr-2" />
                CV
              </a>
            </Button>
          </motion.div>

        </div>

        {/* Scroll indicator */}
        <motion.div
          className="flex justify-center mt-10 md:mt-16"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-5 h-5 text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  )
}
