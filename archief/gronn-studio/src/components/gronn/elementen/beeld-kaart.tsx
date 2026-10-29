import Image from "next/image"
import Link from "next/link"
import type { CSSProperties, ReactNode } from "react"

import { zachtAfbreken } from "@/lib/afbreken"

import { ConceptLabel } from "./concept-label"
import { Kanteling } from "./kanteling"

/**
 * Een klikbare kaart met beeld bovenaan, titel, korte tekst en een
 * voetregel (prijs, status). Het beeld zoomt licht bij hover; met een muis
 * kantelt de kaart licht mee en zegt de aanwijzer wat de klik doet
 * (`aanwijzer`, een sleutel uit CURSOR_LABELS in @/lib/motion).
 *
 * `concept` zet een label op het beeld; `conceptTekst` zegt wat het is
 * (Conceptbeeld, Stockfoto, Eigen werk · …). `alt` alleen als het beeld
 * iets toevoegt aan de kaart (eigen werk), anders blijft het decoratief.
 * `focus` kiest het zwaartepunt van de uitsnede, zoals bij `Beeld`.
 *
 * `vlak` vervangt de foto door een ander beeldvlak in dezelfde verhouding,
 * meestal een `IcoonVlak` (huisstijl Editie 02: een kaart zonder eigen
 * foto toont de tegel van haar niveau). Dan geen `beeld`, geen zoom en
 * geen conceptlabel — een tegel doet zich niet voor als foto.
 *
 * `vorm` is de plek in een `MetroRaster` (eigenaar, 29 sep 2026: "een
 * groot blok, twee kleine ernaast"), en werkt pas vanaf `lg`; eronder is
 * elke kaart `staand`:
 *  - `staand`: beeld in `ratio`, tekst eronder (de gewone kaart);
 *  - `groot`: het beeld vult alle hoogte die de tekst overlaat, zodat het
 *    grote blok even hoog is als de twee kleine kaarten ernaast;
 *  - `liggend`: beeld en tekst naast elkaar in de kolommen van het raster
 *    (φ : 1, tussenruimte 16px), zodat de rand van het beeld op de
 *    kolomlijn staat. `gespiegeld` zet het beeld rechts.
 * Een `vlak` in een grote kaart geeft zelf `groot` door aan zijn
 * `IcoonVlak` (dat moet zijn hoogte loslaten).
 */
export function BeeldKaart({
  href,
  beeld,
  vlak,
  alt = "",
  focus,
  concept = false,
  conceptTekst,
  titel,
  tekst,
  voet,
  ratio = "16/10",
  sizes,
  aanwijzer = "view",
  vorm = "staand",
  gespiegeld = false,
}: {
  href: string
  beeld?: string
  vlak?: ReactNode
  alt?: string
  focus?: string
  concept?: boolean
  conceptTekst?: string
  titel: ReactNode
  tekst?: ReactNode
  voet?: ReactNode
  ratio?: string
  sizes?: string
  aanwijzer?: string
  vorm?: "staand" | "groot" | "liggend"
  gespiegeld?: boolean
}) {
  const groot = vorm === "groot"
  const liggend = vorm === "liggend"
  // Het beeld: de verhouding als variabele (een style-prop wint van elke
  // klasse), zodat het grote blok hem vanaf lg kan loslaten.
  const beeldKlasse = groot
    ? "lg:aspect-auto lg:min-h-[240px] lg:flex-1"
    : liggend && gespiegeld
      ? "lg:order-2"
      : ""
  const standaardSizes = groot || liggend
    ? "(min-width: 1280px) 720px, (min-width: 1024px) 60vw, (min-width: 640px) 45vw, 90vw"
    : "(min-width: 1280px) 440px, (min-width: 1024px) 36vw, (min-width: 640px) 45vw, 90vw"
  return (
    <Kanteling className="h-full">
      <Link data-element="BeeldKaart"
        href={href}
        data-cursor={aanwijzer}
        data-vorm={vorm === "staand" ? undefined : vorm}
        className={`group flex h-full flex-col overflow-hidden rounded-[16px] border border-line/10 bg-background transition-colors hover:border-[var(--gronn-ember)] ${
          liggend
            ? `lg:grid lg:gap-x-[16px] ${gespiegeld ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.618fr)]" : "lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]"}`
            : ""
        }`}
      >
        {vlak ? (
          vorm === "staand" ? (
            vlak
          ) : (
            <span className={`flex flex-col ${beeldKlasse}`}>{vlak}</span>
          )
        ) : (
          <span
            className={`relative block aspect-(--kaart-ratio) overflow-hidden ${beeldKlasse}`}
            style={{ "--kaart-ratio": ratio } as CSSProperties}
          >
            {beeld && (
              <Image
                src={beeld}
                alt={alt}
                fill
                sizes={sizes ?? standaardSizes}
                style={focus ? { objectPosition: focus } : undefined}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            )}
            {concept && <ConceptLabel tekst={conceptTekst} />}
          </span>
        )}
        <span className={`flex flex-1 flex-col p-5 ${groot ? "lg:flex-none" : ""}`}>
          {/* Afbreken alleen op de vaste breekpunten (`zachtAfbreken`:
              "Onderhouds-abonnement", niet "Onderhoudsabonnemen-t"; 29 sep
              2026). `break-word` is alleen het vangnet voor een woord dat
              nergens past. */}
          <span className="tekst-h3 hyphens-manual [overflow-wrap:break-word]">{typeof titel === "string" ? zachtAfbreken(titel) : titel}</span>
          {tekst && <span className="mt-2 flex-1 text-[14px] leading-relaxed text-foreground/75">{tekst}</span>}
          <span className="mt-4 flex items-center justify-between font-mono text-[12px] text-muted">
            {voet}
            <span aria-hidden className="text-[var(--ember-text)] transition-transform group-hover:translate-x-1">→</span>
          </span>
        </span>
      </Link>
    </Kanteling>
  )
}
