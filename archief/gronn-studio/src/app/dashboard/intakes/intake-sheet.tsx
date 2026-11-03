"use client"

import { BUSINESS } from "@/lib/business"
import type { IntakeSubmission } from "@/lib/intake-archive"

// One intake as a printed sheet, in the studio's own hand.
//
// The same A4 geometry and the same ink as the quotes and invoices next
// door: `.doc-sheet` is 210×297mm with an 18mm margin, and the print
// rules in globals.css already know how to turn it into a page. Building
// a second house style for this would have meant two documents from one
// studio that do not look like each other.
//
// It therefore inherits that file's acknowledged exception too. A sheet
// that leaves the site as PDF or paper cannot take its colours from the
// visitor's palette — a Blue Hour intake printed at eight in the evening
// would come out indigo. Ink, paper and rules are fixed constants.

const INK = "#002a34"
const RULE = "#dad7ce"
const GREY = "#6e756e"
const BODY = "#2b2e2b"
const SOFT = "#f2f0ea"
const EMBER = "#f95a08"

type Line =
  | { kind: "section"; text: string }
  | { kind: "question"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "answer"; text: string }

/**
 * The transcript, back into the shape it was written in.
 *
 * The form writes markdown-ish text — `##` for a section, `**…**` for a
 * question, `- ` for a chosen material — because that is what reads well
 * in an inbox. On paper those need to be a heading, a label and a list,
 * so they are parsed rather than printed as asterisks.
 */
function parse(transcript: string): Line[] {
  const out: Line[] = []
  for (const raw of transcript.split("\n")) {
    const line = raw.trim()
    if (!line) continue
    // The document's own title: the masthead says it already.
    if (line.startsWith("# ")) continue
    if (line.startsWith("## ")) {
      out.push({ kind: "section", text: line.slice(3).trim() })
      continue
    }
    if (line.startsWith("**") && line.endsWith("**")) {
      out.push({ kind: "question", text: line.slice(2, -2).trim() })
      continue
    }
    if (line.startsWith("- ")) {
      out.push({ kind: "bullet", text: line.slice(2).trim() })
      continue
    }
    out.push({ kind: "answer", text: line })
  }
  return out
}

function when(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
}

export function IntakeSheet({ s }: { s: IntakeSubmission }) {
  const lines = parse(s.transcript)
  const meta: [string, string][] = [
    ["Project", s.project || "—"],
    ["Opdrachtgever", s.name || "—"],
    ["Contact", s.contact || "—"],
    ["Ontvangen", when(s.receivedAt)],
    ["Kenmerk", s.reference],
    [
      "Bestanden",
      s.files.length ? String(s.files.length) : "geen",
    ],
    ...(s.filesFailed > 0
      ? ([["Niet aangekomen", `${s.filesFailed}`]] as [string, string][])
      : []),
  ]

  return (
    <article
      className="doc-sheet font-sans"
      style={{ background: "#fff", color: BODY, fontSize: "9.6pt", lineHeight: 1.55 }}
    >
      {/* Plain img: this is printed and exported to PDF, where the
          optimiser's srcset and lazy loading buy nothing. */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "12px",
          borderBottom: `1.5px solid ${INK}`,
          paddingBottom: "5mm",
          marginBottom: "6mm",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-green.png" alt="" style={{ width: "42mm", height: "auto", flex: "none" }} />
        <div
          className="font-mono"
          style={{
            fontSize: "7pt",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: GREY,
            textAlign: "right",
            whiteSpace: "nowrap",
          }}
        >
          Intake tuinontwerp
        </div>
      </header>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "7mm",
          breakInside: "avoid",
        }}
      >
        <tbody>
          {meta.map(([label, value]) => (
            <tr key={label}>
              <td
                className="font-mono"
                style={{
                  width: "34mm",
                  padding: "1.4mm 0",
                  fontSize: "7pt",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: GREY,
                  verticalAlign: "top",
                }}
              >
                {label}
              </td>
              <td style={{ padding: "1.4mm 0", verticalAlign: "top" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {lines.map((line, i) => {
        if (line.kind === "section") {
          return (
            <h2
              key={i}
              className="font-heading"
              style={{
                fontSize: "11pt",
                fontWeight: 600,
                color: INK,
                letterSpacing: "-0.01em",
                borderTop: `1px solid ${RULE}`,
                paddingTop: "3.5mm",
                marginTop: "7mm",
                marginBottom: "3mm",
                breakAfter: "avoid",
                breakInside: "avoid",
              }}
            >
              {line.text}
            </h2>
          )
        }
        if (line.kind === "question") {
          return (
            <p
              key={i}
              style={{
                fontWeight: 600,
                color: INK,
                margin: "4mm 0 1mm",
                breakAfter: "avoid",
                breakInside: "avoid",
              }}
            >
              {line.text}
            </p>
          )
        }
        if (line.kind === "bullet") {
          return (
            <p
              key={i}
              style={{
                margin: "0 0 1mm",
                paddingLeft: "5mm",
                position: "relative",
                breakInside: "avoid",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: "1.6mm",
                  width: "1.6mm",
                  height: "1.6mm",
                  background: EMBER,
                }}
              />
              {line.text}
            </p>
          )
        }
        return (
          <p key={i} style={{ margin: "0 0 2mm", breakInside: "avoid" }}>
            {line.text}
          </p>
        )
      })}

      {s.files.length > 0 && (
        <section style={{ marginTop: "8mm", breakInside: "avoid" }}>
          <h2
            className="font-heading"
            style={{
              fontSize: "11pt",
              fontWeight: 600,
              color: INK,
              borderTop: `1px solid ${RULE}`,
              paddingTop: "3.5mm",
              marginBottom: "3mm",
            }}
          >
            Meegestuurde bestanden
          </h2>
          {/* Names, not thumbnails. The files are private and live in the
              panel; a printed sheet that carried a grid of photographs
              would be a worse copy of them and would leave the building
              with the paper. */}
          <div
            className="font-mono"
            style={{ background: SOFT, padding: "4mm 5mm", fontSize: "8pt", color: BODY }}
          >
            {s.files.map((f) => (
              <div key={f.pathname} style={{ padding: "0.7mm 0" }}>
                {f.name}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer
        className="font-mono"
        style={{
          marginTop: "10mm",
          paddingTop: "3mm",
          borderTop: `1px solid ${RULE}`,
          fontSize: "7pt",
          letterSpacing: "0.1em",
          color: GREY,
          display: "flex",
          justifyContent: "space-between",
          gap: "6mm",
        }}
      >
        <span>
          {BUSINESS.name} · {BUSINESS.address.street} · {BUSINESS.address.postalCode}{" "}
          {BUSINESS.address.city}
        </span>
        <span style={{ whiteSpace: "nowrap" }}>
          {BUSINESS.email} · KVK {BUSINESS.kvk}
        </span>
      </footer>
    </article>
  )
}
