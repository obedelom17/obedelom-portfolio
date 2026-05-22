"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowDown, ExternalLink, Mail, Code2, Palette, Globe } from "lucide-react"

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
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [isInView, end, duration])

  return <span ref={ref}>{count}</span>
}

const stats = [
  { value: 5, label: "certifications" },
  { value: 2, label: "projets" },
  { value: 3, label: "langues" },
  { value: 1, label: "passion" },
]

const highlights = [
  { icon: Code2, label: "Full-Stack", color: "text-primary" },
  { icon: Palette, label: "Designer", color: "text-secondary" },
  { icon: Globe, label: "Lomé, Togo", color: "text-muted-foreground" },
]

export function HeroSection() {
  return (
    <section
      id="accueil"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-foreground">Bonjour, je suis</span>
              <br />
              <span className="text-primary text-glow-cyan">Obed</span>
              <span className="ml-3">👋</span>
            </motion.h1>

            {/* Highlights */}
            <motion.div
              className="flex flex-wrap justify-center gap-6 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className={`text-lg md:text-xl font-medium ${item.color}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 md:gap-12 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    <AnimatedCounter end={stat.value} />
                  </span>
                  <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 neon-cyan px-8"
                asChild
              >
                <a href="#projets">
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Voir mes projets
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground px-8"
                asChild
              >
                <a href="#contact">
                  <Mail className="w-5 h-5 mr-2" />
                  Me contacter
                </a>
              </Button>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              className="mt-12 flex justify-center gap-4 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <motion.div
                className="bg-card border border-border rounded-full px-5 py-2 text-sm"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              >
                <span className="text-primary">IAI-Togo</span>
              </motion.div>
              <motion.div
                className="bg-card border border-border rounded-full px-5 py-2 text-sm"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.5 }}
              >
                <span className="text-secondary">Genie Logiciel</span>
              </motion.div>
              <motion.div
                className="bg-card border border-border rounded-full px-5 py-2 text-sm"
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 1 }}
              >
                <span className="text-foreground">Full-Stack</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  )
}
