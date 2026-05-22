"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Award, Globe, Laptop, Smartphone } from "lucide-react"

interface Certification {
  title: string
  year: string
  icon: React.ComponentType<{ className?: string }>
}

const certifications: Certification[] = [
  {
    title: "Cisco CCNA 1 – Introduction to Networks",
    year: "2024",
    icon: Shield,
  },
  {
    title: "Cisco CCNA 2 – Switching, Routing & Wireless Essentials",
    year: "2025",
    icon: Shield,
  },
  {
    title: "English Language Certificate – Youth Level 1",
    year: "2024",
    icon: Globe,
  },
  {
    title: "Utilisation d'ordinateurs et équipements mobiles",
    year: "2024",
    icon: Laptop,
  },
  {
    title: "Sensibilisation au numérique",
    year: "2024",
    icon: Smartphone,
  },
]

export function CertificationsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

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
            Mes <span className="text-secondary">Certifications</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-secondary to-primary mx-auto rounded-full" />
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card border-border hover:border-secondary/50 transition-all duration-300 h-full group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                      <cert.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2 leading-tight">
                        {cert.title}
                      </h3>
                      <span className="text-sm text-muted-foreground">{cert.year}</span>
                    </div>
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
