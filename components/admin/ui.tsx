"use client"

import { useRef, useState, type ReactNode } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { compressToWebp } from "@/lib/image"

// Aperçus locaux des images téléversées, disponibles avant le redéploiement du site.
const previews = new Map<string, string>()

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"))
    reader.readAsDataURL(blob)
  })
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`field ${props.className ?? ""}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`field resize-y ${props.className ?? ""}`} />
}

export function Button({
  variant = "solid",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "outline" | "danger" }) {
  const styles = {
    solid: "bg-fg text-bg hover:bg-accent-hover hover:text-accent-fg",
    outline: "border border-fg hover:bg-fg hover:text-bg",
    danger: "border border-red-700 text-red-700 hover:bg-red-700 hover:text-white",
  }[variant]
  return (
    <button
      type="button"
      {...props}
      className={`px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${styles} ${className}`}
    />
  )
}

export function ImageField({
  images,
  onChange,
  multiple,
  label,
}: {
  images: string[]
  onChange: (next: string[]) => void
  multiple?: boolean
  label: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState("")

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)
    try {
      const added: string[] = []
      for (const file of Array.from(files)) {
        const blob = await compressToWebp(file)
        const dataUrl = await toBase64(blob)
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: dataUrl.split(",")[1] }),
        })
        const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
        if (!res.ok || !json.url) throw new Error(json.error ?? `Erreur ${res.status}`)
        previews.set(json.url, dataUrl)
        added.push(json.url)
      }
      onChange(multiple ? [...images, ...added] : added.slice(0, 1))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'envoi")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const addUrl = () => {
    const v = url.trim()
    if (!v) return
    onChange(multiple ? [...images, v] : [v])
    setUrl("")
  }

  return (
    <div>
      <span className="label">{label}</span>
      {images.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {images.map((src, i) => (
            <li key={src + i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previews.get(src) ?? src} alt="" className="h-20 w-28 border border-line object-cover object-top" />
              <button
                type="button"
                onClick={() => onChange(images.filter((_, j) => j !== i))}
                aria-label="Retirer l'image"
                className="absolute -right-2 -top-2 bg-fg p-1 text-bg"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          <span className="inline-flex items-center gap-2">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            Téléverser
          </span>
        </Button>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addUrl()
            }
          }}
          placeholder="ou coller une URL d'image"
          className="field min-w-0 flex-1"
        />
        <Button variant="outline" onClick={addUrl} disabled={!url.trim()}>
          Ajouter
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
