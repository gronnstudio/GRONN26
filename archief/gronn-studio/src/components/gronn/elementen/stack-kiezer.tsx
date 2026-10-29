"use client"

import { useId, useMemo, useState, type ReactNode } from "react"

import type { Merk } from "@/lib/data/stack-merken"
import { pick, type L, type Locale } from "@/lib/i18n"
import { KeuzePillen } from "./formulier"
import { PijlLink } from "./knop"
import { StackMerk } from "./stack-merk"
import { Status } from "./status"

/**
 * Gereedschap om door te bladeren: kies een groep met de pillen (echte
 * radio's, via `KeuzePillen`), of zoek op naam. Per groep een h2 met één
 * zin uitleg, daaronder compacte kaarten (16px): soort, naam, één zin.
 * Heeft een kaart meer te vertellen (waarom, afweging, pakket en
 * versie), dan is de kop een native `<details>`: Enter en spatie werken,
 * een schermlezer meldt "uitgeklapt", en zoeken op de pagina opent hem.
 * Een link naar een project staat altijd zichtbaar onder de kaart, niet
 * achter de klik.
 *
 * Filteren zet `hidden` op wat niet past, dus de server-HTML is de hele
 * lijst en er verspringt bij het laden niets. De telling ("7 van 22")
 * staat in een live-regio. Enige beweging: het plusteken draait naar een
 * kruis, en niet bij minder beweging (systeem of eigen keuze). Maten in
 * px.
 *
 * Een kaart met `merk` draagt het merkteken (`StackMerk`, 20px, één vlakke
 * kleur) voor de naam; zonder blijft hij tekst. Een groep met `beeld`
 * (eigen beeld, bv. een clip) zet dat vanaf lg in de derde kolom naast
 * de kaarten, daaronder onder de kaarten, zo breed als één kaart; het
 * beeld verdwijnt met zijn groep als die niet past.
 */

export type StackKiezerGroep = {
  id: string
  label: string
  uitleg: string
  /** Eigen beeld bij de groep. Alleen voor een groep met ≤ 2 kaarten per rij over. */
  beeld?: ReactNode
}

export type StackKiezerKaart = {
  id: string
  naam: string
  groep: string
  soort: string
  wat: string
  waarom?: string
  afweging?: string
  /** Pakketnaam met de geïnstalleerde versie (null: geen versie bekend). */
  pakketten?: { naam: string; versie: string | null }[]
  link?: { href: string; tekst: string }
  favoriet?: boolean
  /** Merkteken uit Simple Icons; alleen als het product er een heeft. */
  merk?: Merk
}

const ALLES = "alles"

const T = {
  legenda: { nl: "Kies een onderdeel", en: "Choose a part" },
  alles: { nl: "Alles", en: "Everything" },
  zoek: { nl: "Zoek op naam", en: "Search by name" },
  hint: { nl: "Bijvoorbeeld iPhone of Vercel", en: "For example iPhone or Vercel" },
  van: { nl: "van", en: "of" },
  stuks: { nl: "onderdelen", en: "items" },
  leeg: { nl: "Niets gevonden. Probeer een ander woord, of toon alles.", en: "Nothing found. Try another word, or show everything." },
  toonAlles: { nl: "Toon alles", en: "Show everything" },
  waarom: { nl: "Waarom", en: "Why" },
  afweging: { nl: "Afweging", en: "Trade-off" },
  pakket: { nl: "Pakket en versie", en: "Package and version" },
  favoriet: { nl: "Favoriet", en: "Favourite" },
} satisfies Record<string, L>

/** Kleine letters, zonder accenten: "Ø" en "é" vinden ook "o" en "e". */
const plat = (s: string) =>
  s
    .toLocaleLowerCase("nl")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ø/g, "o")

