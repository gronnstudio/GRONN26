"use client"

import { PageHero } from "@/components/page-hero"
import { useT } from "@/components/language-provider"
import { BUSINESS } from "@/lib/business"
import type { L } from "@/lib/i18n"
import { openPlaces, type LegalDocument, type LegalSection } from "@/lib/data/legal"
import { juridischePdf } from "@/lib/data/legal/pdf"
import { PdfKnop } from "@/components/gronn/elementen"
import { cn } from "@/lib/utils"

// Eén renderer voor elk juridisch document.
//
// De vorige opzet zette de tekst als JSX in de pagina, per pagina. Dat
// werkte tot er een tweede document bij kwam en de nummering, de
// conceptband en de opmaak van een opsomming twee keer bestonden. Nu is de
// tekst data (`src/lib/data/legal/`) en is dit de enige plek waar hij
// vorm krijgt.
//
// DE TEKST IS NEDERLANDS EN WORDT NIET VERTAALD. De chrome eromheen wel.
// Een juridische tekst in twee talen is twee juridische teksten, en bij de
// eerste wijziging die maar in één taal landt is de vraag welke van de
// twee geldt. Voor een Nederlands bedrijf met Nederlands recht is dat
// risico zonder opbrengst. De Engelse bezoeker krijgt daarom een regel die
// uitlegt dat dit geen fout is, plus een adres om in het Engels te vragen
// wat hij wil weten.
//
// `data-sensitive` blijft: de opnamemodus (privacy-toggle.tsx) blurt
// alinea's die bedrijfsgegevens bevatten, zodat Nick kan schermdelen
// zonder zijn adres uit te zenden.

const hasCredentials = (text: string) =>
  [
    BUSINESS.address.street,
    BUSINESS.phone,
    BUSINESS.email,
    BUSINESS.kvk,
    BUSINESS.btw,
  ].some((value) => value && text.includes(value))

/** Een regel die met "· " begint is een opsommingsitem, geen alinea. */
const isBullet = (line: string) => line.startsWith("· ")

/**
 * Losse regels worden weer één opsomming.
 *
 * De data houdt elke bullet als eigen string — dat leest prettig in het
 * bronbestand en het maakt een regel makkelijk te verplaatsen. Maar een
 * reeks losse `<p>`'s is voor een schermlezer geen lijst, en dat was
 * precies de fout die de audit op /nl/approach vond. Hier worden ze
 * daarom vóór het renderen weer samengevoegd tot één `<ul>`.
 */
type Chunk = { kind: "text"; text: string } | { kind: "list"; items: string[] }

function chunk(body: string[]): Chunk[] {
  const out: Chunk[] = []
  for (const line of body) {
    if (isBullet(line)) {
      const last = out[out.length - 1]
      if (last && last.kind === "list") last.items.push(line.slice(2))
      else out.push({ kind: "list", items: [line.slice(2)] })
    } else {
      out.push({ kind: "text", text: line })
    }
  }
  return out
}

/**
 * `**vet**` in de lopende tekst, en niets anders.
 *
 * Eén markering, met opzet: zodra er een tweede bij komt is dit een
 * markdown-parser, en dan hoort er een bibliotheek te staan in plaats van
 * deze functie. Tot die dag draagt dit precies wat de teksten nodig
 * hebben — de naam van een verwerker, het woord dat een lezer moet zien
 * staan.
 */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-medium text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function Section({ section, index }: { section: LegalSection; index: number }) {
  return (
    <section>
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] tabular-nums tracking-[0.18em] text-[color:var(--ember-text)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="font-heading text-xl font-semibold">{section.heading}</h2>
      </div>
      <div className="mt-4 space-y-4 border-l border-line/15 pl-4 sm:pl-6">
        {chunk(section.body).map((c, i) =>
          c.kind === "list" ? (
            <ul key={i} className="space-y-2">
              {c.items.map((item) => (
                <li
                  key={item.slice(0, 40)}
                  data-sensitive={hasCredentials(item) || undefined}
                  className="relative pl-4 leading-relaxed text-foreground/80 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-gronn-ember"
                >
                  <Rich text={item} />
                </li>
              ))}
            </ul>
          ) : (
            <p
              key={i}
              data-sensitive={hasCredentials(c.text) || undefined}
              className="leading-relaxed text-foreground/80"
            >
              <Rich text={c.text} />
            </p>
          )
        )}
      </div>
    </section>
  )
}

export function LegalDocumentView({
  doc,
  label,
  lines,
}: {
  doc: LegalDocument
  label: L
  lines: L[]
}) {
  const t = useT()
  const pdf = juridischePdf(doc)

  return (
    <>
      <PageHero label={label} lines={lines} />
      {/* De data-attributen lezen scripts/juridisch-pdf.mjs en de test: welk
          document dit is, van wanneer, en hoeveel gaten er nog in zitten. */}
      <div
        data-juridisch={doc.id}
        data-updated={doc.updated}
        data-open={openPlaces(doc).length}
        className="mx-auto w-full max-w-3xl px-4 pb-32 sm:px-6"
      >
        {pdf && (
          <div className="mb-10">
            <PdfKnop href={pdf.href} bestandsnaam={pdf.naam}>
              {t({ nl: "Download als PDF", en: "Download as PDF" })}
            </PdfKnop>
          </div>
        )}
        {/* De taalregel staat vóór alles, ook vóór de conceptband: wie
            hier in het Engels landt moet niet eerst een Nederlandse
            waarschuwing lezen om te begrijpen waarom de rest Nederlands
            is. */}
        <p className="mb-6 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-muted">
          {t({
            en: "This document is in Dutch and the Dutch text is the binding one. Ask us anything about it in English — we answer in English.",
            nl: "Dit document is in het Nederlands; de Nederlandse tekst is bindend.",
          })}
        </p>

        {doc.status === "concept" && (
          <p
            className={cn(
              "mb-12 rounded-lg border border-gronn-ember/40 bg-gronn-ember/10 p-4",
              "text-sm leading-relaxed text-foreground/80"
            )}
          >
            {t({
              en: "Draft version — this document is a working paper and will be finalised after review by a Dutch lawyer. Until then, the statutory rules apply in full and this text cannot take a right away from you.",
              nl: "Conceptversie — dit document is een werkdocument en wordt definitief gemaakt na toetsing door een Nederlandse jurist. Tot die tijd gelden de wettelijke regels onverkort en kan deze tekst je geen recht ontnemen.",
            })}
          </p>
        )}

        {/* De tekst zelf: hiervan maakt het PDF-script zijn vingerafdruk. */}
        <div data-juridisch-tekst="">
          <p className="mb-12 leading-relaxed text-foreground/80">{doc.intro}</p>

          <div className="space-y-12">
            {doc.sections.map((section, i) => (
              <Section key={section.heading} section={section} index={i} />
            ))}
          </div>
        </div>

        <p className="mt-16 font-mono text-xs uppercase tracking-[0.2em] text-muted">
          {t({ en: "Last changed", nl: "Laatst gewijzigd" })} {doc.updated}
          <span data-print="hide">
            {" · "}
            {pdf
              ? t({ en: "also as PDF, above", nl: "ook als PDF, bovenaan" })
              : t({ en: "printable via your browser", nl: "printbaar via je browser" })}
          </span>
        </p>
      </div>
    </>
  )
}
