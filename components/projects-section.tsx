"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const projectsData = [
  {
    stack: ["Next.js", "Django", "Leaflet", "PostgreSQL"],
    statusColor: "bg-green-500/20 text-green-400 border-green-500/30",
    statusKey: "Terminé" as const,
    images: [
      "/images/gestion-patrimoine-hero.png",
      "/images/gestion-patrimoine-map.png",
      "/images/gestion-patrimoine-add.png",
      "/images/gestion-patrimoine-pdf.png",
    ],
    links: { demo: "https://gestion-patrimoine-b3hj.onrender.com/#", github: "https://github.com/obedelom17/Gestion-Patrimoine.git" },
  },
  {
    stack: ["Next.js", "Supabase", "Vercel", "Git"],
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    statusKey: "En cours" as const,
    images: ["/images/obistyle-hero.png", "/images/obistyle-admin.png"],
    links: { demo: "https://obistyle.vercel.app/", github: "https://github.com/obedelom17/obistyle.git" },
  },
  {
    stack: ["Java Swing", "Java Backend", "Architecture MVC"],
    statusColor: "bg-secondary/20 text-secondary border-secondary/30",
    statusKey: "Projet académique" as const,
    images: ["/images/restau-dashboard.png", "/images/restau-stats.png"],
    links: { demo: undefined, github: "https://github.com/obedelom17/TPPOOJAVA.git" },
  },
  {
    stack: ["React", "Groq API", "Vite", "Vercel"],
    statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    statusKey: "En cours" as const,
    images: ["/images/obedgpt-hero.png"],
    links: { demo: "https://obedgpt.vercel.app/", github: "https://github.com/obedelom17/obedgpt.git" },
  },
  {
    // 🍯 HoneyPot avec Cowrie
    // Remplace /images/honeypot-hero.png par une vraie capture d'écran quand tu en as une
    stack: ["Cowrie", "Linux", "Python", "Kali Linux"],
    statusColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    statusKey: "Cybersécurité" as const,
    images: ["/images/honeypot-hero.png"],
    links: { demo: undefined, github: undefined },
  },
  {
    stack: ["React", "TypeScript", "Groq API", "Vercel"],
    statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    statusKey: "Production" as const,
    images: ["/images/1783025811861_image.png"],
    links: { demo: "https://elomfacture.vercel.app", github: "https://github.com/obedelom17/elomfacture.git" },
  },
  {
    stack: ["React", "TypeScript", "Supabase", "Vercel"],
    statusColor: "bg-green-500/20 text-green-400 border-green-500/30",
    statusKey: "Production" as const,
    images: ["/images/1783025828459_image.png"],
    links: { demo: "https://elompaie.vercel.app", github: "https://github.com/obedelom17/elompaie.git" },
  },
  {
    stack: ["Next.js", "React", "Tailwind CSS", "Vercel"],
    statusColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    statusKey: "Production" as const,
    images: ["/images/1783025858268_image.png"],
    links: { demo: "https://lesdelicesdenorbert.vercel.app", github: "https://github.com/obedelom17/lesdelicesdenorbert.git" },
  },
]

function ProjectCarousel({
  images,
  title,
  onZoom,
}: {
  images: string[]
  title: string
  onZoom: (index: number) => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const next = () => setCurrentIndex((p) => (p + 1) % images.length)
  const prev = () => setCurrentIndex((p) => (p - 1 + images.length) % images.length)

  return (
    <div className="relative h-48 overflow-hidden group/carousel">
      <Image
        src={images[currentIndex]}
        alt={`${title} - ${currentIndex + 1}`}
        fill
        className="object-cover object-top transition-all duration-300"
      />

      {/* Overlay zoom au survol */}
      <div
        className="absolute inset-0 bg-black/0 group-hover/carousel:bg-black/30 transition-all duration-300 flex items-center justify-center cursor-zoom-in"
        onClick={() => onZoom(currentIndex)}
      >
        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300" />
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-1 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? "bg-primary" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function ProjectsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const { t } = useLanguage()
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  const openLightbox = (images: string[], index: number) => setLightbox({ images, index })
  const closeLightbox = () => setLightbox(null)
  const lightboxNext = () => setLightbox((l) => l ? { ...l, index: (l.index + 1) % l.images.length } : null)
  const lightboxPrev = () => setLightbox((l) => l ? { ...l, index: (l.index - 1 + l.images.length) % l.images.length } : null)

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
            {t.projects.title} <span className="text-primary">{t.projects.titleHighlight}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {t.projects.items.map((project, index) => {
            const data = projectsData[index]
            return (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden group h-full">
                  <div className="relative">
                    <ProjectCarousel
                      images={data.images}
                      title={project.title}
                      onZoom={(imgIndex) => openLightbox(data.images, imgIndex)}
                    />
                    <Badge variant="outline" className={`absolute top-4 right-4 ${data.statusColor}`}>
                      {t.projects.status[data.statusKey]}
                    </Badge>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.features.map((feature) => (
                        <span key={feature} className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {data.stack.map((tech) => (
                        <Badge key={tech} variant="outline" className="border-primary/30 text-primary bg-primary/10">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      {data.links?.demo && (
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 neon-cyan" asChild>
                          <a href={data.links.demo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t.projects.viewDemo}
                          </a>
                        </Button>
                      )}
                      {data.links?.github && (
                        <Button size="sm" variant="outline" className="border-muted-foreground/30" asChild>
                          <a href={data.links.github} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4 mr-2" />
                            {t.projects.viewCode}
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Bouton fermer */}
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Image */}
            <div className="relative w-full h-[70vh]">
              <Image
                src={lightbox.images[lightbox.index]}
                alt={`Image ${lightbox.index + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation lightbox */}
            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={lightboxPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={lightboxNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
                <div className="flex justify-center gap-2 mt-4">
                  {lightbox.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setLightbox((l) => l ? { ...l, index: idx } : null)}
                      className={`w-2 h-2 rounded-full transition-colors ${idx === lightbox.index ? "bg-primary" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
