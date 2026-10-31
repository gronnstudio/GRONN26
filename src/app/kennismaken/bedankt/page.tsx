import type { Metadata } from "next"
import Link from "next/link"
import { Opening } from "@/components/wereld/opening"
import { T } from "@/components/taal"

// De pagina na een verzonden aanvraag (Nick, 31 okt 2026): het vaste adres
// waarop Google Ads een aanvraag telt. Niet in zoekmachines.
export const metadata: Metadata = {
  title: "Bedankt",
  robots: { index: false, follow: false },
}

export default function Bedankt() {
  return (
    <>
      <Opening
        label="Contact"
        titel={{ nl: "Bedankt", en: "Thank you" }}
        zin={<T t={{ nl: "Je bericht is binnen. Ik reageer meestal binnen twee werkdagen.", en: "Your message has arrived. I usually reply within two working days." }} />}
      />
      <div className="wrap">
        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <Link href="/" className="lnk"><T t={{ nl: "Terug naar de voorpagina", en: "Back to the home page" }} /></Link>
          <Link href="/werk" className="lnk"><T t={{ nl: "Bekijk mijn werk", en: "See my work" }} /></Link>
        </div>
      </div>
    </>
  )
}
