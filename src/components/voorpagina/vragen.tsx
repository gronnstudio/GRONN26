import Link from "next/link"
import { faqVragen } from "@/components/faq/vragen"
import { VraagRegel } from "@/components/faq/vraag-regel"
import { T } from "@/components/taal"

// Vier vragen die bezoekers echt hebben, op de voorpagina (les uit
// danhoye.com, 22 okt 2026): voor wie, waar, hoe lang en hoe je begint. Geen
// vraag die alleen over de vijver gaat (eigenaar, 23 okt 2026).
// Uit dezelfde bron als /faq; daar staan ze allemaal.
const IDS = ["voor-welke-tuinen-werk-je", "werk-je-ook-in-mijn-plaats", "hoe-lang-duurt-een-ontwerp-of-aanleg", "hoe-begin-ik"]

export function Vragen() {
  const nl = faqVragen()
  const en = faqVragen("en")
  const kies = IDS.map((id) => nl.findIndex((v) => v.id === id)).filter((i) => i >= 0)
  return (
    <section aria-labelledby="vp-vragen-kop" className="wrap mt-[clamp(96px,12vw,180px)]">
      <div className="w-kopregel">
        <h2 id="vp-vragen-kop" className="lbl m-0"><T t={{ nl: "Vragen", en: "Questions" }} /></h2>
        <Link href="/faq" className="lnk lbl"><T t={{ nl: "Alle vragen →", en: "All questions →" }} /></Link>
      </div>
      <div>
        {kies.map((i, n) => (
          <VraagRegel key={nl[i].id} vraag={nl[i]} en={en[i]} nummer={n + 1} />
        ))}
      </div>
    </section>
  )
}
