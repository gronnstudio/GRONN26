import type { ReactNode } from "react"

import pkg from "../../../package.json"

import { DevToegang } from "@/components/dev/dev-toegang"
import { STACK, STACK_GROEPEN, type StackGroepId } from "@/lib/data/stack"
import { MERKEN } from "@/lib/data/stack-merken"
import { VIDEOS } from "@/lib/data/vijverrenovatie"
import { pick, type L, type Locale } from "@/lib/i18n"
import { localePath } from "@/lib/locale"
import type { Crumb } from "@/lib/nav"
import { BREEDTE, Kruimelpad, PaginaKop, PijlLink, ProjectVideo, StackKiezer, type StackKiezerKaart } from "./elementen"

// /stack: waar ik mee werk. De opvolger van de oude techniekpagina
// (concept/oude-site-v3), met dezelfde inhoud maar om door te bladeren:
// filteren per onderdeel, zoeken, en een kaart openen voor het waarom.
// De inhoud en haar bronnen staan in src/lib/data/stack.ts.

const VERSIES: Record<string, string> = {
  ...(pkg.dependencies as Record<string, string>),
  ...(pkg.devDependencies as Record<string, string>),
}

/** Geïnstalleerde versie zonder ^ of ~, of null. Gelezen bij het bouwen. */
const versie = (pakket: string) => VERSIES[pakket]?.replace(/^[\^~]/, "") ?? null

// Het statief in gebruik, bij Vastleggen (eigenaar, 29 sep 2026: "ulanzi
// MA38 statief, gebruik fotos van statief"). Nicks eigen clip van de
// vijverrenovatie (VIDEOS.V01), nooit een productfoto van Ulanzi. De
// Nederlandse teksten zijn die uit de data; de Engelse zijn er de
// vertaling van.
const STATIEF = VIDEOS.V01
const STATIEF_TEKST = {
  bijschrift: { nl: STATIEF.bijschrift ?? "", en: "Capturing the work on the fly, with an Ulanzi tripod on a rock." },
  beschrijving: {
    nl: STATIEF.beschrijving,
    en: "A small phone tripod on a mossy rock in the garden under construction, with sand and pipes in the background.",
  },
} satisfies Record<string, L>

export function StackPagina({ locale, trail }: { locale: Locale; trail: Crumb[] }) {
  const t = (v: L) => pick(v, locale)
  const kaarten: StackKiezerKaart[] = STACK.map((o) => ({
    id: o.id,
    naam: o.naam,
    groep: o.groep,
    soort: t(o.soort),
    wat: t(o.wat),
    waarom: o.waarom && t(o.waarom),
    afweging: o.afweging && t(o.afweging),
    pakketten: o.pakketten?.map((naam) => ({ naam, versie: versie(naam) })),
    link: o.project && { href: localePath(locale, o.project.pad), tekst: t(o.project.label) },
    favoriet: o.favoriet,
    merk: o.merk && MERKEN[o.merk],
  }))
  const beeld: Partial<Record<StackGroepId, ReactNode>> = {
    vastleggen: (
      <ProjectVideo
        video={STATIEF}
        glas
        verhouding="1 / 1"
        focus="50% 30%"
        bijschrift={t(STATIEF_TEKST.bijschrift)}
        beschrijving={t(STATIEF_TEKST.beschrijving)}
      />
    ),
  }
  return (
    <>
      <PaginaKop
        boven={<Kruimelpad trail={trail} locale={locale} />}
        label={t({ nl: "Techniek", en: "Tech stack" })}
        titel={t({ nl: "Waar ik mee werk.", en: "What I work with." })}
        intro={t({
          nl: "Van de telefoon op de bouwplaats tot de code onder deze site, wat er aan Claude gekoppeld is en hoe we het in de gaten houden. Kies een onderdeel of zoek op naam, en open een kaart om te lezen waarom ik het gebruik.",
          en: "From the phone on site to the code under this website, what is connected to Claude and how we keep watch. Choose a part or search by name, and open a card to read why I use it.",
        })}
      />
      <div className={`${BREEDTE} pb-24`}>
        <StackKiezer
          locale={locale}
          groepen={STACK_GROEPEN.map((g) => ({ id: g.id, label: t(g.label), uitleg: t(g.uitleg), beeld: beeld[g.id] }))}
          kaarten={kaarten}
        />
        <div className="mt-20 grid gap-4 border-t border-line/15 pt-8 sm:flex sm:items-center sm:justify-between">
          <p className="tekst-annotatie max-w-[60ch] text-muted">
            {t({
              nl: "De versienummers komen bij het bouwen uit de code zelf, dus ze kloppen met wat er draait.",
              en: "The version numbers are read from the code itself at build time, so they match what is running.",
            })}{" "}
            <DevToegang />
          </p>
          <PijlLink href={localePath(locale, "/contact")}>{t({ nl: "Vraag over de techniek? Stuur me een bericht", en: "A question about the tech? Send me a message" })}</PijlLink>
        </div>
      </div>
    </>
  )
}
