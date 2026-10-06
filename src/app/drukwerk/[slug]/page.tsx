import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Alinea } from "@/components/juridisch/alinea"
import { BUSINESS } from "@/lib/business"
import { DOCUMENTEN } from "@/lib/data/legal"

// Drukversie van een juridisch document in de huisstijl van de offerte, zonder
// menu en voet. Hieruit maakt scripts/documenten.mjs de PDF's in
// public/documenten, zodat de PDF altijd dezelfde tekst heeft als de site.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export function generateStaticParams() {
  return DOCUMENTEN.map((d) => ({ slug: d.doc.slug }))
}

const datum = (d: string) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })

export default async function Drukwerk({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const d = DOCUMENTEN.find((x) => x.doc.slug === slug)?.doc
  if (!d) notFound()
  return (
    <div data-links className="drukwerk bg-white text-[13px] leading-[1.6] text-[#202020]">
      <header className="rounded-b-[22px] bg-[#202020] px-12 pb-9 pt-12 text-[#EFEEEA]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair.svg" alt="GRØNN Studio" className="h-[30px] w-auto" />
        <p className="lbl m-0 mt-12 text-[#DB6923]">Kleine letters · versie {datum(d.updated)}</p>
        <h1 className="syne m-0 mt-1 text-[38px] leading-[1.05] tracking-[-.02em]">{d.title}</h1>
        <p className="m-0 mt-3 max-w-[60ch] opacity-80">{d.intro}</p>
      </header>
      <main className="px-12 pb-12 pt-4">
        {d.sections.map((s, i) => (
          <section key={s.heading} className="break-inside-avoid-page">
            <h2 className="kop-stip syne m-0 mb-2 mt-7 text-[16px]">
              {String(i + 1).padStart(2, "0")} · {s.heading}
            </h2>
            {s.body.map((p, j) =>
              p ? (
                <p key={j} className="m-0 mb-2 whitespace-pre-wrap">
                  <Alinea tekst={p} />
                </p>
              ) : null,
            )}
          </section>
        ))}
        <p className="m-0 mt-10 border-t border-[#d9d7d0] pt-4 text-[10px] text-[#5c5b57]">
          {BUSINESS.name} · {BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.city} · KvK{" "}
          {BUSINESS.kvk} · Btw {BUSINESS.btw} · {BUSINESS.email}
        </p>
      </main>
    </div>
  )
}
