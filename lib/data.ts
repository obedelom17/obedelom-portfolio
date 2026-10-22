import projects from "@/data/projects.json"
import certifications from "@/data/certifications.json"
import journey from "@/data/journey.json"
import { dbEnabled, readCollection } from "./content"
import { sortCertifications, sortJourney, sortProjects } from "./sort"
import type { Certification, JourneyItem, PortfolioData, Project } from "./types"

export async function getPortfolioData(): Promise<PortfolioData> {
  const fallback: PortfolioData = {
    projects: sortProjects(projects as unknown as Project[]),
    certifications: sortCertifications(certifications as unknown as Certification[]),
    journey: sortJourney(journey as unknown as JourneyItem[]),
  }
  if (!dbEnabled()) return fallback

  try {
    const [p, c, j] = await Promise.all([
      readCollection<Project>("projects"),
      readCollection<Certification>("certifications"),
      readCollection<JourneyItem>("journey"),
    ])
    if (!p.length && !c.length && !j.length) return fallback
    return {
      projects: sortProjects(p),
      certifications: sortCertifications(c),
      journey: sortJourney(j),
    }
  } catch {
    return fallback
  }
}
