import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { Figuur, Lees } from "@/components/werk/delen"
import { BUSINESS } from "@/lib/business"
import { STUKKEN, stukMet } from "@/lib/data/blog"

export function generateStaticParams() {
  return STUKKEN.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = stukMet((await params).slug)
  if (!s) return {}
  return {
    title: s.titel,
    description: s.beschrijving,
    alternates: { canonical: `/blog/${s.slug}` },
    openGraph: {
      type: "article",
      title: s.titel,
      description: s.beschrijving,
      url: `/blog/${s.slug}`,
      publishedTime: s.datum,
      images: [{ url: s.beeld.src, width: s.beeld.width, height: s.beeld.height, alt: s.beeld.alt }],
    },
  }
}

const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

// Eén stuk: de opening met de titel, dan de leeskolom van de projectpagina's.
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
    mainEntityOfPage: `https://gronn.studio/blog/${s.slug}`,
  }
  return (
    <article lang="nl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <div className="wk-opening wk-lang">
        <Opening
          label={`Blog · ${datum(s.datum)} · ${s.leestijd} min`}
          titel={s.titel}
          zin={s.beschrijving}
        />
      </div>

      <div className="wrap mt-[clamp(64px,8vw,120px)]">
        <Lees>
          {s.blokken.map((b, i) => {
            if (b.soort === "kop") return <h2 key={i} className="syne m-0 mt-[1.8em] mb-[.6em] text-[clamp(22px,2.4vw,30px)] leading-[1.2] tracking-[-.02em]">{b.tekst}</h2>
            if (b.soort === "lijst")
              return (
                <ul key={i} className="m-0 mb-[1.1em] pl-5 text-[17px] leading-[1.7]">
                  {b.regels.map((r) => <li key={r} className="mb-[.4em]">{r}</li>)}
                </ul>
              )
            if (b.soort === "foto") return <Figuur key={i} foto={b.foto} sizes="(min-width: 768px) 50vw, 100vw" className="my-[clamp(24px,4vw,48px)]" />
            return <p key={i} className="m-0 mb-[1.1em] text-[17px] leading-[1.7]">{b.tekst}</p>
          })}
          <p className="m-0 mt-8">
            <a href={BUSINESS.whatsapp} className="knop bg-oranje text-antraciet focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-inkt">Stuur een foto via WhatsApp</a>
          </p>
          <p className="lbl m-0 mt-10 text-gedempt">Nick Peters · GRØNN Studio, Stein</p>
        </Lees>
      </div>

      <Verder voor="Meer" nadruk="lezen" na="?" href="/blog" label="Naar de blog" />
    </article>
  )
}
