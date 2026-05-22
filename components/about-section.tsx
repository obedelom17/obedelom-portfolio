"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, Globe, Palette, Laptop, Code2, Sparkles } from "lucide-react"

const badges = [
  { label: "BAC D", icon: BookOpen },
  { label: "CCNA 1&2", icon: Globe },
  { label: "Photoshop", icon: Palette },
  { label: "Numerique", icon: Laptop },
  { label: "English Cert.", icon: Award },
]

const skills = [
  { icon: Code2, title: "Developpement", desc: "Full-Stack Web & Mobile" },
  { icon: Palette, title: "Design", desc: "UI/UX & Graphisme" },
  { icon: Sparkles, title: "Passion", desc: "Innovation & Creativite" },
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
            <span className="text-primary">A propos</span> de moi
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Main description */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Etudiant en <span className="text-primary font-semibold">Genie Logiciel</span> a
              l&apos;IAI-Togo, je combine developpement full-stack et creativite graphique pour
              creer des solutions numeriques completes. Passionne par le web, le mobile et le
              design visuel, je maitrise aussi bien le code que{" "}
              <span className="text-secondary font-semibold">Photoshop</span>.
            </p>
          </motion.div>

          {/* Skills cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {skills.map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <skill.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{skill.title}</h3>
                <p className="text-sm text-muted-foreground">{skill.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-3"
          >
            {badges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}
