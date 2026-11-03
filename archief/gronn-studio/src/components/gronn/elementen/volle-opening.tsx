import Image from "next/image"
import type { ReactNode } from "react"

import { BREEDTE } from "./breedte"
import { Kop } from "./kop"

/**
 * VolleOpening: de opening van home als één foto over het hele scherm,
 * met de tekst linksonder in gebroken wit (eigenaar, 29 sep 2026, uit drie
 * proeven: "A volle opening, en ook op mobiel ziet echt fenomenaal uit").
 *
 * - De foto vult `100svh` van rand tot rand, `object-cover`, met
 *   `photo-glass` zoals elke foto, en daarover één scrim in antraciet
 *   (`.opening-scrim` in globals.css): op de telefoon van onderen, vanaf
 *   `lg` van links met een lichte voet. Themavast, want het is een
 *   fotofilter en geen chroom (CLAUDE.md, fotobehandeling). De sterkte is
 *   gemeten, niet gekozen: `opening-contrast.spec.ts` eist 3:1 voor de kop
 *   en 4,5:1 voor label, zin en naam, boven de lichtste 1 % van de pixels.
 *   Zakt er iets, dan gaat de scrim omhoog, niet de drempel omlaag.
 * - Bij wegscrollen zoomt de foto rustig uit van 1,08 naar 1
 *   (`.opening-uitzoom`, CSS scroll-timeline). Bij minder beweging —
 *   systeem of `data-motion="reduced"` — of zonder scroll-timeline staat
 *   hij stil op 1.
 * - Het label staat in gebroken wit, niet in salie: salie haalde boven
 *   het zonlicht in de canna op de telefoon maar 3,3–3,8:1.
 * - Het menu ligt erover: vanaf `md` de zwevende glazen pil (Header), op
 *   de telefoon de bovenbalk en de dock. Daarom begint de sectie op de
 *   bovenkant van het scherm (de kopruimte valt weg op home, zie
 *   `KopRuimte`) en houdt de tekst onderaan de dock vrij.
 *
 * `foto` is een foto van ECHT werk (nooit een sfeerbeeld of AI-visualisatie:
 * hier staat geen label op). `kop` wordt een `Kop as="h1" direct`.
 * `inBeeld`: wat op de foto hoort maar niet meezoomt (stempel, sterretje).
 * `kaart`: rechtsonder vanaf `lg` (de projectkaart).
 * `merk`: het primaire logo boven het label, wit met de oranje P (eigenaar,
 * 29 sep 2026: "nu kunnen we ook de primary logo gebruiken op de volle
 * hero?"). Het staat op de foto onder de scrim, in beide thema's gelijk.
 */
export function VolleOpening({
  id,
  foto,
  alt,
  label,
  kop,
  zin,
  acties,
  persoon,
  kaart,
  inBeeld,
  merk,
}: {
  /** Id van de h1; de sectie is `aria-labelledby` ernaar. */
  id: string
  foto: { src: string; width: number; height: number }
  alt: string
  label: string
  kop: string
  zin: string
  acties: ReactNode
  persoon?: ReactNode
  kaart?: ReactNode
  inBeeld?: ReactNode
  merk?: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      data-element="VolleOpening"
      className="relative isolate flex min-h-svh overflow-hidden bg-gronn-black text-gronn-white"
    >
      <div className="absolute inset-0 -z-10">
        <div className="opening-uitzoom absolute inset-0">
          {/* Uitsnede: op de telefoon de canna links en de waterval
              rechts ervan; vanaf lg linksboven, zodat het rood van de
              canna in beeld blijft (eigenaar, 25 sep 2026). */}
          <Image
            src={foto.src}
            alt={alt}
            fill
            sizes="100vw"
            priority
            className="object-cover object-[14%_0%] lg:object-[0%_0%]"
          />
        </div>
        <div aria-hidden className="photo-glass absolute inset-0" />
        <div aria-hidden data-opening-scrim="" className="opening-scrim absolute inset-0" />
      </div>
      {inBeeld}
      <div
        className={`${BREEDTE} relative flex items-end pt-[120px] pb-[calc(56px+28px+24px+env(safe-area-inset-bottom))] md:pb-[56px] lg:pb-[72px]`}
      >
        <div className="grid w-full gap-[32px] lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            {merk && (
              <div data-opening-merk="" className="mb-[28px] lg:mb-[36px]">
                {merk}
              </div>
            )}
            <p data-opening-label="" className="tekst-annotatie text-gronn-white">{label}</p>
            <Kop as="h1" id={id} direct className="tekst-display mt-[20px] lg:mt-[24px]">
              {kop}
            </Kop>
            <p data-opening-zin="" className="tekst-body mt-[20px] max-w-[42ch] text-gronn-white lg:mt-[28px]">
              {zin}
            </p>
            <div className="mt-[28px] flex flex-wrap gap-[12px] lg:mt-[36px]">{acties}</div>
            {persoon && <div className="mt-[24px] lg:mt-[28px]">{persoon}</div>}
          </div>
          {kaart && <div className="hidden lg:col-span-4 lg:col-start-9 lg:flex lg:justify-end">{kaart}</div>}
        </div>
      </div>
    </section>
  )
}
