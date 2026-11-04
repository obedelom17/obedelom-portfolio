import { getPortfolioData } from "@/lib/data"
import { Header } from "@/components/site/header"
import { Hero } from "@/components/site/hero"
import { About } from "@/components/site/about"
import { Education } from "@/components/site/education"
import { Internships } from "@/components/site/internships"
import { Projects } from "@/components/site/projects"
import { Skills } from "@/components/site/skills"
import { Journey } from "@/components/site/journey"
import { Certifications } from "@/components/site/certifications"
import { Contact } from "@/components/site/contact"
import { Footer } from "@/components/site/footer"
import { SmoothScroll } from "@/components/site/smooth-scroll"
import { CursorBubble } from "@/components/site/cursor-bubble"

export const revalidate = 60

export default async function Home() {
  const data = await getPortfolioData()
  const firstYear = data.journey.length
    ? Math.min(...data.journey.map((j) => parseInt(j.year, 10)).filter((n) => !Number.isNaN(n)))
    : 2024

  // La section Stages n'apparaît que si au moins un stage existe ; la numérotation des sections suit.
  const hasInternships = data.internships.length > 0
  const num = (n: number) => String(n + (hasInternships ? 1 : 0)).padStart(2, "0")

  return (
    <>
      <SmoothScroll />
      <CursorBubble />
      <Header showInternships={hasInternships} />
      <main>
        <Hero
          projectCount={data.projects.length}
          certificationCount={data.certifications.length}
          firstYear={Number.isFinite(firstYear) ? firstYear : 2024}
        />
        <About />
        <Education />
        <Internships items={data.internships} index="03" />
        <Projects projects={data.projects} index={num(3)} />
        <Skills index={num(4)} />
        <Journey items={data.journey} index={num(5)} />
        <Certifications items={data.certifications} index={num(6)} />
        <Contact index={num(7)} />
      </main>
      <Footer />
    </>
  )
}
