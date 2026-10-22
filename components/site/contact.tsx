"use client"

import { useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import emailjs from "@emailjs/browser"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Section } from "./section"

const EMAIL = "agbebaviobedelom@gmail.com"

export function Contact() {
  const { t } = useApp()
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const f = t.contact.form

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current) return
    setStatus("loading")
    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      )
      setStatus("success")
    } catch {
      setStatus("error")
    }
  }

  return (
    <Section id="contact" index="07" label={t.contact.label}>
      <Reveal>
        <h2 className="font-serif text-4xl leading-[1.02] md:text-6xl">{t.contact.title}</h2>
        <p className="mt-6 max-w-lg text-muted">{t.contact.text}</p>
        <a
          href={`mailto:${EMAIL}`}
          className="link-underline mt-8 inline-block break-all pb-1 font-serif text-2xl md:text-3xl"
        >
          {EMAIL}
        </a>
      </Reveal>

      <div className="mt-16 grid gap-14 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {status === "success" ? (
            <div className="border-t border-fg pt-6">
              <h3 className="font-serif text-3xl">{f.successTitle}</h3>
              <p className="mt-3 text-muted">{f.successText}</p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
              <div>
                <label htmlFor="from_name" className="label">
                  {f.name}
                </label>
                <input id="from_name" name="from_name" required placeholder={f.namePlaceholder} className="field" />
              </div>
              <div>
                <label htmlFor="reply_to" className="label">
                  {f.email}
                </label>
                <input
                  id="reply_to"
                  name="reply_to"
                  type="email"
                  required
                  placeholder={f.emailPlaceholder}
                  className="field"
                />
              </div>
              <div>
                <label htmlFor="message" className="label">
                  {f.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder={f.messagePlaceholder}
                  className="field resize-none"
                />
              </div>
              {status === "error" && (
                <p role="alert" className="border-l-2 border-red-700 pl-3 text-sm text-red-700">
                  {f.error}
                </p>
              )}
              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-fg px-8 py-3 text-sm font-medium text-bg transition-colors hover:bg-accent-hover hover:text-accent-fg disabled:opacity-60"
              >
                {status === "loading" ? f.sending : f.send}
              </button>
            </form>
          )}
        </div>

        <dl className="space-y-6 lg:col-span-2">
          <div className="border-t border-line pt-4">
            <dt className="label">WhatsApp</dt>
            <dd className="mt-2">
              <a
                href="https://wa.me/22897459518"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline inline-flex items-center gap-1 pb-0.5"
              >
                +228 97 45 95 18
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </dd>
          </div>
          <div className="border-t border-line pt-4">
            <dt className="label">GitHub</dt>
            <dd className="mt-2">
              <a
                href="https://github.com/obedelom17"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline inline-flex items-center gap-1 pb-0.5"
              >
                github.com/obedelom17
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </dd>
          </div>
          <div className="border-t border-line pt-4">
            <dt className="label">{t.contact.location}</dt>
            <dd className="mt-2">Lomé, Togo</dd>
          </div>
        </dl>
      </div>
    </Section>
  )
}
