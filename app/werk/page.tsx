import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { PageIntro } from "@/components/PageIntro"
import { PROJECTS } from "@/data/projects"

export const metadata: Metadata = { title: "Werk" }

// Fase 1: een eenvoudige index zodat de route klopt. Het asymmetrische
// raster komt in fase 2.
export default function Werk() {
  return (
    <>
      <PageIntro label="Index" titel="Werk" />
      <ul className="raster gap-y-[var(--ruimte-blok)]">
        {PROJECTS.map((p, i) => (
          <li key={p.slug} className={`col-span-4 md:col-span-5 ${i % 2 ? "md:col-start-8 md:mt-[160px]" : "md:col-start-1"}`}>
            <Link href={`/werk/${p.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <Image src={p.cover.src} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" style={{ objectPosition: p.cover.focus }} />
              </div>
              <p className="tekst-label mt-[16px] text-muted">{p.code}</p>
              <h2 className="tekst-h3 mt-[8px] group-hover:text-accent">{p.categorie}</h2>
              <p className="tekst-label mt-[4px] text-muted">{[p.plaats, p.jaar].filter(Boolean).join(" · ")}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
