import type { Metadata } from "next"
import { faqSchema, faqVragen } from "@/components/faq/vragen"
import { VraagRegel } from "@/components/faq/vraag-regel"
import { Verder } from "@/components/wereld/verder"
import { Opening } from "@/components/wereld/opening"

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description: "Wat een vijver of tuin bij mij kost, waar ik werk, hoe lang het duurt en hoe je begint.",
  alternates: { canonical: "/faq" },
}

// WF-032 in de taal van de voorpagina: donkere opening, dan alle vragen als
// rustige openklapbare regels (de eerste staat open), dan Kennismaken.
export default function FaqPagina() {
  const lijst = faqVragen()
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(lijst)).replace(/</g, "\\u003c") }}
      />
      {/* Eén lang woord per regel: op de telefoon iets kleiner, zodat het past. */}
      <div className="max-md:[&_.w-reus]:text-[13vw]!">
      <Opening
        label={`Vragen · ${lijst.length}`}
        titel={"Veelgestelde\nvragen"}
        zin="Wat het kost, waar ik werk, hoe lang het duurt en hoe je begint."
      />
      </div>

      <div className="wrap mt-[clamp(64px,8vw,120px)]">
        <div>
          {lijst.map((v, i) => (
            <VraagRegel key={v.id} vraag={v} nummer={i + 1} open={i === 0} />
          ))}
        </div>
        <p className="lbl mt-4 max-w-[60ch] text-gedempt">Alle prijzen inclusief btw</p>
      </div>

      <Verder voor="Staat je vraag" nadruk="er niet bij" na="?" href="/kennismaken" label="Naar Kennismaken" />
    </>
  )
}
