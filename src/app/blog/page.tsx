import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"
import { Verder } from "@/components/wereld/verder"
import { Foto } from "@/components/foto"
import { STUKKEN } from "@/lib/data/blog"

export const metadata: Metadata = {
  title: "Blog",
  description: "Praktische stukken over vijvers en natuurlijke tuinen bij het seizoen, uit Stein en omgeving.",
  alternates: { canonical: "/blog" },
}

const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

// De blog: een rustige lijst, nieuwste bovenaan, elk stuk met zijn foto.
export default function BlogPagina() {
  return (
    <>
      <Opening
        label={`Blog · ${STUKKEN.length}`}
        titel={"Uit de\nvijver en\nde tuin"}
        zin="Twee keer per maand een praktisch stuk bij het seizoen, met foto's van mijn eigen werk."
      />

      <div className="wrap mt-[clamp(64px,8vw,120px)]">
        <ol className="m-0 list-none p-0">
          {STUKKEN.map((s) => (
            <li key={s.slug} className="border-t border-lijn last:border-b">
              <Link
                href={`/blog/${s.slug}`}
                className="group grid grid-cols-[96px_minmax(0,1fr)] items-center gap-x-5 py-6 text-inherit no-underline md:grid-cols-[200px_minmax(0,1fr)] md:gap-x-10 md:py-8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inkt"
              >
                <div className="aspect-[4/3]">
                  <Foto foto={s.beeld} sizes="(min-width: 768px) 200px, 96px" className="h-full w-full" />
                </div>
                <div className="min-w-0">
                  <p className="lbl m-0 text-gedempt">
                    <time dateTime={s.datum}>{datum(s.datum)}</time> · {s.leestijd} min
                  </p>
                  <h2 className="syne m-0 mt-2 text-[clamp(20px,2.3vw,32px)] leading-[1.2] tracking-[-.02em] transition-colors group-hover:text-oranje-tekst">{s.titel}</h2>
                  <p className="m-0 mt-2 max-w-[60ch] text-gedempt max-md:hidden">{s.beschrijving}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <Verder voor="Een vraag over" nadruk="jouw vijver" na="?" href="/kennismaken" label="Naar Kennismaken" />
    </>
  )
}
