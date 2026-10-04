import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { PROJECTS, projectBySlug } from "@/data/projects"

export const dynamicParams = false
export const generateStaticParams = () => PROJECTS.map((p) => ({ slug: p.slug }))

export async function generateMetadata({ params }: PageProps<"/werk/[slug]">): Promise<Metadata> {
  const p = projectBySlug((await params).slug)
  return p ? { title: `${p.categorie} — ${p.code}`, description: p.samenvatting } : {}
}

// Fase 1: de opening van de case study. Het volledige verhaal, met het
// watersysteem en de cijfers, is fase 2.
export default async function ProjectPage({ params }: PageProps<"/werk/[slug]">) {
  const project = projectBySlug((await params).slug)
  if (!project) notFound()
  return (
    <article>
      <header className="raster pt-[clamp(160px,22vh,240px)]">
        <p className="tekst-label col-span-4 text-muted md:col-span-3">
          {project.code} — {project.categorie}
        </p>
        <h1 className="tekst-h1 col-span-4 mt-[16px] md:col-span-8 md:col-start-4 md:mt-0">{project.titel}</h1>
      </header>
      <div className="raster mt-[var(--ruimte-blok)]">
        <div className="relative col-span-4 aspect-[4/3] overflow-hidden bg-surface md:col-span-12">
          <Image src={project.cover.src} alt={project.cover.alt} fill priority sizes="100vw" className="object-cover" style={{ objectPosition: project.cover.focus }} />
        </div>
      </div>
      <div className="raster mt-[var(--ruimte-sectie)]">
        <div className="col-span-4 flex max-w-[38rem] flex-col gap-[1.2em] md:col-span-6 md:col-start-4">
          {project.intro.map((alinea) => (
            <p key={alinea.slice(0, 24)}>{alinea}</p>
          ))}
        </div>
      </div>
    </article>
  )
}
