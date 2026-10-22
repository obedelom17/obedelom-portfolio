export type Tech = { name: string; icon: string }

export type Skill = {
  key: string
  items: Tech[]
  level: 1 | 2 | 3 | 4 | 5
}

export const skills: Skill[] = [
  {
    key: "web",
    level: 3,
    items: [
      { name: "HTML", icon: "html5" },
      { name: "CSS", icon: "css" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
    ],
  },
  {
    key: "backend",
    level: 3,
    items: [
      { name: "Python", icon: "python" },
      { name: "PHP", icon: "php" },
      { name: "Java", icon: "openjdk" },
    ],
  },
  {
    key: "frameworks",
    level: 3,
    items: [
      { name: "Next.js", icon: "nextdotjs" },
      { name: "React", icon: "react" },
      { name: "Django", icon: "django" },
      { name: "Tailwind CSS", icon: "tailwindcss" },
    ],
  },
  {
    key: "mobile",
    level: 1,
    items: [
      { name: "Flutter", icon: "flutter" },
      { name: "C#", icon: "dotnet" },
    ],
  },
  {
    key: "databases",
    level: 3,
    items: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "MySQL", icon: "mysql" },
      { name: "Supabase", icon: "supabase" },
    ],
  },
  {
    key: "deployment",
    level: 3,
    items: [
      { name: "Vercel", icon: "vercel" },
      { name: "Git", icon: "git" },
      { name: "GitHub", icon: "github" },
    ],
  },
  {
    key: "networks",
    level: 3,
    items: [{ name: "Cisco CCNA 1 et 2", icon: "cisco" }],
  },
]
