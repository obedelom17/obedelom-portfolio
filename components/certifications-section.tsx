"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Globe, Laptop, Smartphone, X, ZoomIn } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"

const certImages = [
  "/images/certifications/ccna-presentation-reseaux.png",
  "/images/certifications/ccna-switching-routing.png",
  "/images/certifications/english-language-center.jpg",
  "/images/certifications/utilisation-ordinateurs.png",
  "/images/certifications/sensibilisation-numerique.png",
]
const certIcons = [Shield, Shield, Globe, Laptop, Smartphone]

export function CertificationsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { t } = useLanguage()

  return (
    <section id="certifications" className="py-20 md:py-32 bg-card/50" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.certifications.title} <span className="text-secondary">{t.certifications.titleHighlight}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-secondary to-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.certifications.items.map((cert, index) => {
            const Icon = certIcons[index]
            return (
              <motion.div
                key={cert.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className="bg-card border-border hover:border-secondary/50 transition-all duration-300 h-full group cursor-pointer"
                  onClick={() => setSelectedIndex(index)}
                >
                  <CardContent className="p-0">
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
                      <Image
                        src={certImages[index]}
                        alt={cert.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    <div className="p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                        <Icon className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 leading-tight text-sm">{cert.title}</h3>
                        <span className="text-xs text-muted-foreground">{cert.year}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-3xl w-full bg-card rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="relative w-full h-[60vh]">
              <Image
                src={certImages[selectedIndex]}
                alt={t.certifications.items[selectedIndex].title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-4 flex items-center gap-3 border-t border-border">
              {(() => { const Icon = certIcons[selectedIndex]; return <Icon className="w-5 h-5 text-secondary shrink-0" /> })()}
              <div>
                <p className="font-semibold text-foreground text-sm">{t.certifications.items[selectedIndex].title}</p>
                <p className="text-xs text-muted-foreground">{t.certifications.items[selectedIndex].year}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
