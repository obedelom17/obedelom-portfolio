import projects from "@/data/projects.json"
import certifications from "@/data/certifications.json"
import journey from "@/data/journey.json"
import internships from "@/data/internships.json"
import { dbEnabled, readCollection } from "./content"
import { sortCertifications, sortInternships, sortJourney, sortProjects } from "./sort"
import type { Certification, Internship, JourneyItem, PortfolioData, Project } from "./types"

export async function getPortfolioData(): Promise<PortfolioData> {
  const fallback: PortfolioData = {
    projects: sortProjects(projects as unknown as Project[]),
    certifications: sortCertifications(certifications as unknown as Certification[]),
    journey: sortJourney(journey as unknown as JourneyItem[]),
    internships: sortInternships(internships as unknown as Internship[]),
  }
  if (!dbEnabled()) return fallback

  try {
    const [p, c, j, i] = await Promise.all([
      readCollection<Project>("projects"),
      readCollection<Certification>("certifications"),
      readCollection<JourneyItem>("journey"),
      readCollection<Internship>("internships"),
    ])
    if (!p.length && !c.length && !j.length && !i.length) return fallback
    return {
      projects: sortProjects(p),
      certifications: sortCertifications(c),
      journey: sortJourney(j),
      internships: sortInternships(i),
    }
  } catch {
    return fallback
  }
}
