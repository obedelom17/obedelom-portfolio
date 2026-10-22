export type Skill = {
  key: string
  items: string
  level: 1 | 2 | 3 | 4 | 5
}

export const skills: Skill[] = [
  { key: "web", items: "HTML, CSS, JavaScript, TypeScript", level: 3 },
  { key: "backend", items: "Python, PHP, Java (POO)", level: 3 },
  { key: "frameworks", items: "Next.js, React, Django", level: 3 },
  { key: "mobile", items: "Flutter, C#", level: 1 },
  { key: "databases", items: "PostgreSQL, MySQL, Supabase", level: 3 },
  { key: "deployment", items: "Vercel, Git, GitHub", level: 3 },
  { key: "networks", items: "Cisco CCNA 1 et 2", level: 3 },
]
