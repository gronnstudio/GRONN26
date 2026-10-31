"use client"

import { BUSINESS } from "@/lib/business"
import { euro, totals, type StudioDocument, type TextBlock } from "@/lib/documents"

// The printed sheet: A4, ink on paper, identical in every theme.
//
// This is the second acknowledged exception to "never hardcode
// theme-dependent colour" (the first is `photo-glass`). A quote or
// invoice is a business document that leaves the site as PDF or paper —
// it cannot inherit Blue Hour's indigo ground because the owner happened
// to be working after seven. Ink, paper and rules are therefore fixed
// constants here, and only the surrounding dashboard chrome is themed.
//
// Type is the site's own: Syne headings, Montserrat body, Geist Mono for
// field annotations — the same voice as the website, on paper.
const INK = "#002a34"
const RULE = "#dad7ce"
const RULE_SOFT = "#e0ded6"
const GREY = "#6e756e"
const BODY = "#2b2e2b"
const SOFT = "#f2f0ea"
const EMBER = "#f95a08"
const INCLUDED = "#4a6b52"

/** Blank lines separate paragraphs; single newlines are line breaks. */
function paragraphs(body: string) {
  return body
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
}

function Lines({ text }: { text: string }) {
  const lines = text.split("\n")
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}

function Block({ block }: { block: TextBlock }) {
  const body = paragraphs(block.body)
  if (block.callout) {
    return (
      <div
        style={{
          borderLeft: `2px solid ${EMBER}`,
          background: SOFT,
          padding: "4mm 5mm",
          margin: "5mm 0",
          fontSize: "8.5pt",
          breakInside: "avoid",
        }}
      >
        {block.heading && (
          <span
            className="font-heading"
            style={{
              display: "block",
              fontWeight: 600,
              fontSize: "9.5pt",
              color: INK,
              marginBottom: "2mm",
            }}
          >
            {block.heading}
          </span>
        )}
        {body.map((p, i) => (
          <p key={i} style={{ margin: i === body.length - 1 ? 0 : "0 0 3.5mm" }}>
            <Lines text={p} />
          </p>
        ))}
      </div>
    )
  }
  return (
    <>
      {block.heading && <SheetHeading>{block.heading}</SheetHeading>}
      {body.map((p, i) => (
        <p key={i} style={{ margin: "0 0 3.5mm" }}>
          <Lines text={p} />
        </p>
      ))}
    </>
  )
}

function SheetHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-heading"
      style={{
        fontWeight: 600,
        fontSize: "8pt",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: INK,
        margin: "7mm 0 2.5mm",
        paddingBottom: "1.5mm",
        borderBottom: `0.5px solid ${RULE}`,
        breakAfter: "avoid",
      }}
    >
      {children}
    </h3>
  )
}

