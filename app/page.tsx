import { HomeHero } from "@/components/HomeHero"
import { ProjectTeaser } from "@/components/ProjectTeaser"
import { PROJECTS } from "@/data/projects"
import { OPENING } from "@/data/site"

export default function Home() {
  return (
    <>
      <HomeHero />

      {/* De positioneringszin, als tekstpagina na de opening. */}
      <section aria-label="Over GRØNN" className="raster py-[var(--ruimte-sectie)]">
        <p className="tekst-label col-span-4 text-muted md:col-span-2">00 / Studio</p>
        <p className="tekst-h3 col-span-4 mt-[16px] max-w-[30ch] md:col-span-7 md:col-start-4 md:mt-0">
          {OPENING.zin}
        </p>
      </section>

      <div className="flex flex-col gap-[var(--ruimte-sectie)]">
        {PROJECTS.slice(0, 1).map((project, i) => (
          <ProjectTeaser key={project.slug} project={project} index={i} />
        ))}
      </div>
    </>
  )
}
