export type ProjectStatus = "production" | "in_progress" | "completed" | "academic" | "security"

export const PROJECT_STATUSES: ProjectStatus[] = [
  "production",
  "in_progress",
  "completed",
  "academic",
  "security",
]

export type Project = {
  id: string
  title: string
  description_fr: string
  description_en: string
  features_fr: string[]
  features_en: string[]
  stack: string[]
  status: ProjectStatus
  images: string[]
  demo_url: string | null
  code_url: string | null
  sort_order: number
}

export type Certification = {
  id: string
  title_fr: string
  title_en: string
  year: string
  image_url: string | null
  sort_order: number
}

export type JourneyItem = {
  id: string
  year: string
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
  sort_order: number
}

export type PortfolioData = {
  projects: Project[]
  certifications: Certification[]
  journey: JourneyItem[]
}

export type Lang = "fr" | "en"
