"use client"

import { useRef, useState } from "react"
import { ArrowUpRight, Check, Copy, Share2, UserPlus } from "lucide-react"
import emailjs from "@emailjs/browser"
import { useApp } from "@/components/providers"
import { Reveal } from "@/components/reveal"
import { Magnetic } from "@/components/magnetic"
import { SplitWords } from "@/components/split-words"
import { confetti } from "@/lib/confetti"
import { toast } from "@/lib/toast"
import { play } from "@/lib/sound"
import { Section } from "./section"
import { Roll } from "@/components/fx/roll"

const EMAIL = "agbebaviobedelom@gmail.com"

export function Contact({ index = "07" }: { index?: string }) {
  const { t } = useApp()
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const f = t.contact.form
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      toast(t.ui.emailCopied)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const share = async () => {
    const url = window.location.origin
    try {
      if (navigator.share) {
        await navigator.share({ title: t.ui.shareTitle, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast(t.ui.linkCopied)
      }
    } catch {}
  }

  const saveContact = () => {
    const card = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:AGBEBAVI;Elom Obed;;;",
      "FN:AGBEBAVI Elom Obed",
      "TITLE:Ingénieur en informatique",
      "TEL;TYPE=CELL:+22897459518",
      `EMAIL:${EMAIL}`,
      `URL:${window.location.origin}`,
      "ADR;TYPE=WORK:;;;Lomé;;;Togo",
      "END:VCARD",
    ].join("\r\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([card], { type: "text/vcard;charset=utf-8" }))
    a.download = "elom-obed-agbebavi.vcf"
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    toast(t.ui.contactSaved)
  }

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
      const rect = formRef.current?.getBoundingClientRect()
      setStatus("success")
      play("success")
      if (rect) confetti(rect.left + rect.width / 2, rect.top + rect.height / 2)
    } catch {
      setStatus("error")
      play("error")
    }
  }

  return (
    <Section id="contact" index={index} label={t.contact.label} glow grid>
      <Reveal>
        <h2 className="font-serif text-4xl leading-[1.02] md:text-7xl">
          <SplitWords text={t.contact.title} />
        </h2>
        <p className="mt-6 max-w-lg text-muted">{t.contact.text}</p>
        <Magnetic strength={0.3} className="contact-ring mt-10 inline-block">
          <a href={`mailto:${EMAIL}`} aria-label={EMAIL} className="contact-ring__a">
            <svg viewBox="0 0 120 120" className="contact-ring__svg" aria-hidden>
              <defs>
                <path id="contact-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
              </defs>
              <text fontSize="9.5" letterSpacing="3.2" fill="currentColor" style={{ textTransform: "uppercase" }}>
                <textPath href="#contact-circle">{t.ui.ring}</textPath>
              </text>
            </svg>
            <ArrowUpRight className="h-7 w-7" />
          </a>
        </Magnetic>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a href={`mailto:${EMAIL}`} data-cursor={t.ui.write} className="link-underline inline-block break-all pb-1 font-serif text-2xl md:text-3xl">
            {EMAIL}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="label inline-flex items-center gap-2 border border-line px-3 py-2 transition-colors hover:border-fg hover:text-fg"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t.ui.copied : t.ui.copy}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={share}
            className="label inline-flex items-center gap-2 border border-line px-3 py-2 transition-colors hover:border-fg hover:text-fg"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t.ui.share}
          </button>
          <button
            type="button"
            onClick={saveContact}
            className="label inline-flex items-center gap-2 border border-line px-3 py-2 transition-colors hover:border-fg hover:text-fg"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {t.ui.saveContact}
          </button>
        </div>
      </Reveal>

      <div className="mt-16 grid gap-14 lg:grid-cols-5">
        <div className="sd-rise glow-border glow-border--on spot border border-line bg-card p-6 sm:p-10 lg:col-span-3">
          {status === "success" ? (
            <div className="border-t border-fg pt-6">
              <h3 className="font-serif text-3xl">{f.successTitle}</h3>
              <p className="mt-3 text-muted">{f.successText}</p>
            </div>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} className="space-y-8">
              <div className="field-wrap">
                <label htmlFor="from_name" className="label">
                  {f.name}
                </label>
                <input id="from_name" name="from_name" required placeholder={f.namePlaceholder} className="field" />
              </div>
              <div className="field-wrap">
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
              <div className="field-wrap">
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
              <Magnetic>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-grad roll-host inline-flex items-center gap-3 bg-fg px-8 py-4 text-sm font-medium text-bg disabled:opacity-60"
                >
                  <Roll text={status === "loading" ? f.sending : f.send} />
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </Magnetic>
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
