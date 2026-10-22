import { getPortfolioData } from "@/lib/data"
import { Header } from "@/components/site/header"
import { Hero } from "@/components/site/hero"
import { About } from "@/components/site/about"
import { Education } from "@/components/site/education"
import { Projects } from "@/components/site/projects"
import { Skills } from "@/components/site/skills"
import { Journey } from "@/components/site/journey"
import { Certifications } from "@/components/site/certifications"
import { Contact } from "@/components/site/contact"
import { Footer } from "@/components/site/footer"

export default function Home() {
  const data = getPortfolioData()
  const firstYear = data.journey.length
    ? Math.min(...data.journey.map((j) => parseInt(j.year, 10)).filter((n) => !Number.isNaN(n)))
    : 2024

  return (
    <>
      <Header />
      <main>
        <Hero
          projectCount={data.projects.length}
          certificationCount={data.certifications.length}
          firstYear={Number.isFinite(firstYear) ? firstYear : 2024}
        />
        <About />
        <Education />
        <Projects projects={data.projects} />
        <Skills />
        <Journey items={data.journey} />
        <Certifications items={data.certifications} />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
