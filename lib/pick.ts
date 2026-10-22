import type { Lang } from "./types"

export function pick(lang: Lang, fr: string | null | undefined, en: string | null | undefined) {
  const primary = lang === "fr" ? fr : en
  const secondary = lang === "fr" ? en : fr
  return (primary && primary.trim()) || (secondary && secondary.trim()) || ""
}

export function pickList(lang: Lang, fr: string[] | null | undefined, en: string[] | null | undefined) {
  const primary = lang === "fr" ? fr : en
  const secondary = lang === "fr" ? en : fr
  return primary && primary.length ? primary : secondary ?? []
}
