import type { CSSProperties } from "react"

// De bovenrand van de voet als een border in silhouet (eigenaar, 18 okt 2026:
// "make the transform more natural shape, a garden perhaps?"): zachte heuvels
// met grassen en een paar bolle bloemhoofdjes, in de kleur van de voet zelf.
// Geen tekening, alleen een omtrek. Bij het scrollen naar de voet groeit elke
// plant uit de grond, de een wat later dan de ander (eigenaar: "het zou iets
// moeten groeien bij scrollen"; zie .voet-plant in globals.css). Vast patroon (geen toeval bij het laden),
// zodat server en browser hetzelfde tekenen.

const B = 1440 // breedte van het tekenvlak
const H = 120 // hoogte

// kleine vaste reeks getallen tussen 0 en 1
function reeks(n: number) {
  let s = 7
  return Array.from({ length: n }, () => ((s = (s * 9301 + 49297) % 233280) / 233280))
}

const r = reeks(400)
let i = 0
const volgende = () => r[i++ % r.length]

// de grond: lage, golvende heuvels
const heuvels = (() => {
  let d = `M0 ${H} L0 ${H - 22}`
  for (let x = 0; x < B; x += 180) {
    const top = H - 26 - volgende() * 18
    d += ` Q${x + 90} ${top - 10} ${x + 180} ${H - 20 - volgende() * 8}`
  }
  return d + ` L${B} ${H} Z`
})()

type Plant = { x: number; h: number; soort: "gras" | "bol" | "schermer" }
const planten: Plant[] = []
for (let x = 14; x < B; x += 22 + volgende() * 30) {
  const k = volgende()
  planten.push({ x, h: 26 + volgende() * 60, soort: k < 0.55 ? "gras" : k < 0.8 ? "bol" : "schermer" })
}

export function VoetTuin() {
  return (
    <svg aria-hidden className="voet-tuin" viewBox={`0 0 ${B} ${H}`} preserveAspectRatio="xMidYMax slice">
      <path d={heuvels} />
      {planten.map((p, n) => (
        // --d: wanneer deze plant begint te groeien (0 tot 40 procent van het binnenkomen van de voet)
        <g key={n} className="voet-plant" style={{ "--d": Math.round(r[(n * 7) % r.length] * 40) } as CSSProperties}>
          <Plant {...p} n={n} />
        </g>
      ))}
    </svg>
  )
}

function Plant({ x, h, soort, n }: Plant & { n: number }) {
  const voet = H - 24
  const top = voet - h
  if (soort === "gras")
    return (
      <path d={`M${x - 3} ${voet} Q${x - 6} ${top + h / 2} ${x - 10} ${top + 6} Q${x - 1} ${top + h / 2} ${x + 1} ${voet} Z M${x} ${voet} Q${x + 2} ${top + h / 2} ${x + 7} ${top} Q${x + 4} ${top + h / 2} ${x + 4} ${voet} Z`} />
    )
  if (soort === "bol")
    return (
      <g>
        <rect x={x - 1} y={top} width="2.2" height={h} />
        <circle cx={x} cy={top} r={5 + (n % 3) * 2} />
      </g>
    )
  return (
    <g>
      <rect x={x - 1} y={top + 4} width="2.2" height={h - 4} />
      <path d={`M${x - 11} ${top + 4} Q${x} ${top - 8} ${x + 11} ${top + 4} Z`} />
    </g>
  )
}
