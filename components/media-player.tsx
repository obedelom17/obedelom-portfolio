"use client"

import { useEffect, useRef } from "react"
import { Play } from "lucide-react"
import type { MediaItem } from "@/lib/media"

type VideoMedia = Extract<MediaItem, { kind: "video" }>

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
}: {
  item: VideoMedia
  title: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
}) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !autoPlay) return
    el.muted = muted
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [autoPlay, muted])

  if (item.embed) {
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
      autoPlay={autoPlay}
      muted={muted}
      loop
      playsInline
      controls
      preload="metadata"
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
        <img src={item.poster} alt="" className="h-full w-full object-cover" />
      ) : !item.embed ? (
        <video src={`${item.src}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" aria-hidden />
      ) : null}
      <span className="absolute inset-0 flex items-center justify-center bg-black/30">
        <Play className="h-4 w-4 fill-white text-white" />
      </span>
    </span>
  )
}
