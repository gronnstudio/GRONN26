import Image from "next/image"
import Link from "next/link"

import { Plaat } from "@/components/Plaat"
import type { Foto, Project } from "@/data/projects"

// Een project als spread op de voorpagina. Twee ritmes, zodat twee
// projecten niet als twee kaarten naast elkaar lezen:
//   breed  — titel over de volle breedte, een groot liggend beeld, een
//            detail als plaat ernaast;
//   staand — één staand beeld, smal, met de feiten in mono ernaast.

type Props = {
  project: Project
  index: number
  ritme: "breed" | "staand"
  beeld?: Foto
  detail?: Foto
  feiten?: [string, string][]
}

export function ProjectSpread({ project, index, ritme, beeld = project.cover, detail, feiten }: Props) {
  const id = `project-${project.slug}`
  const href = `/werk/${project.slug}`
  const regels = project.titel.split(/(?<=\.) /)

  const kop = (
    <div className="regel col-span-4 flex justify-between pt-[16px] md:col-span-12">
      <p className="tekst-label">
        {project.code} <span className="text-muted">— {project.categorie}</span>
      </p>
      <p className="tekst-label text-muted">
        {[project.plaats, project.jaar].filter(Boolean).join(" · ")}
      </p>
    </div>
  )

  const titel = (cls: string, maat: string) => (
    <h2 id={id} className={`${maat} ${cls}`}>
      <Link href={href} className="transition-colors hover:text-accent">
        {regels.map((r) => (
          <span key={r} className="scroll-regel onthul-regel"><span>{r}</span></span>
        ))}
      </Link>
    </h2>
  )

  const verder = (
    <Link href={href} className="group inline-flex items-center gap-[12px] text-[12px] font-semibold uppercase tracking-[0.12em]">
      <span className="border-b border-line/30 pb-[4px] transition-colors group-hover:border-line">Bekijk het project</span>
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-[4px]">→</span>
    </Link>
  )

  const groot = (cls: string, ratio: string, sizes: string) => (
    <Link href={href} tabIndex={-1} aria-hidden="true" className={`group block ${cls}`}>
      <div className={`scroll-beeld relative overflow-hidden bg-surface ${ratio}`}>
        <Image src={beeld.src} alt="" fill sizes={sizes} className="diepte foto-toon object-cover" style={{ objectPosition: beeld.focus }} />
      </div>
    </Link>
  )

  if (ritme === "breed") {
    return (
      <article aria-labelledby={id} className="raster">
        {kop}
        {titel("col-span-4 mt-[clamp(40px,6vw,96px)] md:col-span-11", "tekst-spread")}
        {groot("col-span-4 mt-[clamp(40px,6vw,88px)] md:col-span-7 md:col-start-6", "aspect-[4/5] md:aspect-square", "(min-width: 768px) 58vw, 100vw")}
        <div className="col-span-4 mt-[40px] flex flex-col gap-[48px] md:col-span-3 md:col-start-1 md:row-start-3 md:mt-[clamp(40px,6vw,88px)] md:justify-between">
          {detail && <Plaat foto={detail} sizes="(min-width: 768px) 22vw, 60vw" className="w-[62%] md:w-full" />}
          <div>
            <p className="max-w-[32ch] text-muted">{project.samenvatting}</p>
            <p className="tekst-label mt-[24px]">{project.status}</p>
            <div className="mt-[32px]">{verder}</div>
          </div>
        </div>
        <p className="sr-only">Volgnummer {index + 1}</p>
      </article>
    )
  }

  return (
    <article aria-labelledby={id} className="raster">
      {kop}
      {groot("col-span-4 mt-[clamp(40px,6vw,96px)] md:col-span-4 md:col-start-3", "aspect-[3/4]", "(min-width: 768px) 33vw, 100vw")}
      <div className="col-span-4 mt-[40px] md:col-span-4 md:col-start-8 md:mt-[clamp(40px,6vw,96px)] md:self-end">
        {titel("", "tekst-h2")}
        <p className="mt-[24px] max-w-[34ch] text-muted">{project.samenvatting}</p>
        {feiten && (
          <dl className="tekst-label mt-[40px] grid grid-cols-[auto_1fr] gap-x-[32px]">
            {feiten.map(([k, v]) => (
              <div key={k} className="regel col-span-2 grid grid-cols-subgrid py-[10px]">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-[40px]">{verder}</div>
      </div>
    </article>
  )
}
