"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Palette, ZoomIn, X } from "lucide-react"

const designs = [
  {
    title: "Flyer Burger Fast-food",
    description: "Fond jaune/orange, visuels appétissants, prix FCFA",
    color: "from-yellow-500/20 to-orange-500/20",
  },
  {
    title: "Carte de visite Boutique Bio",
    description: "Mockup rouge bordeaux/jaune, format professionnel",
    color: "from-red-800/20 to-yellow-600/20",
  },
  {
    title: "Flyer Activités C.A.S MathFinEco School",
    description: "Fond sport rouge, typographie dynamique",
    color: "from-red-500/20 to-red-700/20",
  },
]

export function DesignSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedDesign, setSelectedDesign] = useState<number | null>(null)

  return (
    <section id="design" className="py-20 md:py-32 bg-card/50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Créations <span className="text-secondary">Graphiques</span>
          </h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Palette className="w-5 h-5 text-secondary" />
            Adobe Photoshop
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-secondary to-primary mx-auto rounded-full mt-4" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design, index) => (
            <motion.div
              key={design.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group cursor-pointer"
              onClick={() => setSelectedDesign(index)}
            >
              <div className="relative overflow-hidden rounded-xl border border-border hover:border-secondary/50 transition-all duration-300">
                {/* Design Preview */}
                <div
                  className={`aspect-[4/3] bg-gradient-to-br ${design.color} flex items-center justify-center relative`}
                >
                  <div className="text-center p-6">
                    <Palette className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-semibold text-foreground">{design.title}</p>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ZoomIn className="w-10 h-10 text-secondary-foreground" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-card">
                  <h3 className="font-semibold text-foreground mb-1 text-sm">
                    {design.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{design.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedDesign !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDesign(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-3xl w-full"
          >
            <button
              onClick={() => setSelectedDesign(null)}
              className="absolute -top-12 right-0 text-foreground hover:text-primary transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div
              className={`aspect-[4/3] bg-gradient-to-br ${designs[selectedDesign].color} rounded-xl flex items-center justify-center`}
            >
              <div className="text-center p-8">
                <Palette className="w-20 h-20 text-secondary mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {designs[selectedDesign].title}
                </h3>
                <p className="text-muted-foreground">
                  {designs[selectedDesign].description}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
