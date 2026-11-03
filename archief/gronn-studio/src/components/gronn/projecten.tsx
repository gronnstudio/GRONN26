import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { TERRAS, TERRAS_FASEN, TERRAS_FOTOS, TERRAS_SLUG, TERRAS_UITGELICHT } from "@/lib/data/terras-geulle"
import { UITGELICHT, VIJVER, VIJVER_FASE_NU, VIJVER_FASEN, VIJVER_SLUG } from "@/lib/data/vijverrenovatie"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import { BeeldWissel, BREEDTE, CijferRij, FaseBalk, Kanteling, PaginaKop, ProjectBeeld, Status, type Fase } from "./elementen"

// Het projectenoverzicht toont alleen ECHT werk (Dan Hoye: echte
// projecten verkopen, niet plaatshouders): de vijverrenovatie (in
// afronding) en, sinds 24 sep 2026, het terras in Geulle (afgerond).
//
// Onder de muis of bij toetsenbordfocus vloeit op elke kaart een tweede
// echte foto over de eerste (BeeldWissel): de vijver F01 → de waterval
// F10, het terras T01 → T03 ("Klaar, na twee dagen"). De link draagt
// `g-wissel-groep`, dus de hele kaart is de trekker.

type Kaart = {
  slug: string
  status: string
  statusEn: string
  categorie: string
  titel: string
  tekst: string
  cijfers: typeof UITGELICHT
  beeld: ReactNode
  /** Waar het project staat (FaseBalk): huidige fase, of `klaar`. */
  fase: { fasen: Fase[]; huidig?: number; klaar?: boolean }
}

export function ProjectenPagina({ locale }: { locale: Locale }) {
  const t = (v: L) => pick(v, locale)
  const kaarten: Kaart[] = [
    {
      slug: VIJVER_SLUG,
      status: "In afronding",
      statusEn: "Finishing",
      categorie: VIJVER.categorie,
      titel: VIJVER.titel,
      tekst: VIJVER.kaarttekst,
      cijfers: UITGELICHT,
      fase: { fasen: VIJVER_FASEN, huidig: VIJVER_FASE_NU },
      // De eerste kaart: op de telefoon het grootste beeld boven de vouw
      // (Lighthouse, 30 sep 2026: lazy geladen, LCP 4–5 s).
      beeld: <ProjectBeeld id="lijst-route" sizes="(min-width: 1024px) 45vw, 90vw" vul priority />,
    },
    {
      slug: TERRAS_SLUG,
      status: TERRAS.status,
      statusEn: "Completed",
      categorie: TERRAS.categorie,
      titel: TERRAS.titel,
      tekst: TERRAS.kaarttekst,
      cijfers: TERRAS_UITGELICHT,
      fase: { fasen: TERRAS_FASEN, klaar: true },
      beeld: (
        // De foto vult de hele breedte van de kaart, met een rechte kant
        // naar de tekst; de kaart rondt zelf af (eigenaar, 29 sep 2026:
        // "haal die extra rand weg"; 3 okt 2026: "vul de ruimte op").
        // Vanaf lg vult hij zijn helft. De tweede laag (T03, ook 3:4) valt
        // met object-cover precies over dezelfde box.
        <span className="relative block w-full overflow-hidden lg:h-full">
          <Image
            src={TERRAS_FOTOS.hoofd.src}
            alt={TERRAS_FOTOS.hoofd.alt}
            width={TERRAS_FOTOS.hoofd.width}
            height={TERRAS_FOTOS.hoofd.height}
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="block h-auto max-h-[560px] w-full object-cover lg:absolute lg:inset-0 lg:h-full lg:max-h-none lg:w-full lg:object-cover"
          />
          <BeeldWissel foto={TERRAS_FOTOS.slot} sizes="(min-width: 1024px) 45vw, 90vw" />
        </span>
      ),
    },
  ]
  return (
    <>
      <PaginaKop
        label={t({ nl: "Projecten", en: "Projects" })}
        titel={t({ nl: "Echt werk, stap voor stap.", en: "Real work, step by step." })}
        intro={t({
          nl: "Hier staat alleen wat ik zelf heb gemaakt: een vijverrenovatie in afronding en een terras dat klaar is. Nieuwe projecten komen erbij zodra ze af zijn.",
          en: "Only work I made myself appears here: a pond renovation being finished and a completed terrace. New ones are added as they are completed.",
        })}
      />
      <div className={`${BREEDTE} pb-24`}>
        {/* Grote kaarten: twee graden kanteling is genoeg. `overflow-clip`
            (niet -hidden) zodat de FaseBalk tegen het scherm meet, niet
            tegen de kaart (zie BosVlak). */}
        <ul className="grid gap-10">
          {kaarten.map((k) => (
            <li key={k.slug}>
              <Kanteling max={2}>
                <Link
                  href={localePath(locale, `/projects/${k.slug}`)}
                  data-cursor="view"
                  className="g-wissel-groep group grid grid-cols-[minmax(0,1fr)] overflow-clip rounded-[16px] border border-line/10 bg-surface transition-colors hover:border-[var(--gronn-ember)] lg:grid-cols-2"
                >
                  {/* De foto zonder lijst eromheen (eigenaar, 29 sep 2026: "haal die extra rand weg"). */}
                  <span className="block lg:h-full">{k.beeld}</span>
                  <span className="flex flex-col p-6 sm:p-10">
                    <span className="flex flex-wrap items-center gap-x-3 tekst-annotatie text-muted uppercase">
                      <Status>{t({ nl: k.status, en: k.statusEn })}</Status>
                      <span aria-hidden>·</span>
                      <span>{k.categorie}</span>
                    </span>
                    <span lang="nl" className="mt-5 block tekst-h2">{k.titel}</span>
                    <span lang="nl" className="mt-5 block text-[16px] leading-relaxed text-foreground/80">{k.tekst}</span>
                    <FaseBalk {...k.fase} locale={locale} className="mt-8" />
                    <CijferRij cijfers={k.cijfers} className="mt-8" />
                    <span className="mt-auto inline-flex items-center gap-2 pt-10 font-semibold">
                      {t({ nl: "Lees het project", en: "Read the project (in Dutch)" })}
                      <span aria-hidden className="text-[var(--ember-text)] transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </span>
                </Link>
              </Kanteling>
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-xl text-[15px] text-muted">
          {t({ nl: "Wil je dat jouw tuin hier ooit staat? Een kennismaking is vrijblijvend.", en: "Would you like your garden to appear here one day? An introduction is free of obligation." })}{" "}
          <Link href={localePath(locale, "/contact")} className="inline-flex min-h-[24px] items-center font-semibold text-foreground underline decoration-[var(--gronn-ember)] underline-offset-4">
            {t({ nl: "Neem contact op", en: "Get in touch" })}
          </Link>
        </p>
      </div>
    </>
  )
}
