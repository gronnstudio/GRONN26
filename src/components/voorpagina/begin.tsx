import Link from "next/link"
import { LijnLink, Maatlijn, Markering } from "@/components/ontwerp"
import { T, type Tekst } from "@/components/taal"
import { BUSINESS } from "@/lib/business"
import { FOTO_WHATSAPP } from "./opening"

// 04 Werkwijze in drie stappen op één lijn, en het slot: één zin, één knop.
// De zes stappen staan op /over; hier alleen wat een bezoeker nu moet doen.

const STAPPEN: { kop: Tekst; tekst: Tekst }[] = [
  {
    kop: { nl: "Stuur een foto of bel", en: "Send a photo or call" },
    tekst: { nl: "Vertel wat er speelt. Een foto van je vijver of tuin zegt vaak al veel.", en: "Tell me what’s going on. A photo of your pond or garden often says a lot already." },
  },
  {
    kop: { nl: "Ik kom kijken", en: "I come and look" },
    tekst: { nl: "Ter plaatse kijk ik naar water, bodem en licht. Daarna krijg je een prijs vooraf, waar het kan een vaste.", en: "On site I look at water, soil and light. Then you get a price up front, fixed wherever possible." },
  },
  {
    kop: { nl: "Ik maak het en houd het bij", en: "I build it and look after it" },
    tekst: { nl: "Ik leg zelf aan. Wil je, dan kom ik elk seizoen terug voor het onderhoud.", en: "I build it myself. If you like, I come back every season for the care." },
  },
]

export function Begin() {
  return (
    <>
      <section className="wrap sectie-ruim" aria-labelledby="h-stappen">
        <Markering nr="04" naam={{ nl: "Werkwijze", en: "Approach" }} />
        <h2 id="h-stappen" className="t-h2 begin-kop opkomst">
          <T t={{ nl: "Zo begint het.", en: "This is how it starts." }} />
        </h2>
        <ol className="stappen">
          {STAPPEN.map((s, i) => (
            <li key={i} className="stap opkomst">
              <p className="meta m-0 text-gedempt"><T t={{ nl: "Stap", en: "Step" }} /> {String(i + 1).padStart(2, "0")}</p>
              <h3 className="t-h3 mt-3 mb-3"><T t={s.kop} /></h3>
              <p className="t-body m-0 max-w-[36ch] text-gedempt"><T t={s.tekst} /></p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap slot" aria-labelledby="h-slot">
        <div className="slot-binnen opkomst">
          <h2 id="h-slot" className="t-h1 m-0">
            <T t={{ nl: "Vertel wat er speelt.", en: "Tell me what’s going on." }} />
          </h2>
          <div className="slot-onder">
            <p className="t-lead m-0 max-w-[30ch]">
              <T t={{ nl: "Een foto van je vijver of tuin is genoeg om te beginnen. Je spreekt mij zelf.", en: "A photo of your pond or garden is enough to start. You talk to me directly." }} />
            </p>
            <div className="slot-acties">
              <Link href="/kennismaken" className="knop bg-oranje text-antraciet">
                <T t={{ nl: "Kennismaken", en: "Get in touch" }} />
              </Link>
              <LijnLink href={FOTO_WHATSAPP} className="meta">WhatsApp</LijnLink>
              <LijnLink href={BUSINESS.phoneHref} className="meta">{BUSINESS.phone}</LijnLink>
            </div>
          </div>
          <Maatlijn className="slot-maat">
            <T t={{ nl: "Werkgebied: Stein + ± 30 km", en: "Area: Stein + ± 30 km" }} />
          </Maatlijn>
        </div>
      </section>
    </>
  )
}
