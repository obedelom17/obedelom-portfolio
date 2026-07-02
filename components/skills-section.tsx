"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Server, Layers, Smartphone, Database, Cloud, Network, Palette } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

type SkillLevel = "Intermédiaire" | "Deb.+" | "Débutant"

const skills = [
  { categoryKey: "Web", icon: Code, items: "HTML, CSS, JavaScript", level: "Intermédiaire" as SkillLevel },
  { categoryKey: "Backend", icon: Server, items: "Python, PHP, Java (POO)", level: "Intermédiaire" as SkillLevel },
  { categoryKey: "Frameworks", icon: Layers, items: "Django, Next.js", level: "Deb.+" as SkillLevel },
  { categoryKey: "Mobile", icon: Smartphone, items: "Flutter, C#", level: "Débutant" as SkillLevel },
  { categoryKey: "Base de données", icon: Database, items: "MySQL, Supabase", level: "Intermédiaire" as SkillLevel },
  { categoryKey: "Déploiement", icon: Cloud, items: "Vercel, Git", level: "Intermédiaire" as SkillLevel },
  { categoryKey: "Réseaux", icon: Network, items: "Cisco CCNA 1 & 2", level: "Intermédiaire" as SkillLevel },
  { categoryKey: "Design", icon: Palette, items: "Adobe Photoshop, Infographie", level: "Intermédiaire" as SkillLevel },
]

const levelColors: Record<SkillLevel, string> = {
  "Intermédiaire": "bg-primary/20 text-primary border-primary/30",
  "Deb.+": "bg-secondary/20 text-secondary border-secondary/30",
  "Débutant": "bg-muted text-muted-foreground border-muted-foreground/30",
}

export function SkillsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t } = useLanguage()

  return (
    <section id="competences" className="py-20 md:py-32 bg-card/50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.skills.title} <span className="text-primary">{t.skills.titleHighlight}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.categoryKey}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 h-full group hover:shadow-lg hover:shadow-primary/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <skill.icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline" className={`text-xs ${levelColors[skill.level]}`}>
                      {t.skills.levels[skill.level]}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {t.skills.categories[skill.categoryKey as keyof typeof t.skills.categories]}
                  </h3>
                  <p className="text-sm text-muted-foreground">{skill.items}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
