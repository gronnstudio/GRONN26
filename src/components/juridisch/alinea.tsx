import { Fragment } from "react"

// Een alinea uit een juridisch document, letterlijk. Twee markeringen uit
// de data: **vet** en [[open plek]]. Een open plek blijft zichtbaar als
// "[NOG AANLEVEREN: …]", zoals het wireframe dat toont.
const DELEN = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g

export function Alinea({ tekst }: { tekst: string }) {
  return (
    <>
      {tekst.split(DELEN).map((deel, i) => {
        if (deel.startsWith("**") && deel.endsWith("**")) {
          return <strong key={i}>{inhoud(deel.slice(2, -2))}</strong>
        }
        if (deel.startsWith("[[")) return <Open key={i} wat={deel.slice(2, -2)} />
        return <Fragment key={i}>{deel}</Fragment>
      })}
    </>
  )
}

// Vet kan zelf een open plek bevatten: "**[[boekhoudsoftware]]**".
function inhoud(tekst: string) {
  return tekst.startsWith("[[") && tekst.endsWith("]]") ? <Open wat={tekst.slice(2, -2)} /> : tekst
}

function Open({ wat }: { wat: string }) {
  return (
    <span className="border border-dashed border-gedempt px-1.5 py-px text-[13px] font-medium tracking-[.02em] text-gedempt [overflow-wrap:anywhere]">
      [NOG AANLEVEREN: {wat}]
    </span>
  )
}

/** De body van een sectie: gewone alinea's en "· "-regels als lijst. */
export function SectieBody({ body }: { body: string[] }) {
  const blokken: (string | string[])[] = []
  for (const regel of body) {
    if (regel.startsWith("· ")) {
      const vorige = blokken[blokken.length - 1]
      if (Array.isArray(vorige)) vorige.push(regel.slice(2))
      else blokken.push([regel.slice(2)])
    } else blokken.push(regel)
  }
  return (
    <>
      {blokken.map((b, i) =>
        Array.isArray(b) ? (
          <ul key={i} className="mt-0 mb-3.5 list-none p-0">
            {b.map((li, j) => (
              <li key={j} className="border-t border-lijn py-2 last:border-b">
                <Alinea tekst={li} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="mt-0 mb-3.5">
            <Alinea tekst={b} />
          </p>
        )
      )}
    </>
  )
}
