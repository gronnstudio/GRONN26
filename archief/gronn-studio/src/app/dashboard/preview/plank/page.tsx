import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { DashboardShell } from "@/app/dashboard/dashboard-shell"
import { ownerNav, ownerPhoneNav } from "@/app/dashboard/nav"
import { DocumentShelf } from "@/app/dashboard/documenten/document-shelf"
import { blankDocument, type StudioDocument } from "@/lib/documents"

export const metadata: Metadata = {
  title: "Plank preview",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// De documentenplank, op een bank.
//
// Dezelfde alleen-lokaal-regel als de drie werkbanken hiernaast, en om
// dezelfde reden: het echte scherm zit achter een Google-login én achter
// een blob-archief, dus CI heeft het nog nooit gezien. En dit scherm is
// er juist voor de telefoon, dus "nooit gezien" betekent hier "nooit op
// de maat gemeten waarvoor het gebouwd is".
//
// `process.env.VERCEL` staat op elke Vercel-build en -runtime en is niet
// uit te zetten in de projectinstellingen, dus deze pagina bestaat niet
// in de uitgeleverde applicatie. Er zit geen sessiecontrole in omdat er
// niets bereikt wordt dat er een nodig heeft: de documenten hieronder
// zijn verzonnen en er wordt geen route, archief of database aangeraakt.
//
// Drie stuks, met opzet niet alle drie hetzelfde: een offerte, een open
// factuur en een gearchiveerd stuk. Dat is waar de drie statuspillen en
// de sortering tegelijk iets te zeggen hebben.
//
// Bedragen staan in HELE EURO'S en niet in centen — `totals()` telt ze op
// en zet de btw erbij. Met `618_18` bedoelde ik ooit 618,18 en kreeg ik
// een offerte van €74.799,78 op het scherm, want dat onderstrepingsteken
// is een cijfergroepering en geen komma.
function shelf(): StudioDocument[] {
  const offerte: StudioDocument = {
    ...blankDocument("offerte"),
    id: "preview-offerte",
    number: "GR-O // 2026-0908-0001",
    date: "8 september 2026",
    dateISO: "2026-09-08",
    client: "Familie Voorbeeld\nVoorbeeldstraat 12\n6500 AA Nijmegen",
    title: "Achtertuin met vijver",
    items: [
      {
        ...blankDocument("offerte").items[0],
        id: "l1",
        description: "Grondwerk en aanleg",
        amounts: [6178.51],
      },
    ],
  }
  const factuur: StudioDocument = {
    ...blankDocument("factuur"),
    id: "preview-factuur",
    number: "GR-F // 2026-0908-0010",
    date: "8 september 2026",
    dateISO: "2026-09-06",
    client: "Familie Voorbeeld\nVoorbeeldstraat 12",
    title: "Eerste termijn, 50%",
    paid: false,
    items: [
      {
        ...blankDocument("factuur").items[0],
        id: "l2",
        description: "Eerste termijn",
        amounts: [3089.26],
      },
    ],
  }
  const oud: StudioDocument = {
    ...blankDocument("offerte"),
    id: "preview-archief",
    number: "GR-O // 2025-0402-0003",
    date: "2 april 2025",
    dateISO: "2025-04-02",
    client: "Voortuin Kerkstraat",
    title: "Beplantingsplan",
    archivedAt: "2025-11-01",
    items: [
      {
        ...blankDocument("offerte").items[0],
        id: "l3",
        description: "Beplantingsplan",
        amounts: [1900],
      },
    ],
  }
  return [offerte, factuur, oud]
}

export default function PlankPreviewPage() {
  if (process.env.VERCEL) notFound()
  return (
    <DashboardShell
      user="preview@local"
      groups={ownerNav()}
      phoneGroups={ownerPhoneNav()}
      phoneReady
    >
      <DocumentShelf documents={shelf()} status="ok" />
    </DashboardShell>
  )
}
