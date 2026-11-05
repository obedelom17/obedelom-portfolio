import projects from "@/data/projects.json"
import certifications from "@/data/certifications.json"
import journey from "@/data/journey.json"
import internships from "@/data/internships.json"
import { sortCertifications, sortInternships, sortJourney, sortProjects } from "./sort"
import type { Certification, Internship, JourneyItem, PortfolioData, Project } from "./types"

/** Données de départ, embarquées au build. Le contenu à jour est chargé côté client via /api/portfolio. */
export function getSeedData(): PortfolioData {
  return {
    projects: sortProjects(projects as unknown as Project[]),
    certifications: sortCertifications(certifications as unknown as Certification[]),
    journey: sortJourney(journey as unknown as JourneyItem[]),
    internships: sortInternships(internships as unknown as Internship[]),
  }
}

/** Trie les collections renvoyées par l'API. */
export function sortPortfolio(raw: Partial<PortfolioData>, fallback: PortfolioData): PortfolioData {
  return {
    projects: raw.projects ? sortProjects(raw.projects) : fallback.projects,
    certifications: raw.certifications ? sortCertifications(raw.certifications) : fallback.certifications,
    journey: raw.journey ? sortJourney(raw.journey) : fallback.journey,
    internships: raw.internships ? sortInternships(raw.internships) : fallback.internships,
  }
}
