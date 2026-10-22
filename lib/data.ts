import { getServerSupabase } from "./supabase"
import { sortCertifications, sortJourney, sortProjects } from "./sort"
import {
  fallbackCertifications,
  fallbackJourney,
  fallbackProjects,
} from "./seed"
import type { Certification, JourneyItem, PortfolioData, Project } from "./types"

export async function getPortfolioData(): Promise<PortfolioData> {
  const fallback: PortfolioData = {
    projects: sortProjects(fallbackProjects),
    certifications: sortCertifications(fallbackCertifications),
    journey: sortJourney(fallbackJourney),
  }

  const supabase = getServerSupabase()
  if (!supabase) return fallback

  try {
    const [p, c, j] = await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("certifications").select("*"),
      supabase.from("journey").select("*"),
    ])
    if (p.error || c.error || j.error) return fallback

    const projects = (p.data ?? []) as Project[]
    const certifications = (c.data ?? []) as Certification[]
    const journey = (j.data ?? []) as JourneyItem[]

    if (!projects.length && !certifications.length && !journey.length) return fallback

    return {
      projects: sortProjects(projects),
      certifications: sortCertifications(certifications),
      journey: sortJourney(journey),
    }
  } catch {
    return fallback
  }
}
