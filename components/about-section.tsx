"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, Globe, Palette, Laptop } from "lucide-react"

const badges = [
  { label: "BAC D", icon: BookOpen },
  { label: "CCNA 1&2", icon: Globe },
  { label: "Photoshop", icon: Palette },
  { label: "Numérique", icon: Laptop },
  { label: "English Cert.", icon: Award },
]

export function AboutSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="apropos" className="py-20 md:py-32 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-primary">À propos</span> de moi
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-30" />
              <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 flex items-center justify-center">
                <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AEO
                </span>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Étudiant en <span className="text-primary font-semibold">Génie Logiciel</span> à
              l&apos;IAI-Togo, je combine développement full-stack et créativité graphique pour
              créer des solutions numériques complètes. Passionné par le web, le mobile et le
              design visuel, je maîtrise aussi bien le code que{" "}
              <span className="text-secondary font-semibold">Photoshop</span>.
            </p>

            <div className="flex flex-wrap gap-3">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <badge.icon className="w-4 h-4 mr-2" />
                    {badge.label}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
