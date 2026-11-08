"use client"

import { useEffect, useRef } from "react"
import { Play } from "lucide-react"
import type { MediaItem } from "@/lib/media"
import { duckMusic } from "@/lib/sound"

type VideoMedia = Extract<MediaItem, { kind: "video" }>

/**
 * Une seule vidéo peut avoir du son à la fois : quand une vidéo devient audible, les autres sont mises en pause.
 * Pendant qu'une vidéo a du son, la musique de fond se tait (et revient ensuite).
 */
const audible = new Set<HTMLVideoElement>()
function refreshAudible(el: HTMLVideoElement) {
  const on = !el.muted && !el.paused && !el.ended && el.volume > 0
  if (on) {
    Array.from(audible).forEach((o) => {
      if (o !== el) o.pause()
    })
    audible.add(el)
  } else audible.delete(el)
  duckMusic(audible.size > 0)
}

/**
 * Lecteur de vidéo qui démarre tout seul.
 * Les navigateurs n'autorisent la lecture automatique que sans le son : la vidéo démarre donc
 * muette, et le visiteur active le son avec les contrôles. Elle se met en pause quand elle
 * sort de l'écran et repart quand elle revient.
 */
export function VideoPlayer({
  item,
  title,
  className = "",
  autoPlay = true,
  muted = true,
  paused = false,
}: {
  item: VideoMedia
  title: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  /** Vrai quand la vidéo est cachée derrière un agrandissement : elle se tait et ne redémarre pas. */
  paused?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  // Suivi du son : une seule vidéo audible à la fois, musique de fond coupée pendant ce temps.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sync = () => refreshAudible(el)
    const events = ["play", "pause", "ended", "volumechange"] as const
    events.forEach((e) => el.addEventListener(e, sync))
    return () => {
      events.forEach((e) => el.removeEventListener(e, sync))
      audible.delete(el)
      duckMusic(audible.size > 0)
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (paused) {
      el.pause()
      return
    }
    if (!autoPlay) return
    el.muted = muted
    const io = new IntersectionObserver(
      ([entry]) => {
        // La lecture ne démarre (et la vidéo ne se télécharge) qu'une fois visible.
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoPlay, muted, paused])

  if (item.embed) {
    // Caché derrière un agrandissement : on retire le lecteur (un lecteur intégré ne peut pas être mis en pause).
    if (paused) return <div className={className} aria-hidden />
    return (
      <iframe
        src={item.embed}
        title={title}
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className={`border-0 ${className}`}
      />
    )
  }

  return (
    <video
      ref={ref}
      src={item.src}
      title={title}
      poster={item.poster}
      muted={muted}
      loop
      playsInline
      controls
      preload={item.poster ? "none" : "metadata"}
      className={className}
    />
  )
}

/** Vignette d'une vidéo dans la bande sous la galerie. */
export function VideoThumb({ item }: { item: VideoMedia }) {
  return (
    <span className="relative block h-full w-full bg-black">
      {item.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.poster} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : !item.embed ? (
        <video src={`${item.src}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" aria-hidden />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
        <Play className="h-4 w-4 fill-white text-white" />
      </span>
    </span>
  )
}
