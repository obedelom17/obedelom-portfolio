"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Github, Mail, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react"
import emailjs from "@emailjs/browser"
import { useLanguage } from "@/contexts/language-context"

// Icône WhatsApp SVG inline (pas de dépendance externe)
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export function ContactSection() {
  const ref = useRef(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const { t } = useLanguage()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current) return
    setStatus("loading")

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      )
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <section id="contact" className="py-20 md:py-32" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.contact.title} <span className="text-primary">{t.contact.titleHighlight}</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-6 md:p-8">
                {status === "success" ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {t.contact.form.successTitle}
                    </h3>
                    <p className="text-muted-foreground">{t.contact.form.successDesc}</p>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-foreground">{t.contact.form.name}</Label>
                      <Input
                        id="name"
                        name="from_name"
                        placeholder={t.contact.form.namePlaceholder}
                        required
                        className="mt-2 bg-input border-border focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-foreground">{t.contact.form.email}</Label>
                      <Input
                        id="email"
                        name="reply_to"
                        type="email"
                        placeholder={t.contact.form.emailPlaceholder}
                        required
                        className="mt-2 bg-input border-border focus:border-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="message" className="text-foreground">{t.contact.form.message}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder={t.contact.form.messagePlaceholder}
                        required
                        rows={5}
                        className="mt-2 bg-input border-border focus:border-primary resize-none"
                      />
                    </div>

                    {status === "error" && (
                      <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {t.contact.form.errorDesc}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 neon-cyan"
                    >
                      {status === "loading" ? (
                        t.contact.form.sending
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t.contact.form.send}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-bold text-foreground mb-6">{t.contact.info.title}</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t.contact.info.description}
              </p>
            </div>

            <div className="space-y-4">
              {/* Email */}
              <a
                href="mailto:agbebaviobedelom@gmail.com"
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">agbebaviobedelom@gmail.com</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/22897459518"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-green-500/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <WhatsAppIcon className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="text-foreground font-medium">{t.contact.info.whatsapp}</p>
                </div>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com/obedelom17"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-secondary/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <Github className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">GitHub</p>
                  <p className="text-foreground font-medium">github.com/obedelom17</p>
                </div>
              </a>

              {/* Localisation */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localisation</p>
                  <p className="text-foreground font-medium">{t.contact.info.location}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
