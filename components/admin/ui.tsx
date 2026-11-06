"use client"

import { useRef, useState, type ReactNode } from "react"
import { ImagePlus, Loader2, Play, Upload, X } from "lucide-react"
import { VIDEO_CHUNK, VIDEO_MAX, isVideoUrl } from "@/lib/video"
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

// Noms et tailles des vidéos importées pendant cette session (pour l'affichage dans la liste).
const videoLabels = new Map<string, string>()

async function post(url: string, body: unknown): Promise<Response> {
  return fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
}

/** Image de la vidéo (vers 1 s), compressée en WebP et envoyée comme les autres images : sert de vignette. */
async function capturePoster(file: File): Promise<string | null> {
  const src = URL.createObjectURL(file)
  try {
    const v = document.createElement("video")
    v.muted = true
    v.playsInline = true
    v.preload = "auto"
    v.src = src
    await new Promise<void>((ok, ko) => {
      v.onloadeddata = () => ok()
      v.onerror = () => ko(new Error("lecture"))
    })
    v.currentTime = Math.min(1, (v.duration || 2) * 0.1)
    await new Promise<void>((ok) => {
      v.onseeked = () => ok()
    })
    const scale = Math.min(1, 960 / (v.videoWidth || 960))
    const cv = document.createElement("canvas")
    cv.width = Math.round((v.videoWidth || 960) * scale)
    cv.height = Math.round((v.videoHeight || 540) * scale)
    cv.getContext("2d")?.drawImage(v, 0, 0, cv.width, cv.height)
    const blob = await new Promise<Blob | null>((ok) => cv.toBlob(ok, "image/webp", 0.8))
    if (!blob) return null
    const data = (await toBase64(blob)).split(",")[1]
    const res = await post("/api/admin/upload", { data })
    if (!res.ok) return null
    return ((await res.json()) as { url: string }).url
  } catch {
    return null
  } finally {
    URL.revokeObjectURL(src)
  }
}

export function VideoField({
  videos,
  onChange,
  label,
}: {
  videos: string[]
  onChange: (next: string[]) => void
  label: string
}) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [stage, setStage] = useState("")
  const file = useRef<HTMLInputElement>(null)
  const latest = useRef(videos)
  latest.current = videos

  const add = () => {
    const v = url.trim()
    if (!v) return
    if (!/^(https?:\/\/|\/)/i.test(v)) {
      setError("Le lien doit commencer par https:// ou par / (fichier du dossier public).")
      return
    }
    setError(null)
    onChange([...videos, v])
    setUrl("")
  }

  /** Envoie la vidéo choisie sur l'ordinateur, par morceaux de 2 Mo, puis l'ajoute à la liste. */
  const upload = async (f: File) => {
    setError(null)
    if (!f.type.startsWith("video/")) return setError("Ce fichier n'est pas une vidéo.")
    if (f.size > VIDEO_MAX) {
      return setError(`Vidéo trop lourde (${(f.size / 1048576).toFixed(0)} Mo). Maximum : ${VIDEO_MAX / 1048576} Mo. Compresse-la (HandBrake, 720p) ou utilise un lien YouTube.`)
    }
    setProgress(0)
    setStage("Préparation…")
    let id = ""
    try {
      const start = await post("/api/admin/video", { op: "start", type: f.type, size: f.size })
      if (!start.ok) throw new Error(start.status === 413 ? "Vidéo trop lourde." : "Démarrage de l'envoi impossible.")
      id = ((await start.json()) as { id: string }).id
      const total = Math.ceil(f.size / VIDEO_CHUNK)
      setStage("Envoi de la vidéo…")
      for (let i = 0; i < total; i++) {
        const data = (await toBase64(f.slice(i * VIDEO_CHUNK, (i + 1) * VIDEO_CHUNK))).split(",")[1]
        let ok = false
        for (let attempt = 0; attempt < 3 && !ok; attempt++) {
          const r = await post("/api/admin/video", { op: "chunk", id, index: i, data }).catch(() => null)
          ok = !!r?.ok
          if (!ok) await new Promise((res) => setTimeout(res, 600 * (attempt + 1)))
        }
        if (!ok) throw new Error("Connexion interrompue pendant l'envoi.")
        setProgress(Math.round(((i + 1) / total) * 92))
      }
      const fin = await post("/api/admin/video", { op: "finish", id })
      if (!fin.ok) throw new Error("La vidéo est incomplète, réessaie.")
      const { url: base } = (await fin.json()) as { url: string }
      setStage("Création de la vignette…")
      const poster = await capturePoster(f)
      setProgress(100)
      const finalUrl = poster ? `${base}?poster=${encodeURIComponent(poster)}` : base
      videoLabels.set(finalUrl, `${f.name} · ${(f.size / 1048576).toFixed(1)} Mo`)
      onChange([...latest.current, finalUrl])
    } catch (e) {
      if (id) void post("/api/admin/video", { op: "abort", id })
      setError(e instanceof Error ? e.message : "Envoi impossible.")
    } finally {
      setProgress(null)
      setStage("")
      if (file.current) file.current.value = ""
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      {videos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {videos.map((src, i) => (
            <li key={src + i} className="flex items-center gap-3 border border-line px-3 py-2 text-sm">
              <Play className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{isVideoUrl(src) ? (videoLabels.get(src) ?? "Vidéo importée depuis l'ordinateur") : src}</span>
              {i === 0 && <span className="label shrink-0 text-accent">En premier</span>}
              <button
                type="button"
                onClick={() => onChange(videos.filter((_, j) => j !== i))}
                aria-label="Retirer la vidéo"
                className="shrink-0 p-1 text-muted hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={file}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/ogg,video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void upload(f)
          }}
        />
        <Button variant="outline" onClick={() => file.current?.click()} disabled={progress !== null}>
          {progress !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Importer depuis mon ordinateur
        </Button>
      </div>
      {progress !== null && (
        <div className="mt-3" role="status" aria-live="polite">
          <div className="h-1.5 w-full overflow-hidden bg-line">
            <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <span className="mt-1 block text-xs text-muted">
            {stage} {progress}%
          </span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              add()
            }
          }}
          placeholder="https://... ou /videos/demo.mp4"
          className="field min-w-0 flex-1"
        />
        <Button variant="outline" onClick={add} disabled={!url.trim()}>
          Ajouter
        </Button>
      </div>
      <span className="mt-2 block text-xs text-muted">
        Importe un fichier de ton ordinateur (.mp4, .webm, .mov, 80 Mo maximum : pense à le compresser en 720p), ou
        colle un lien YouTube / Vimeo / fichier direct, ou un fichier du dossier public (/videos/demo.mp4). Les vidéos
        s'affichent avant les captures d'écran ; la première démarre automatiquement, sans le son. Pense à enregistrer
        le projet après l'import.
      </span>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
