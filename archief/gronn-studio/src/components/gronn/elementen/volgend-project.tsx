import Image from "next/image"
import Link from "next/link"

import type { ProjectKaart } from "@/lib/data/projecten-volgorde"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"

import { Status } from "./status"

const TEKST = {
  label: { nl: "Volgend project", en: "Next project" },
  meer: { nl: "Meer echt werk:", en: "More real work:" },
  alle: { nl: "alle projecten", en: "all projects" },
} satisfies Record<string, L>

/**
 * Onderaan een projectpagina: één brede kaart naar het VOLGENDE echte
 * project (`volgendProject()` in @/lib/data/projecten-volgorde, loopt
 * rond). Label, titel, kaarttekst, status en de eerste foto; de hele
 * kaart is één link, met als naam label + titel ("Volgend project …").
 * Daaronder de stille regel naar alle projecten.
 *
 * Eén accent: de oranje stip van `Status`. Het label, de pijl en de
 * onderstreping blijven in de tekstkleuren.
 *
 * Beweging: de foto opent vanuit een inzet naar het volle vlak
 * (`clip-path: inset()` op `animation-timeline: view()`, `g-volgend-beeld`
 * in globals.css), onder dezelfde poort als g-in. Zonder die poort of
 * zonder ondersteuning: gewoon de hele foto. Geen `overflow-hidden` op de
 * voorouders: dat maakt een scrollcontainer en bevriest view().
 *
 * Telefoon: gestapeld, foto boven. Vanaf md: foto links (5/12), tekst
 * rechts. Titel en kaarttekst zijn Nederlands (`lang="nl"`), net als de
 * projectpagina's zelf.
 */
export function VolgendProject({
  project,
  locale,
  className = "",
}: {
  project: ProjectKaart
  locale: Locale
  className?: string
}) {
  const t = (v: L) => pick(v, locale)
  const { foto } = project
  const staand = foto ? foto.height > foto.width : false
  return (
    <nav data-element="VolgendProject" lang={locale} aria-label={t(TEKST.label)} data-volgend-project className={className}>
      <Link
        href={localePath(locale, `/projects/${project.slug}`)}
        aria-labelledby="volgend-label volgend-titel"
        className="group grid gap-[20px] rounded-[16px] border border-line/15 bg-surface p-[12px] transition-colors hover:border-line/40 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-[40px] md:p-[20px]"
      >
        {foto && (
          <span
            // max-h: een staande foto (4:5) maakt de kaart anders even hoog
            // als een hoofdstuk; boven die hoogte snijdt object-cover bij.
            // w-full: anders geeft het grid de breedte terug aan de ratio.
            className="g-volgend-beeld relative block w-full max-h-[340px] overflow-clip rounded-[16px] bg-background md:max-h-[400px]"
            style={{ aspectRatio: staand ? "4 / 5" : "4 / 3" }}
          >
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </span>
        )}
        <span className="flex min-w-0 flex-col px-[4px] pb-[8px] md:px-0 md:pb-0">
          <span id="volgend-label" className="tekst-annotatie text-muted">
            {t(TEKST.label)}
          </span>
          <span id="volgend-titel" lang="nl" className="mt-[12px] tekst-h3 break-words">
            {project.titel}
          </span>
          <span lang="nl" className="mt-[12px] max-w-[52ch] text-[15px] leading-relaxed text-foreground/80">
            {project.tekst}
          </span>
          <span className="mt-[20px] flex items-center justify-between gap-[12px] tekst-annotatie">
            <Status>{t(project.status)}</Status>
            <span aria-hidden className="text-[18px] leading-none text-foreground transition-transform group-hover:translate-x-[4px]">
              →
            </span>
          </span>
        </span>
      </Link>
      <p className="mt-[24px] text-[15px] text-muted">
        {t(TEKST.meer)}{" "}
        <Link
          href={localePath(locale, "/projects")}
          className="inline-flex min-h-[24px] items-center font-semibold text-foreground underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground"
        >
          {t(TEKST.alle)}
        </Link>
      </p>
    </nav>
  )
}
