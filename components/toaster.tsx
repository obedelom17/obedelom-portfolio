"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"

type Item = { id: number; message: string }

/** Notifications éphémères en bas de l'écran. Déclenchées par `toast()` de lib/toast.ts. */
export function Toaster() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let n = 0
    const onToast = (e: Event) => {
      const message = String((e as CustomEvent).detail ?? "")
      if (!message) return
      const id = ++n
      setItems((list) => [...list.slice(-2), { id, message }])
      window.setTimeout(() => setItems((list) => list.filter((i) => i.id !== id)), 2600)
    }
    window.addEventListener("app-toast", onToast)
    return () => window.removeEventListener("app-toast", onToast)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[95] md:bottom-24 flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((i) => (
        <div
          key={i.id}
          className="toast-in flex items-center gap-3 border border-line bg-bg px-4 py-3 text-sm shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]"
        >
          <span className="bg-grad flex h-5 w-5 items-center justify-center rounded-full text-white">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          {i.message}
        </div>
      ))}
    </div>
  )
}
