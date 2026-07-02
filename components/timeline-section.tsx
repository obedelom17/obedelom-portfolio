"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { GraduationCap, Award, Code, Rocket, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const timelineIcons = [
  GraduationCap, // BAC D
  Award,         // Entrée IAI-Togo
  GraduationCap, // CCNA 1
  Award,         // CCNA 2
  Code,          // RestauManager
  Rocket,        // ObiStyle
  Rocket,        // Gestion Patrimoine
  Shield,        // HoneyPot Cowrie ← ajouté
  GraduationCap, // 2ème année IAI
]

const timelineColors: Array<"primary" | "secondary"> = [
  "primary",
  "secondary",
  "primary",
  "secondary",
  "primary",
  "secondary",
  "primary",
  "secondary", // HoneyPot ← ajouté
  "primary",
]

export function TimelineSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t } = useLanguage()

  return (
    <section id="parcours" className="py-20 md:py-32" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.timeline.title} <span className="text-primary">{t.timeline.titleHighlight}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary" />

          {t.timeline.items.map((item, index) => {
            const Icon = timelineIcons[index]
            const color = timelineColors[index]
            return (
              <motion.div
                key={`${item.year}-${item.title}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative flex items-center mb-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
              >
                <div className={`ml-20 md:ml-0 md:w-1/2 ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${color === "primary" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                    {item.year}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>

                <div className={`absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${color === "primary" ? "bg-primary neon-cyan" : "bg-secondary neon-violet"}`}>
                  <Icon className="w-4 h-4 text-background" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
