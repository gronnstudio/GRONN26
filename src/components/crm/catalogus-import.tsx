"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import type { ImportUitkomst } from "@/lib/crm/catalogus-import"

// Een prijslijst van een leverancier inlezen (CSV, zelfde kolommen als de export).
function Knop() {
  const { pending } = useFormStatus()
  return (
    <button className="crm-knop" disabled={pending}>
      {pending ? "Inlezen…" : "Inlezen"}
    </button>
  )
}

const aantal = (n: number, een: string, meer: string) => `${n.toLocaleString("nl-NL")} ${n === 1 ? een : meer}`

export function CatalogusImport({ actie }: { actie: (vorig: ImportUitkomst | null, d: FormData) => Promise<ImportUitkomst> }) {
  const [uit, verstuur] = useActionState(actie, null)
  return (
    <details className="crm-paneel mt-4 p-4" open={uit !== null}>
      <summary className="cursor-pointer font-medium">Prijslijst inlezen (CSV)</summary>
      <p className="mt-2 text-[13px] text-gedempt">
        Dezelfde kolommen als de download: Naam, Soort, Eenheid, Inkoop excl. btw, Opslag %, Btw %, Afval %, Leverancier, Artikelnummer, Link, Bijgewerkt en eventueel Groep. Een artikel met dezelfde leverancier en hetzelfde artikelnummer wordt bijgewerkt; de oude prijs komt in de historie. Je eigen opslag en afval blijven staan.
      </p>
      <form action={verstuur} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="file" name="bestand" accept=".csv,text/csv" required aria-label="CSV-bestand" className="text-[13px]" />
        <Knop />
      </form>
      {uit && (
        <p role={uit.fout ? "alert" : "status"} className="mt-3 text-[13px]">
          {uit.fout ??
            `Klaar: ${aantal(uit.nieuw, "nieuw item", "nieuwe items")}, ${aantal(uit.bijgewerkt, "bijgewerkt", "bijgewerkt")}, ${aantal(uit.gelijk, "ongewijzigd", "ongewijzigd")}.` +
              (uit.afgewezen.length ? ` ${aantal(uit.afgewezen.length, "regel", "regels")} overgeslagen zonder naam of prijs (regel ${uit.afgewezen.slice(0, 10).join(", ")}${uit.afgewezen.length > 10 ? ", …" : ""}).` : "")}
        </p>
      )}
    </details>
  )
}
