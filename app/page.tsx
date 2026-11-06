import { getPortfolioData } from "@/lib/data"
import { Header } from "@/components/site/header"
import { Hero } from "@/components/site/hero"
import { About } from "@/components/site/about"
import { Education } from "@/components/site/education"
import { Internships } from "@/components/site/internships"
import { Projects } from "@/components/site/projects"
import { Skills } from "@/components/site/skills"
import { Certifications } from "@/components/site/certifications"
import { Contact } from "@/components/site/contact"
import { Footer } from "@/components/site/footer"
import { SmoothScroll } from "@/components/site/smooth-scroll"
import { Marquee } from "@/components/site/marquee"
import { ScrollProgress } from "@/components/scroll-progress"
import { CursorBubble } from "@/components/site/cursor-bubble"
import { Preloader } from "@/components/site/preloader"
import { BackToTop } from "@/components/back-to-top"
import { Toaster } from "@/components/toaster"
import { CommandPalette } from "@/components/command-palette"
import { ScrollBand } from "@/components/site/scroll-band"
import { Aurora } from "@/components/fx/aurora"
import { CursorTrail } from "@/components/fx/cursor-trail"
import { GlobalFx } from "@/components/fx/global-fx"
import { ScrollRail } from "@/components/fx/scroll-rail"
import { Dock } from "@/components/fx/dock"
import { Ambient } from "@/components/fx/ambient"
import { PageCurtain } from "@/components/fx/page-curtain"
import { DynamicIsland } from "@/components/fx/dynamic-island"
import { SectionTint } from "@/components/fx/section-tint"
import { ElasticLine } from "@/components/fx/elastic-line"
import { PerfGovernor } from "@/components/fx/perf-governor"
import { TouchFx } from "@/components/fx/touch-fx"
import { AudioDirector } from "@/components/audio-director"

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
      <PerfGovernor />
      <AudioDirector />
      <TouchFx />
      <Preloader />
      <Aurora />
      <SectionTint />
      <PageCurtain />
      <CursorTrail />
      <GlobalFx />
      <Ambient showInternships={hasInternships} />
      <ScrollRail showInternships={hasInternships} />
      <SmoothScroll />
      <ScrollProgress />
      <CursorBubble />
      <Header showInternships={hasInternships} />
      <main id="main">
        <Hero
          projectCount={data.projects.length}
          certificationCount={data.certifications.length}
          firstYear={Number.isFinite(firstYear) ? firstYear : 2024}
        />
        <Marquee />
        <About projectCount={data.projects.length} />
        <Education />
        <Internships items={data.internships} index="03" />
        <Projects projects={data.projects} index={num(3)} />
        <Skills index={num(4)} />
        <Certifications items={data.certifications} index={num(5)} />
        <ScrollBand />
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <ElasticLine />
        </div>
        <Contact index={num(6)} />
      </main>
      <Footer />
      <DynamicIsland />
      <Dock showInternships={hasInternships} />
      <BackToTop />
      <Toaster />
      <CommandPalette showInternships={hasInternships} />
    </>
  )
}
