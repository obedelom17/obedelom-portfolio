import type { Certification, JourneyItem, Project } from "./types"

export function sortProjects(rows: Project[]) {
  return [...rows].sort((a, b) => b.sort_order - a.sort_order)
}

export function sortCertifications(rows: Certification[]) {
  return [...rows].sort((a, b) => b.sort_order - a.sort_order)
}

export function sortJourney(rows: JourneyItem[]) {
  return [...rows].sort((a, b) => {
    if (a.year !== b.year) return b.year.localeCompare(a.year)
    return b.sort_order - a.sort_order
  })
}
