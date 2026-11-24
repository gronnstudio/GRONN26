import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { T } from "@/components/taal"
import { Pijl } from "@/components/pijl"
import { TelLink } from "@/components/handoff/klant"
import { Opening } from "@/components/wereld/opening"
import { Opkomst } from "@/components/landschap/opkomst"
import "@/components/landschap/landschap.css"
import { ldJson } from "@/lib/schema"
import { SERVICE_AREA_TOWNS } from "@/lib/werkgebied"
import { VIJVER_PAGINAS, vijverPagina } from "@/lib/data/vijver-paginas"

// Eén pagina per vijverdienst, uit één sjabloon (online strategie, 24 nov
// 2026). De inhoud staat in src/lib/data/vijver-paginas.ts.
export const dynamicParams = false

export function generateStaticParams() {
  return VIJVER_PAGINAS.map((p) => ({ dienst: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ dienst: string }> }): Promise<Metadata> {
  const p = vijverPagina((await params).dienst)
  if (!p) return {}
  return {
    title: p.seoTitel,
    description: p.beschrijving,
    alternates: { canonical: `/vijvers/${p.slug}` },
    openGraph: { title: p.seoTitel, description: p.beschrijving, url: `/vijvers/${p.slug}`, images: [{ url: p.foto.src, alt: p.foto.alt }] },
  }
}

export default async function VijverDienstPagina({ params }: { params: Promise<{ dienst: string }> }) {
  const p = vijverPagina((await params).dienst)
  if (!p) notFound()
  const url = `https://gronn.studio/vijvers/${p.slug}`
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#dienst`,
        name: p.seoTitel,
        description: p.beschrijving,
        url,
        provider: { "@id": "https://gronn.studio/#organisation" },
        areaServed: SERVICE_AREA_TOWNS.map((name) => ({ "@type": "City", name })),
      },
      {
        "@type": "FAQPage",
        mainEntity: p.vragen.map((v) => ({ "@type": "Question", name: v.vraag.nl, acceptedAnswer: { "@type": "Answer", text: v.antwoord.nl } })),
      },
    ],
  }

  return (
    <div className="ls">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(schema) }} />
      <Opkomst />
      <Opening label={p.label} titel={p.titel} zin={<T t={p.zin} />} foto={p.foto} />

      <section className="ls-raster ls-sectie ls-twee" aria-labelledby="dienst-wat">
        <div className="ls-twee-kop ls-op">
          <p className="ls-label"><T t={p.label} /></p>
          <h2 id="dienst-wat" className="ls-h2"><T t={{ nl: "Wat ik doe.", en: "What I do." }} /></h2>
        </div>
        <div className="ls-twee-inhoud ls-op">
          {p.tekst.map((t, i) => (
            <p key={i} className="ls-body"><T t={t} /></p>
          ))}
          <ul className="ls-body vd-lijst">
            {p.lijst.map((t, i) => (
              <li key={i}><T t={t} /></li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ls-raster ls-sectie" aria-label="In het kort">
        <dl className="ls-feiten ls-op">
          {p.feiten.map((f, i) => (
            <div key={i}>
              <dt className="ls-label"><T t={f.term} /></dt>
              <dd><T t={f.waarde} /></dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ls-raster ls-sectie ls-twee" aria-labelledby="dienst-vragen">
        <div className="ls-twee-kop ls-op">
          <p className="ls-label"><T t={{ nl: "Vragen", en: "Questions" }} /></p>
          <h2 id="dienst-vragen" className="ls-h2"><T t={{ nl: "Wat mensen vaak vragen.", en: "What people often ask." }} /></h2>
        </div>
        <div className="ls-twee-inhoud ls-op">
          {p.vragen.map((v, i) => (
            <div key={i} className="vd-vraag">
              <h3 className="ls-h3"><T t={v.vraag} /></h3>
              <p className="ls-body"><T t={v.antwoord} /></p>
            </div>
          ))}
        </div>
      </section>

      <section className="ls-raster ls-sectie ls-twee" aria-labelledby="dienst-verder">
        <div className="ls-twee-kop ls-op">
          <p className="ls-label"><T t={{ nl: "Verder lezen", en: "Read on" }} /></p>
          <h2 id="dienst-verder" className="ls-h2"><T t={{ nl: "Meer over vijvers.", en: "More about ponds." }} /></h2>
        </div>
        <div className="ls-twee-inhoud ls-op ls-vraag">
          <ul className="ls-lijnlijst">
            {p.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}><T t={l.naam} /> <Pijl richting="e" /></Link>
              </li>
            ))}
          </ul>
          <TelLink href="/kennismaken" gebeurtenis="cta_kennismaken" plek={`vijvers-${p.slug}`} className="ls-knop ls-knop-actie">
            <T t={{ nl: "Kennismaken", en: "Get in touch" }} /> <Pijl richting="ne" />
          </TelLink>
        </div>
      </section>
    </div>
  )
}