export function StackKiezer({
  groepen,
  kaarten,
  locale,
}: {
  groepen: StackKiezerGroep[]
  kaarten: StackKiezerKaart[]
  locale: Locale
}) {
  const t = (v: L) => pick(v, locale)
  const basis = useId()
  const [groep, setGroep] = useState(ALLES)
  const [zoek, setZoek] = useState("")

  const past = useMemo(() => {
    const woord = plat(zoek.trim())
    return (k: StackKiezerKaart) =>
      (groep === ALLES || k.groep === groep) &&
      (!woord ||
        plat([k.naam, k.soort, k.wat, ...(k.pakketten ?? []).map((p) => p.naam)].join(" ")).includes(woord))
  }, [groep, zoek])

  const zichtbaar = kaarten.filter(past).length
  const reset = () => {
    setGroep(ALLES)
    setZoek("")
  }

  return (
    <div data-element="StackKiezer" data-stack-kiezer="">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-end">
        <KeuzePillen
          legenda={t(T.legenda)}
          naam={`${basis}-groep`}
          gekozen={groep}
          onKies={setGroep}
          keuzes={[{ id: ALLES, label: t(T.alles), aantal: kaarten.length }, ...groepen.map((g) => ({ id: g.id, label: g.label, aantal: kaarten.filter((k) => k.groep === g.id).length }))].map((k) => ({
            id: k.id,
            tekst: (
              <span data-pil={k.id} className="inline-flex items-baseline gap-[8px]">
                {k.label}
                <span className="font-mono text-[12px] tabular-nums">{k.aantal}</span>
              </span>
            ),
          }))}
        />
        <label className="block text-[14px] font-semibold">
          {t(T.zoek)}
          <input
            type="search"
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            placeholder={t(T.hint)}
            autoComplete="off"
            className="mt-3 block min-h-[44px] w-full rounded-full border border-line/25 bg-background px-[18px] py-[10px] text-[16px] font-normal outline-none transition-colors placeholder:text-placeholder focus:border-[var(--gronn-ember)]"
          />
        </label>
      </div>

      <p aria-live="polite" data-stack-telling="" className="tekst-annotatie mt-8 text-muted">
        {zichtbaar} {t(T.van)} {kaarten.length} {t(T.stuks)}
      </p>

      {zichtbaar === 0 && (
        <div className="mt-8 rounded-[16px] border border-line/15 bg-surface px-[20px] py-[24px]">
          <p className="tekst-body">{t(T.leeg)}</p>
          <button
            type="button"
            onClick={reset}
            className="tekst-knop mt-4 inline-flex min-h-[44px] items-center rounded-full border border-line/25 px-[20px] hover:border-foreground"
          >
            {t(T.toonAlles)}
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-16">
        {groepen.map((g) => {
          const inGroep = kaarten.filter((k) => k.groep === g.id)
          const hier = inGroep.filter(past)
          const kopId = `${basis}-${g.id}`
          const lijst = (extra: string) => (
            <ul className={`grid items-start gap-[12px] sm:grid-cols-2 ${extra}`}>
              {inGroep.map((k) => (
                <li key={k.id} data-stack-kaart={k.id} hidden={!past(k)}>
                  <Kaart kaart={k} t={t} />
                </li>
              ))}
            </ul>
          )
          return (
            <section key={g.id} data-stack-groep={g.id} aria-labelledby={kopId} hidden={hier.length === 0}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line/15 pt-6">
                <h2 id={kopId} className="tekst-h3">
                  {g.label}
                </h2>
                <p className="tekst-annotatie text-muted">
                  {hier.length} {t(T.stuks)}
                </p>
              </div>
              <p className="tekst-body mt-3 max-w-[60ch] text-foreground/80">{g.uitleg}</p>
              {g.beeld ? (
                // Zelfde kolommen als de andere groepen: vanaf lg de lijst in
                // twee van de drie en het beeld in de derde; vanaf sm het beeld
                // zo breed als één kaart; op de telefoon de volle breedte.
                <div className="mt-8 grid items-start gap-[12px] sm:grid-cols-2 lg:grid-cols-3">
                  {lijst("sm:col-span-2")}
                  <div data-stack-beeld={g.id} className="mt-[12px] lg:mt-0">
                    {g.beeld}
                  </div>
                </div>
              ) : (
                lijst("mt-8 lg:grid-cols-3")
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Kaart({ kaart: k, t }: { kaart: StackKiezerKaart; t: (v: L) => string }) {
  const meer = Boolean(k.waarom || k.afweging || k.pakketten?.length)
  const kop = (
    <div className="min-w-0">
      <p className="tekst-annotatie flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
        <span>{k.soort}</span>
        {k.favoriet && <Status>{t(T.favoriet)}</Status>}
      </p>
      <h3 className="mt-2 flex items-center gap-[10px] font-heading text-[19px] leading-[26px] font-semibold tracking-tight [overflow-wrap:anywhere]">
        {k.merk && <StackMerk merk={k.merk} />}
        <span className="min-w-0">{k.naam}</span>
      </h3>
      <p className="mt-2 text-[15px] leading-[23px] text-foreground/80">{k.wat}</p>
    </div>
  )
  return (
    <article className="rounded-[16px] border border-line/15 bg-surface">
      {meer ? (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-[16px] rounded-[16px] px-[20px] py-[18px] [&::-webkit-details-marker]:hidden">
            {kop}
            <span
              aria-hidden
              className="mt-[2px] flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border border-line/25 text-[20px] leading-none text-[var(--ember-text)] group-open:rotate-45 motion-safe:transition-transform in-data-[motion=reduced]:transition-none"
            >
              +
            </span>
          </summary>
          <dl className="grid gap-4 border-t border-line/10 px-[20px] pt-[16px] pb-[20px] text-[15px] leading-[23px]">
            {k.waarom && (
              <div>
                <dt className="tekst-annotatie text-muted">{t(T.waarom)}</dt>
                <dd className="mt-1 text-foreground/85">{k.waarom}</dd>
              </div>
            )}
            {k.afweging && (
              <div>
                <dt className="tekst-annotatie text-muted">{t(T.afweging)}</dt>
                <dd className="mt-1 text-foreground/85">{k.afweging}</dd>
              </div>
            )}
            {k.pakketten && k.pakketten.length > 0 && (
              <div>
                <dt className="tekst-annotatie text-muted">{t(T.pakket)}</dt>
                {k.pakketten.map((p) => (
                  <dd key={p.naam} className="mt-1 font-mono text-[13px] [overflow-wrap:anywhere]">
                    {p.naam}
                    {p.versie && <span className="text-muted"> {p.versie}</span>}
                  </dd>
                ))}
              </div>
            )}
          </dl>
        </details>
      ) : (
        <div className="px-[20px] py-[18px]">{kop}</div>
      )}
      {k.link && (
        <div className="border-t border-line/10 px-[20px] py-[6px]">
          <PijlLink stil href={k.link.href}>{k.link.tekst}</PijlLink>
        </div>
      )}
    </article>
  )
}
