"use client"

import { useEffect, useState } from "react"

/** Heure actuelle à Lomé, mise à jour chaque seconde. */
export function LocalTime() {
  const [time, setTime] = useState("")

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Africa/Lome",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return <span className="tabular-nums">{time || "--:--:--"}</span>
}
