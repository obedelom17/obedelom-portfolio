const items = [
  "Next.js",
  "React",
  "TypeScript",
  "Python",
  "Django",
  "PostgreSQL",
  "Supabase",
  "Tailwind CSS",
  "Flutter",
  "Cisco CCNA",
  "Git",
  "Vercel",
]

/** Bandeau défilant des technologies. Décoratif : masqué aux lecteurs d'écran. */
export function Marquee() {
  return (
    <div className="marquee border-y border-line py-7 md:py-10" aria-hidden>
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((name, i) => (
              <span key={`${copy}-${name}`} className="flex shrink-0 items-center gap-8 px-4 md:gap-12 md:px-6">
                <span className={`font-serif text-4xl md:text-7xl ${i % 2 ? "outline-text" : ""}`}>{name}</span>
                <span className="text-xl text-accent md:text-3xl">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