export function DocumentSheet({
  doc,
  iban,
}: {
  doc: StudioDocument
  /**
   * Handed down from the server page after its session check, rather
   * than imported. Importing it here would put the studio's account
   * number back into a client chunk — which is exactly how it came to
   * be on every public page of the site.
   */
  iban: string
}) {
  const isInvoice = doc.kind === "factuur"
  const sums = totals(doc)
  const cols = doc.columns

  // Een bijlage is geen factuur en mag er ook niet één lijken.
  //
  // De boekhouding draait elders; dat pakket mint het nummer en zet de
  // betaallink in de mail. Dit vel legt uit wat er in dat bedrag zit. Wie
  // hier een eigen factuurnummer, een vervaldatum en een IBAN onder zet,
  // stuurt de klant een tweede betalingsverzoek voor dezelfde schuld — en
  // dan is de vraag welk van de twee de factuur is.
  const isAnnex = doc.annex === true

  const meta: [string, string][] = [["Voor", doc.client]]
  if (isAnnex) {
    // `number` draagt hier het nummer van de factuur waar dit bij hoort,
    // niet een eigen nummer. Geen vervaldatum: die staat op die factuur.
    meta.push(["Bij factuur", doc.number], ["Datum", doc.date])
  } else {
    meta.push(
      [`${isInvoice ? "Factuur" : "Offerte"}nummer`, doc.number],
      ["Datum", doc.date],
      [isInvoice ? "Vervaldatum" : "Geldig tot", doc.deadline]
    )
  }
  if (doc.extraLabel.trim()) meta.push([doc.extraLabel, doc.extraValue])

  // Every money cell: right-aligned, never wrapped, and never touching
  // its neighbour. The gutter is the reason it is here — with two or
  // three variant columns the headings are wider than the amounts under
  // them, so without a left inset "Basisaanleg" and "Met cortenstaal"
  // butt into one word. Declared after the cells' own `padding`
  // shorthand at every call site, so the longhand wins.
  const right = {
    textAlign: "right" as const,
    whiteSpace: "nowrap" as const,
    paddingLeft: "6mm",
  }

  return (
    <article
      id="document-sheet"
      className="doc-sheet font-sans"
      style={{ background: "#fff", color: BODY, fontSize: "9.6pt", lineHeight: 1.55 }}
    >
      {/* Masthead. The full logo already carries the name and the
          tagline, so it prints alone; the compact mark and the
          name-only setting are for when a quieter head is wanted.
          No contact block here: address, phone, email, KvK, BTW and
          IBAN all belong to the sign-off at the foot, and printing them
          twice on one page was the same information competing with
          itself. */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: `1.5px solid ${INK}`,
          paddingBottom: "5mm",
          marginBottom: "6mm",
        }}
      >
        {/* Plain img: the sheet is printed and exported to PDF, where the
            optimiser's srcset and lazy loading buy nothing. */}
        {doc.masthead === "logo" && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/logo-green.png"
            alt=""
            style={{ width: "42mm", height: "auto", flex: "none" }}
          />
        )}
        {doc.masthead === "mark" && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src="/brandmark.png"
            alt=""
            style={{ width: "9mm", height: "auto", flex: "none" }}
          />
        )}
        {doc.masthead !== "logo" && (
          <div>
            <div
              className="font-heading"
              style={{
                fontWeight: 600,
                fontSize: "15pt",
                color: INK,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              {BUSINESS.name}
            </div>
            <div
              className="font-mono"
              style={{
                fontSize: "7pt",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: GREY,
                marginTop: "1.5mm",
              }}
            >
              {BUSINESS.tagline}
            </div>
          </div>
        )}
      </header>

      <div
        className="font-heading"
        style={{
          fontWeight: 600,
          fontSize: "8pt",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: EMBER,
          marginBottom: "2mm",
        }}
      >
        {isAnnex ? "Specificatie" : isInvoice ? "Factuur" : "Offerte"}
      </div>

      <h1
        className="font-heading"
        style={{
          fontWeight: 600,
          fontSize: "17pt",
          color: INK,
          margin: "0 0 2.5mm",
          lineHeight: 1.22,
          letterSpacing: "-0.015em",
        }}
      >
        <Lines text={doc.title} />
      </h1>

      {doc.intro.trim() && (
        <p
          style={{
            fontSize: "10.5pt",
            fontWeight: 300,
            lineHeight: 1.5,
            color: "#4a524a",
            margin: "0 0 5mm",
          }}
        >
          <Lines text={doc.intro} />
        </p>
      )}

      {/* Meta panel */}
      <div style={{ background: SOFT, padding: "4mm 5mm", marginBottom: "5mm", fontSize: "8.5pt" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {meta.map(([key, value]) => (
              <tr key={key}>
                <td style={{ padding: "1mm 0", verticalAlign: "top", color: GREY, width: "34mm" }}>
                  {key}
                </td>
                <td style={{ padding: "1mm 0", verticalAlign: "top" }}>
                  <Lines text={value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {doc.blocksBefore.map((block) => (
        <Block key={block.id} block={block} />
      ))}

      <SheetHeading>{doc.amountsHeading}</SheetHeading>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          margin: "3mm 0 4mm",
          fontSize: "8.5pt",
          breakInside: "avoid",
        }}
      >
        <thead>
          <tr>
            <th
              className="font-heading"
              style={{
                fontWeight: 600,
                textAlign: "left",
                fontSize: "7pt",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: GREY,
                borderBottom: `0.75px solid ${INK}`,
                padding: "0 0 2mm",
              }}
            >
              Omschrijving
            </th>
            {Array.from({ length: cols }, (_, k) => (
              <th
                key={k}
                className="font-heading"
                style={{
                  fontWeight: 600,
                  fontSize: "7pt",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: GREY,
                  borderBottom: `0.75px solid ${INK}`,
                  padding: "0 0 2mm",
                  ...right,
                }}
              >
                {cols === 1 ? "Bedrag" : doc.variantNames[k]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {doc.items.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: "1.8mm 0", borderBottom: `0.5px solid ${RULE_SOFT}`, verticalAlign: "top" }}>
                {item.description}
                {item.detail && (
                  <>
                    <br />
                    <span style={{ fontSize: "8pt", color: GREY, lineHeight: 1.5 }}>
                      {item.detail}
                    </span>
                  </>
                )}
                {item.included && (
                  <>
                    <br />
                    <span style={{ color: INCLUDED, fontSize: "8pt", fontStyle: "italic" }}>
                      inbegrepen
                    </span>
                  </>
                )}
              </td>
              {Array.from({ length: cols }, (_, k) => (
                <td
                  key={k}
                  style={{
                    padding: "1.8mm 0",
                    borderBottom: `0.5px solid ${RULE_SOFT}`,
                    verticalAlign: "top",
                    ...right,
                  }}
                >
                  {item.included ? "—" : euro(item.amounts[k])}
                </td>
              ))}
            </tr>
          ))}

          <tr>
            <td style={{ paddingTop: "3mm", ...right }}>Subtotaal excl. btw</td>
            {sums.subtotals.map((value, k) => (
              <td key={k} style={{ paddingTop: "3mm", ...right }}>
                {euro(value)}
              </td>
            ))}
          </tr>
          <tr>
            <td style={{ padding: "1.8mm 0", ...right }}>Btw {doc.vatRate}%</td>
            {sums.vat.map((value, k) => (
              <td key={k} style={{ padding: "1.8mm 0", ...right }}>
                {euro(value)}
              </td>
            ))}
          </tr>
          <tr>
            <td
              style={{
                borderTop: `1px solid ${INK}`,
                fontWeight: 600,
                fontSize: "11pt",
                color: INK,
                paddingTop: "3mm",
                ...right,
              }}
            >
              Totaal incl. btw
            </td>
            {sums.gross.map((value, k) => (
              <td
                key={k}
                className="font-heading"
                style={{
                  borderTop: `1px solid ${INK}`,
                  fontWeight: 600,
                  fontSize: "11pt",
                  color: INK,
                  paddingTop: "3mm",
                  ...right,
                }}
              >
                {euro(value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {doc.blocksAfter.map((block) => (
        <Block key={block.id} block={block} />
      ))}

      {/* Sign-off */}
      <footer
        style={{
          marginTop: "7mm",
          borderTop: `0.75px solid ${RULE}`,
          paddingTop: "5mm",
          breakInside: "avoid",
        }}
      >
        <p style={{ fontSize: "8pt", color: GREY, lineHeight: 1.5, margin: "0 0 3.5mm" }}>
          {isAnnex ? (
            <>
              Dit is een specificatie bij factuur {doc.number} en geen
              betalingsverzoek. Betalen gaat via die factuur; daar staan het
              rekeningnummer en de betaaltermijn op. Vragen over deze
              uitsplitsing mag je altijd stellen.
            </>
          ) : isInvoice ? (
            <>
              Graag {euro(sums.gross[0])} overmaken op {iban} ten name van{" "}
              {BUSINESS.name}, onder vermelding van factuurnummer {doc.number}. Betaaltermijn
              tot {doc.deadline}.
            </>
          ) : (
            <>
              Akkoord? Een bevestiging per mail of app is voldoende, dan plan ik een datum in.
              Vragen over het plan mag je altijd stellen — app of mail werkt het beste, dan kan
              ik er rustig en volledig antwoord op geven. Ik sta doordeweeks meestal bij klanten
              in de tuin, dus bellen lukt vaak net niet op het goede moment.
            </>
          )}
        </p>

        <div
          style={{
            display: "flex",
            gap: "8mm",
            marginTop: "6mm",
            fontSize: "7.5pt",
            color: GREY,
            lineHeight: 1.5,
          }}
        >
          <div>
            <b className="font-heading" style={{ fontWeight: 600, color: INK }}>
              {BUSINESS.name}
            </b>
            <br />
            {BUSINESS.address.street}
            <br />
            {BUSINESS.address.postalCode} {BUSINESS.address.city} ({BUSINESS.address.province})
            <br />
            {BUSINESS.address.country}
          </div>
          <div>
            {BUSINESS.phone}
            <br />
            {BUSINESS.email}
          </div>
          <div>
            KvK {BUSINESS.kvk}
            <br />
            Btw {BUSINESS.btw}
            {!isAnnex && (
              <>
                <br />
                IBAN {iban}
              </>
            )}
          </div>
        </div>

        <p style={{ fontSize: "8pt", color: GREY, lineHeight: 1.5, marginTop: "4mm" }}>
          {!isInvoice && !isAnnex && `Prijzen zijn geldig tot ${doc.deadline}. `}
          Op al onze werkzaamheden zijn onze algemene voorwaarden van toepassing.
        </p>
      </footer>
    </article>
  )
}
