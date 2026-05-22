"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { GraduationCap, Award, Code, Rocket } from "lucide-react"

interface TimelineItem {
  year: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: "primary" | "secondary"
}

const timeline: TimelineItem[] = [
  {
    year: "2024",
    title: "BAC D",
    description: "MathFinEco International School",
    icon: GraduationCap,
    color: "primary",
  },
  {
    year: "2024",
    title: "Cisco CCNA 1",
    description: "Introduction to Networks",
    icon: Award,
    color: "secondary",
  },
  {
    year: "2024",
    title: "Entrée à l'IAI-Togo",
    description: "Génie Logiciel",
    icon: GraduationCap,
    color: "primary",
  },
  {
    year: "2025",
    title: "Cisco CCNA 2",
    description: "Switching, Routing & Wireless Essentials",
    icon: Award,
    color: "secondary",
  },
  {
    year: "2025",
    title: "RestauManager",
    description: "Projet académique Java",
    icon: Code,
    color: "primary",
  },
  {
    year: "2025",
    title: "Lancement ObiStyle",
    description: "E-commerce Next.js",
    icon: Rocket,
    color: "secondary",
  },
  {
    year: "2026",
    title: "2ème année IAI-Togo",
    description: "En cours",
    icon: GraduationCap,
    color: "primary",
  },
]

export function TimelineSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

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
            Mon <span className="text-primary">Parcours</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-primary" />

          {timeline.map((item, index) => (
            <motion.div
              key={`${item.year}-${item.title}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`relative flex items-center mb-8 ${
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
            >
              {/* Content */}
              <div
                className={`ml-20 md:ml-0 md:w-1/2 ${
                  index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"
                }`}
              >
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${
                    item.color === "primary"
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/20 text-secondary"
                  }`}
                >
                  {item.year}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>

              {/* Icon */}
              <div
                className={`absolute left-4 md:left-1/2 md:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ${
                  item.color === "primary"
                    ? "bg-primary neon-cyan"
                    : "bg-secondary neon-violet"
                }`}
              >
                <item.icon className="w-4 h-4 text-background" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
