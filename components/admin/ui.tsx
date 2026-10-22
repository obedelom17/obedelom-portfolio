"use client"

import { useRef, useState, type ReactNode } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import { getBrowserSupabase, STORAGE_BUCKET } from "@/lib/supabase"
import { compressToWebp, slugify } from "@/lib/image"

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
  folder,
  images,
  onChange,
  multiple,
  label,
}: {
  folder: string
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
    const supabase = getBrowserSupabase()
    if (!supabase) return
    setBusy(true)
    setError(null)
    try {
      const added: string[] = []
      for (const file of Array.from(files)) {
        const blob = await compressToWebp(file)
        const path = `${folder}/${Date.now()}-${slugify(file.name)}.webp`
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, blob, { contentType: "image/webp", upsert: false })
        if (upErr) throw upErr
        added.push(supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl)
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
              <img src={src} alt="" className="h-20 w-28 border border-line object-cover object-top" />
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
