"use client"

import { BUSINESS } from "@/lib/business"
import type { LegalDocument } from "@/lib/data/legal"

// Een juridisch document op A4, om als pdf te bewaren.
//
// Waarom dit apart staat van de pagina op de site: die is er om gelezen te
// worden op een scherm, in het thema dat de bezoeker koos. Dit vel is er om
// als bijlage mee te gaan met een offerte — en dan moet het inkt op papier
// zijn, in elk thema hetzelfde, precies zoals `document-sheet.tsx` dat voor
// een offerte doet. Dezelfde constanten, met opzet: twee vellen van
// dezelfde studio die verschillend grijs gebruiken zien er niet uit als
// één huis.
//
// Er zit geen "download als pdf"-knop in dit project en die komt er ook
// niet: een pdf maken vraagt een headless browser, en die staat niet op
// Vercel. De browser van de eigenaar heeft er al één. Afdrukken → bewaren
// als pdf is dus geen omweg maar de kortste weg, en het is dezelfde weg
// die de offerte al neemt.
const INK = "#002a34"
const RULE = "#dad7ce"
const GREY = "#6e756e"
const BODY = "#2b2e2b"
const SOFT = "#f2f0ea"
const EMBER = "#f95a08"

const isBullet = (line: string) => line.startsWith("· ")

/** `**vet**`, en verder niets — zie de renderer op de publieke pagina. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <b key={i} style={{ fontWeight: 600, color: INK }}>
            {part.slice(2, -2)}
          </b>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export function LegalSheet({ doc }: { doc: LegalDocument }) {
  return (
    <article
      id="document-sheet"
      className="doc-sheet font-sans"
      style={{ background: "#fff", color: BODY, fontSize: "9.6pt", lineHeight: 1.55 }}
    >
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-green.png"
          alt=""
          style={{ width: "42mm", height: "auto", flex: "none" }}
        />
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
        {doc.audience === "consument"
          ? "Particuliere opdrachtgevers"
          : doc.audience === "zakelijk"
            ? "Zakelijke opdrachtgevers"
            : "Algemeen"}
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
        {doc.title}
      </h1>

      <p style={{ fontSize: "8pt", color: GREY, margin: "0 0 5mm" }}>
        Versie {doc.updated}
      </p>

      {/* De conceptband staat op het vel zelf en niet alleen op de site.
          Een pdf reist verder dan de pagina waar hij vandaan komt, en wie
          hem over een half jaar in een mailbijlage terugvindt moet nog
          steeds kunnen zien dat een jurist er niet naar heeft gekeken. */}
      {doc.status === "concept" && (
        <div
          style={{
            borderLeft: `2px solid ${EMBER}`,
            background: SOFT,
            padding: "4mm 5mm",
            marginBottom: "5mm",
            fontSize: "8.5pt",
            breakInside: "avoid",
          }}
        >
          Conceptversie — dit document is geschreven maar nog niet getoetst door
          een Nederlandse jurist. De wettelijke regels gelden onverkort en deze
          tekst kan u geen recht ontnemen.
        </div>
      )}

      <p style={{ fontSize: "10.5pt", fontWeight: 300, lineHeight: 1.5, color: "#4a524a", margin: "0 0 6mm" }}>
        {doc.intro}
      </p>

      {doc.sections.map((section, i) => (
        <section key={section.heading} style={{ breakInside: "avoid-page" }}>
          <h2
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
            {String(i + 1).padStart(2, "0")} · {section.heading}
          </h2>
          {section.body.map((paragraph, k) =>
            isBullet(paragraph) ? (
              <p
                key={k}
                style={{ margin: "0 0 1.5mm", paddingLeft: "4mm", textIndent: "-4mm" }}
              >
                <Rich text={paragraph} />
              </p>
            ) : (
              <p key={k} style={{ margin: "0 0 3.5mm" }}>
                <Rich text={paragraph} />
              </p>
            )
          )}
        </section>
      ))}

      <footer
        style={{
          marginTop: "8mm",
          borderTop: `0.75px solid ${RULE}`,
          paddingTop: "5mm",
          fontSize: "7.5pt",
          color: GREY,
          lineHeight: 1.5,
          breakInside: "avoid",
        }}
      >
        <b className="font-heading" style={{ fontWeight: 600, color: INK }}>
          {BUSINESS.name}
        </b>
        {" · "}
        {BUSINESS.address.street}, {BUSINESS.address.postalCode} {BUSINESS.address.city}
        {" · "}
        KvK {BUSINESS.kvk} · Btw {BUSINESS.btw} · {BUSINESS.email}
      </footer>
    </article>
  )
}
