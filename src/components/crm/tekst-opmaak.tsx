// Een beschrijving zoals Nick hem typt of plakt, met de gewone tekens van
// Markdown: # en ## als kopjes, **vet**, tabellen met |, lijstjes met - en --- als lijn. Geen pakket: dit
// is alles wat in een werkomschrijving voorkomt. Al het andere blijft tekst.
import type { ReactNode } from "react"

const vet = (t: string): ReactNode[] => t.split(/(\*\*[^*]+\*\*)/g).map((s, i) => (s.startsWith("**") && s.endsWith("**") ? <strong key={i}>{s.slice(2, -2)}</strong> : s.replace(/\*+/g, (m) => (m.length === 1 ? m : ""))))
const cellen = (r: string) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
const scheiding = (r: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(r)

export function TekstOpmaak({ tekst, className = "" }: { tekst: string; className?: string }) {
  // Elke soort regeleinde (Windows, Mac, Unicode) en voorloopspaties tellen niet.
  const regels = tekst.split(/\r\n|\r|\n|\u2028|\u2029/).map((r) => r.replace(/^[\s\u00a0]+/, ""))
  const uit: ReactNode[] = []
  for (let i = 0; i < regels.length; i++) {
    const r = regels[i]
    if (r.trim().startsWith("|")) {
      const rijen: string[] = []
      while (i < regels.length && regels[i].trim().startsWith("|")) rijen.push(regels[i++])
      i--
      const [kop, ...rest] = rijen.filter((x) => !scheiding(x))
      const rechts = (j: number, rij: string[]) => j === rij.length - 1 && rij.length > 1
      uit.push(
        <table key={i} className="my-3 w-full border-collapse text-[15px]">
          <thead>
            <tr className="border-b border-lijn">{cellen(kop).map((c, j, a) => <th key={j} className={`py-2 pr-4 font-semibold ${rechts(j, a) ? "text-right whitespace-nowrap" : "text-left"}`}>{vet(c)}</th>)}</tr>
          </thead>
          <tbody>
            {rest.map((x, k) => (
              <tr key={k} className="border-b border-lijn align-top">{cellen(x).map((c, j, a) => <td key={j} className={`py-2 pr-4 ${rechts(j, a) ? "text-right whitespace-nowrap tabular-nums" : ""}`}>{vet(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      )
    } else if (/^#{1,3}\s/.test(r)) {
      const n = r.match(/^#+/)![0].length
      const t = vet(r.replace(/^#+\s*/, ""))
      uit.push(n === 1 ? <h2 key={i} className="syne m-0 mt-6 text-[24px] leading-[1.15]">{t}</h2> : <h3 key={i} className="m-0 mt-6 text-[17px] font-semibold">{t}</h3>)
    } else if (/^\s*-{3,}\s*$/.test(r)) {
      uit.push(<hr key={i} className="my-4 border-0 border-t border-lijn" />)
    } else if (/^\s*[-•]\s/.test(r)) {
      uit.push(<p key={i} className="m-0 mt-1 pl-4 -indent-3">• {vet(r.replace(/^\s*[-•]\s*/, ""))}</p>)
    } else if (r.trim()) {
      uit.push(<p key={i} className="m-0 mt-1.5">{vet(r)}</p>)
    } else {
      uit.push(<div key={i} className="h-2" />)
    }
  }
  return <div className={className}>{uit}</div>
}
