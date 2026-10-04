import Image from "next/image"
import Link from "next/link"

import type { Project } from "@/data/projects"

// Een project op de voorpagina: geen kaart, maar een spread. Een regel,
// een nummer, een groot beeld, één zin en de gegevens in mono. De witruimte
// doet het werk dat een kader anders zou doen.
export function ProjectTeaser({ project, index }: { project: Project; index: number }) {
  const [kop, ...rest] = project.titel.split(". ")
  return (
    <article aria-labelledby={`project-${project.slug}`} className="raster">
      <div className="regel col-span-4 flex justify-between pt-[16px] md:col-span-12">
        <p className="tekst-label">
          {String(index + 1).padStart(2, "0")} / {project.categorie}
        </p>
        <p className="tekst-label text-muted">{project.code}</p>
      </div>

      <Link
        href={`/werk/${project.slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="group col-span-4 mt-[clamp(40px,6vw,96px)] block md:col-span-7 md:col-start-5"
      >
        <div className="scroll-beeld relative aspect-[4/5] overflow-hidden bg-surface md:aspect-[1/1]">
          <Image
            src={project.cover.src}
            alt=""
            fill
            sizes="(min-width: 768px) 58vw, 100vw"
            className="diepte object-cover transition-[filter] duration-700 group-hover:brightness-[1.04]"
            style={{ objectPosition: project.cover.focus }}
          />
        </div>
      </Link>

      <div className="col-span-4 mt-[40px] md:col-span-4 md:col-start-1 md:row-start-2 md:mt-0 md:self-end">
        <h2 id={`project-${project.slug}`} className="tekst-h2">
          <Link href={`/werk/${project.slug}`} className="hover:text-accent">
            <span className="scroll-regel onthul-regel"><span>{rest.length ? `${kop}.` : kop}</span></span>
            {rest.length > 0 && (
              <span className="scroll-regel onthul-regel"><span>{rest.join(". ")}</span></span>
            )}
          </Link>
        </h2>
        <p className="mt-[24px] max-w-[34ch] text-muted">{project.samenvatting}</p>
        <dl className="tekst-label mt-[32px] grid grid-cols-[auto_1fr] gap-x-[24px] gap-y-[6px]">
          <dt className="text-muted">Status</dt>
          <dd>{project.status}</dd>
          {project.plaats && (
            <>
              <dt className="text-muted">Plaats</dt>
              <dd>{project.plaats}</dd>
            </>
          )}
          <dt className="text-muted">Jaar</dt>
          <dd>{project.jaar}</dd>
        </dl>
        <Link
          href={`/werk/${project.slug}`}
          className="group mt-[40px] inline-flex items-center gap-[12px] text-[13px] font-semibold uppercase tracking-[0.1em]"
        >
          <span className="border-b border-line/30 pb-[4px] transition-colors group-hover:border-line">Bekijk het project</span>
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-[4px]">→</span>
        </Link>
      </div>
    </article>
  )
}
