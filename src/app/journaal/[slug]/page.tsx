import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Kruimelpad } from "@/components/kruimelpad"
import { Foto } from "@/components/foto"
import { Verder } from "@/components/wereld/verder"
import { Figuur } from "@/components/werk/delen"
import { BUSINESS } from "@/lib/business"
import { STUKKEN, datumTekst, nummer, stukMet } from "@/lib/data/blog"

export function generateStaticParams() {
  return STUKKEN.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = stukMet((await params).slug)
  if (!s) return {}
  return {
    title: s.titel,
    description: s.beschrijving,
    alternates: { canonical: `/journaal/${s.slug}` },
    openGraph: {
      type: "article",
      title: s.titel,
      description: s.beschrijving,
      url: `/journaal/${s.slug}`,
      publishedTime: s.datum,
      images: [{ url: s.beeld.src, width: s.beeld.width, height: s.beeld.height, alt: s.beeld.alt }],
    },
  }
}

// De tekstkolom rechts van de zijbalk; liggende foto's krijgen de hele breedte.
const TEKST = "max-w-[68ch] lg:col-span-8 lg:col-start-5"

// Eén stuk als tijdschriftartikel, in de breedte van de site: rubriek en
// nummer, kop, groot beeld (staand: naast de kop, zoals een openingspagina),
// dan links de auteur en de knop (blijft staan tijdens het lezen), rechts de
// tekst met een initiaal, en onderaan de bronnen.
export default async function BlogStuk({ params }: { params: Promise<{ slug: string }> }) {
  const s = stukMet((await params).slug)
  if (!s) notFound()
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: s.titel,
    description: s.beschrijving,
    datePublished: s.datum,
    image: `https://gronn.studio${s.beeld.src}`,
    inLanguage: "nl-NL",
    author: { "@type": "Person", name: "Nick Peters" },
    publisher: { "@type": "Organization", name: "GRØNN Studio", url: "https://gronn.studio" },
    mainEntityOfPage: `https://gronn.studio/journaal/${s.slug}`,
  }
  // het openingsbeeld staat al bovenaan; niet nog eens in de tekst
  const blokken = s.blokken.filter((b) => b.soort !== "foto" || b.foto.src !== s.beeld.src)
  const eerste = blokken.findIndex((b) => b.soort === "alinea")
  const staand = s.beeld.height > s.beeld.width
  const kicker = (
    <p className="lbl m-0 mt-[clamp(20px,2.5vw,36px)] flex flex-wrap gap-x-3 border-t-2 border-inkt pt-3">
      <span className="text-oranje-tekst">Journaal Nr. {nummer(s)} · {s.rubriek}</span>
      <span className="text-gedempt"><time dateTime={s.datum}>{datumTekst(s.datum)}</time> · {s.leestijd} min lezen</span>
    </p>
  )
  const titel = <h1 id="pagina-titel" tabIndex={-1} className="syne m-0 mt-[clamp(20px,2.5vw,36px)] max-w-[18ch] text-[clamp(36px,5.2vw,80px)] leading-[1.02] tracking-[-.03em]">{s.titel}</h1>
  const lead = <p className="m-0 mt-[clamp(20px,2.5vw,32px)] max-w-[52ch] text-[clamp(18px,1.6vw,23px)] leading-[1.5] text-gedempt">{s.beschrijving}</p>
  return (
    <article lang="nl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <header className="wrap pt-[clamp(120px,14vw,200px)]">
        <Kruimelpad />
        {kicker}
        {staand ? (
          <div className="grid gap-y-8 md:grid-cols-12 md:items-end md:gap-x-8">
            <div className="md:col-span-7">{titel}{lead}</div>
            <div className="aspect-[4/5] md:col-span-5">
              <Foto foto={s.beeld} priority sizes="(min-width: 1280px) 500px, (min-width: 768px) 40vw, 100vw" className="h-full w-full" />
            </div>
          </div>
        ) : (
          <>
            {titel}
            {lead}
            <div className="mt-[clamp(32px,4vw,56px)] aspect-[4/3] md:aspect-[16/9] lg:aspect-[21/9]">
              <Foto foto={s.beeld} priority sizes="(min-width: 1280px) 1232px, 100vw" className="h-full w-full" />
            </div>
          </>
        )}
      </header>

      <div className="wrap mt-[clamp(40px,5vw,80px)] grid grid-cols-1 lg:grid-cols-12 lg:gap-x-8">
        <aside className="mb-10 border-t border-lijn pt-5 lg:col-span-3 lg:row-start-1 lg:row-end-[span_200] lg:mb-0">
          <div className="lg:sticky lg:top-8">
            <p className="m-0 text-[15px] font-medium">Nick Peters</p>
            <p className="m-0 mt-1 text-[15px] text-gedempt">Hovenier, GRØNN Studio, Stein</p>
            <p className="lbl m-0 mt-4 text-gedempt">Tekst en beeld</p>
            <a href={BUSINESS.whatsapp} className="knop mt-6 bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt max-lg:hidden">Stuur een foto</a>
          </div>
        </aside>

        {blokken.map((b, i) => {
          if (b.soort === "kop")
            return <h2 key={i} className={`syne m-0 mt-[1.8em] mb-[.6em] text-[clamp(24px,2.4vw,34px)] leading-[1.15] tracking-[-.02em] ${TEKST}`}>{b.tekst}</h2>
          if (b.soort === "lijst")
            return (
              <ul key={i} className={`m-0 mb-[1.2em] pl-5 text-[18px] leading-[1.7] ${TEKST}`}>
                {b.regels.map((r) => <li key={r} className="mb-[.4em]">{r}</li>)}
              </ul>
            )
          if (b.soort === "foto") {
            const liggend = b.foto.width > b.foto.height
            return (
              <Figuur
                key={i}
                foto={b.foto}
                sizes={liggend ? "(min-width: 1280px) 920px, 100vw" : "(min-width: 1024px) 420px, 100vw"}
                className={`my-[clamp(32px,4vw,56px)] ${liggend ? "lg:col-span-9 lg:col-start-4" : `${TEKST} max-w-[420px]`}`}
              />
            )
          }
          // de eerste alinea als inleiding, iets groter en met een initiaal
          const inleiding = i === eerste
          return (
            <p key={i} className={`m-0 mb-[1.2em] ${inleiding ? "text-[clamp(20px,1.8vw,24px)] leading-[1.55] first-letter:syne first-letter:float-left first-letter:mt-[.08em] first-letter:mr-[.12em] first-letter:text-[3.4em] first-letter:leading-[.8]" : "text-[18px] leading-[1.75]"} ${TEKST}`}>{b.tekst}</p>
          )
        })}

        <p className={`m-0 mt-6 lbl text-gedempt ${TEKST}`}>Nick Peters, GRØNN Studio, Stein</p>

        <p className={`m-0 mt-6 ${TEKST}`}>
          <a href={BUSINESS.whatsapp} className="knop bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt">Stuur een foto via WhatsApp</a>
        </p>
        {s.bronnen?.length ? (
          <section aria-labelledby="bronnen" className={`mt-[clamp(40px,5vw,64px)] border-t border-lijn pt-5 ${TEKST}`}>
            <h2 id="bronnen" className="lbl m-0">Bronnen</h2>
            {s.bronnen.map((b) => (
              <p key={b} className="m-0 mt-3 pl-6 -indent-6 text-[14px] leading-[1.6] break-words text-gedempt">{b}</p>
            ))}
          </section>
        ) : null}
      </div>

      <Verder voor="Meer uit het" nadruk="Journaal" href="/journaal" label="Naar het Journaal" />
    </article>
  )
}
