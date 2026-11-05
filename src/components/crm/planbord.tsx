import Link from "next/link"
import { Leeg } from "@/components/crm/kop"
import type { Klusdag } from "@/lib/crm/agenda"
import { planbord } from "@/lib/crm/planbord"

const kort = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("nl-NL", { day: "numeric", month: "short", timeZone: "UTC" })

/** Klussen als balken per week: zie in één oogopslag welke weken vol zitten. */
export function Planbord({ klus, nu, weken = 12 }: { klus: Klusdag[]; nu: string; weken?: number }) {
  const bord = planbord(klus, nu, weken)
  const nuWeek = bord.weken[0].maandag
  const vol = bord.weken.map((_, i) => bord.rijen.reduce((t, r) => t + r.dagen[i], 0))
  if (!bord.rijen.length) return <Leeg>De komende {weken} weken staat er geen klus in een calculatieplanning. Zet een startdatum in de planning van een calculatie.</Leeg>
  return (
    <section aria-label="Planbord" className="crm-lijst">
      <table className="crm-tabel min-w-[900px] table-fixed">
        <caption className="sr-only">Werkdagen per klus per week</caption>
        <thead>
          <tr>
            <th className="w-[180px]">Klus</th>
            {bord.weken.map((w) => (
              <th key={w.maandag} className={`text-center ${w.maandag === nuWeek ? "!text-accent-tekst" : ""}`}>
                <span className="block">KW {w.week}</span>
                <span className="block font-medium normal-case tracking-normal">{kort(w.maandag)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bord.rijen.map((r) => (
            <tr key={r.href}>
              <td>
                <Link href={r.href} className="crm-link flex min-w-0 items-center gap-2">
                  <span aria-hidden className="size-[10px] shrink-0 rounded-full" style={{ background: r.kleur }} />
                  <span className="truncate">{r.wie}</span>
                </Link>
                <span className="block truncate text-[12px] text-gedempt" title={r.fasen.join(", ")}>{r.fasen.join(", ")}</span>
              </td>
              {r.dagen.map((n, i) => (
                <td key={i} className="!px-0.5 text-center">
                  {n > 0 ? (
                    <span className="crm-cijfer block rounded-[6px] py-1.5 text-[12px] font-semibold text-inkt" style={{ background: `color-mix(in oklab, ${r.kleur} 24%, transparent)`, boxShadow: `inset 3px 0 0 ${r.kleur}` }}>
                      {n}<span className="sr-only"> {n === 1 ? "dag" : "dagen"} in KW {bord.weken[i].week}</span>
                    </span>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Werkdagen per week</td>
            {vol.map((n, i) => (
              <td key={i} className={`crm-cijfer !px-0.5 text-center ${n > 5 ? "text-let" : ""}`}>{n || "—"}</td>
            ))}
          </tr>
        </tfoot>
      </table>
    </section>
  )
}
