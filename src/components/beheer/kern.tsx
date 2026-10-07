import { FASEN, PROJECTEN } from "@/lib/beheer/data"
import { euro } from "@/lib/format"

// De kern: alle projecten op één ring, per fase een sector, met de klok mee van
// aanvraag naar opgeleverd (naar de GRØNN Core in gronnstudio/gronncore). Puur
// SVG; de buitenste tikring draait langzaam en staat stil bij minder beweging.
const C = 300
const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const
}
const boog = (r: number, van: number, tot: number) => {
  const [x1, y1] = polar(r, van)
  const [x2, y2] = polar(r, tot)
  return `M${x1} ${y1} A${r} ${r} 0 ${tot - van > 180 ? 1 : 0} 1 ${x2} ${y2}`
}

export function Kern() {
  const sector = 360 / FASEN.length
  const open = PROJECTEN.filter((p) => p.fase === "Offerte")
  const waarde = open.reduce((s, p) => s + (p.bedrag ?? 0), 0)
  const actief = PROJECTEN.filter((p) => p.fase !== "Opgeleverd").length
  return (
    <svg viewBox="-110 0 820 600" className="kern h-auto w-full text-inkt max-w-[860px]" role="img" aria-label="Projecten per fase">
      <g className="kern-draai">
        {Array.from({ length: 120 }, (_, i) => {
          const [x1, y1] = polar(272, i * 3)
          const [x2, y2] = polar(i % 10 ? 266 : 258, i * 3)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={i % 10 ? 0.18 : 0.45} />
        })}
      </g>
      {FASEN.map((f, i) => {
        const van = i * sector + 3
        const tot = (i + 1) * sector - 3
        const telt = PROJECTEN.filter((p) => p.fase === f).length
        const [lx, ly] = polar(196, i * sector + 16)
        return (
          <g key={f}>
            <path d={boog(220, van, tot)} fill="none" stroke={telt ? "var(--oranje)" : "currentColor"} strokeOpacity={telt ? 0.9 : 0.2} strokeWidth="2" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="kern-label">
              {f.toUpperCase()} {telt}
            </text>
          </g>
        )
      })}
      <circle cx={C} cy={C} r={150} fill="none" stroke="currentColor" strokeOpacity="0.12" />
      <circle cx={C} cy={C} r={112} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="2 6" />
      {PROJECTEN.map((p) => {
        const i = FASEN.indexOf(p.fase)
        const zelfde = PROJECTEN.filter((q) => q.fase === p.fase)
        const n = zelfde.indexOf(p)
        const hoek = i * sector + (sector * (n + 1)) / (zelfde.length + 1)
        const [x, y] = polar(220, hoek)
        const [tx, ty] = polar(292, hoek)
        const r = 6 + Math.min(9, Math.sqrt((p.bedrag ?? 2000) / 1000) * 2.4)
        const rechts = tx >= C
        return (
          <g key={p.naam}>
            {p.aandacht && <circle cx={x} cy={y} r={r + 7} fill="none" stroke="var(--oranje)" strokeOpacity="0.6" className="kern-puls" />}
            <line x1={polar(220 + r + 4, hoek)[0]} y1={polar(220 + r + 4, hoek)[1]} x2={polar(284, hoek)[0]} y2={polar(284, hoek)[1]} stroke="currentColor" strokeOpacity="0.3" />
            <circle cx={x} cy={y} r={r} fill={p.fase === "Opgeleverd" ? "var(--gedempt)" : p.aandacht ? "var(--oranje)" : "var(--salie)"} />
            <text x={tx} y={ty - 4} textAnchor={rechts ? "start" : "end"} className="kern-naam">
              {p.naam}
            </text>
            <text x={tx} y={ty + 11} textAnchor={rechts ? "start" : "end"} className="kern-sub">
              {p.bedrag ? euro(p.bedrag) : p.fase.toLowerCase()}
            </text>
          </g>
        )
      })}
      <text x={C} y={C - 34} textAnchor="middle" className="kern-merk">GRØNN</text>
      <text x={C} y={C + 2} textAnchor="middle" className="kern-getal">{euro(waarde)}</text>
      <text x={C} y={C + 20} textAnchor="middle" className="kern-label">IN OPEN OFFERTES</text>
      <text x={C} y={C + 44} textAnchor="middle" className="kern-label">{actief} LOPEND · {open.length} OFFERTES</text>
    </svg>
  )
}
