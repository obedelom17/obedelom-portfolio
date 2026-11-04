export type MediaItem =
  | { kind: "image"; src: string }
  | {
      kind: "video"
      /** Source d'origine (fichier ou lien de la page vidéo). */
      src: string
      /** Lecteur intégré (YouTube, Vimeo) ; absent pour un fichier vidéo direct. */
      embed?: string
      /** Vignette connue à l'avance (YouTube). */
      poster?: string
    }

function youtubeId(u: URL): string | null {
  const host = u.hostname.replace(/^www\./, "")
  if (host === "youtu.be") return u.pathname.split("/")[1] || null
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") return u.searchParams.get("v")
    const m = u.pathname.match(/^\/(?:embed|shorts|live|v)\/([\w-]{6,})/)
    return m ? m[1] : null
  }
  return null
}

function vimeoRef(u: URL): { id: string; hash: string | null } | null {
  const host = u.hostname.replace(/^www\./, "")
  if (host !== "vimeo.com" && host !== "player.vimeo.com") return null
  const parts = u.pathname.split("/").filter(Boolean)
  const i = parts.findIndex((p) => /^\d{5,}$/.test(p))
  if (i === -1) return null
  const hash = u.searchParams.get("h") ?? (parts[i + 1] && /^[a-z0-9]+$/i.test(parts[i + 1]) ? parts[i + 1] : null)
  return { id: parts[i], hash }
}

/** Transforme un lien de vidéo saisi dans l'administration en élément affichable. */
export function videoItem(url: string): Extract<MediaItem, { kind: "video" }> {
  const src = url.trim()
  let u: URL | null = null
  try {
    u = new URL(src, "https://local.invalid")
  } catch {}

  if (u) {
    const yt = youtubeId(u)
    if (yt) {
      return {
        kind: "video",
        src,
        embed: `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&playsinline=1&rel=0`,
        poster: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
      }
    }
    const vm = vimeoRef(u)
    if (vm) {
      return {
        kind: "video",
        src,
        embed: `https://player.vimeo.com/video/${vm.id}?autoplay=1&muted=1&loop=1&playsinline=1${vm.hash ? `&h=${vm.hash}` : ""}`,
      }
    }
  }
  return { kind: "video", src }
}

/** Les vidéos passent toujours avant les images. */
export function buildMedia(images: string[] | null | undefined, videos: string[] | null | undefined): MediaItem[] {
  const v = (videos ?? []).filter((x) => x && x.trim()).map(videoItem)
  const i = (images ?? []).filter(Boolean).map((src): MediaItem => ({ kind: "image", src }))
  return [...v, ...i]
}

export function isHttpUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value.trim())
}
