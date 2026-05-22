"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

interface Project {
  title: string
  description: string
  stack: string[]
  status: string
  statusColor: string
  features: string[]
  links?: {
    demo?: string
    github?: string
  }
}

const projects: Project[] = [
  {
    title: "ObiStyle",
    description:
      "Site e-commerce élégant de vêtements et pagnes africains. Interface boutique moderne avec panel admin, authentification, panier et livraison mondiale. Design mobile-first.",
    stack: ["Next.js", "Supabase", "Vercel", "Git"],
    status: "En cours",
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    features: [
      "Homepage élégante",
      "Panel Admin",
      "Authentification",
      "Panier & Livraison",
    ],
    links: {
      github: "https://github.com/obedelom17",
    },
  },
  {
    title: "RestauManager",
    description:
      "Application desktop de gestion de restaurant. Dashboard avec KPIs (total produits, stock faible, revenus), gestion des catégories, stocks et commandes avec statistiques par période.",
    stack: ["Java Swing", "Java Backend", "Architecture MVC"],
    status: "Projet académique",
    statusColor: "bg-secondary/20 text-secondary border-secondary/30",
    features: [
      "Dashboard KPIs",
      "Gestion Stocks",
      "Alertes Stock Faible",
      "Statistiques",
    ],
  },
]

export function ProjectsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="projets" className="py-20 md:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mes <span className="text-primary">Projets</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group h-full">
                {/* Project Image Placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {project.title}
                  </div>
                  <Badge
                    variant="outline"
                    className={`absolute top-4 right-4 ${project.statusColor}`}
                  >
                    {project.status}
                  </Badge>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.stack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="border-primary/30 text-primary bg-primary/10"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-3">
                    {project.links?.demo && (
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        asChild
                      >
                        <a
                          href={project.links.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir le projet
                        </a>
                      </Button>
                    )}
                    {project.links?.github && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-muted-foreground/30"
                        asChild
                      >
                        <a
                          href={project.links.github}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
