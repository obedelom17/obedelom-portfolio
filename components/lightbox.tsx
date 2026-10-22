"use client"

import { useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export function Lightbox({
  images,
  index,
  alt,
  onChange,
  onClose,
}: {
  images: string[]
  index: number
  alt: string
  onChange: (i: number) => void
  onClose: () => void
}) {
  const prev = useCallback(() => onChange((index - 1 + images.length) % images.length), [index, images.length, onChange])
  const next = useCallback(() => onChange((index + 1) % images.length), [index, images.length, onChange])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [prev, next, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 p-2 text-white/80 hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prev()
            }}
            aria-label="Précédent"
            className="absolute left-2 p-3 text-white/80 hover:text-white sm:left-6"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              next()
            }}
            aria-label="Suivant"
            className="absolute right-2 p-3 text-white/80 hover:text-white sm:right-6"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index]}
        alt={`${alt} ${index + 1}`}
        className="max-h-[88vh] max-w-full object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <p className="label absolute bottom-4 text-white/70">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  )
}
