import projects from "@/data/projects.json"
import certifications from "@/data/certifications.json"
import journey from "@/data/journey.json"
import { sortCertifications, sortJourney, sortProjects } from "./sort"
import type { Certification, JourneyItem, PortfolioData, Project } from "./types"

export function getPortfolioData(): PortfolioData {
  return {
    projects: sortProjects(projects as unknown as Project[]),
    certifications: sortCertifications(certifications as unknown as Certification[]),
    journey: sortJourney(journey as unknown as JourneyItem[]),
  }
}
