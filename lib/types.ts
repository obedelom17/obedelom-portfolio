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
  /** Liens de vidéos (fichier .mp4/.webm, YouTube, Vimeo). Affichées avant les images. */
  videos?: string[]
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

export type Internship = {
  id: string
  company: string
  /** Année du stage, sert au tri (du plus récent au plus ancien). */
  year: string
  period: string
  duration: string
  location: string
  role_fr: string
  role_en: string
  description_fr: string
  description_en: string
  missions_fr: string[]
  missions_en: string[]
  stack: string[]
  website_url: string | null
  logo_url: string | null
  image_url: string | null
  sort_order: number
}

export type PortfolioData = {
  projects: Project[]
  certifications: Certification[]
  journey: JourneyItem[]
  internships: Internship[]
}

export type Lang = "fr" | "en"
