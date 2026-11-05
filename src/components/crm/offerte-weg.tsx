import { Icoon } from "@/components/crm/iconen"
import { VerwijderKnop } from "@/components/crm/verwijder-knop"
import { verwijderOfferte } from "@/app/dashboard/klanten/offerte-acties"
import type { Stuk } from "@/lib/crm/klant"

/** Prullenbak bij een offerte; weg pas na het woord "verwijderen". */
export function OfferteWeg({ klantId, stuk }: { klantId: string; stuk: Pick<Stuk, "id" | "nummer"> }) {
  return (
    <VerwijderKnop
      actie={verwijderOfferte.bind(null, klantId, stuk.id)}
      wat={`offerte ${stuk.nummer}`}
      knop="crm-knop-stil crm-knop-klein hover:!text-let"
      label={
        <>
          <Icoon naam="prullenbak" className="size-[15px]" />
          Verwijderen<span className="sr-only"> · offerte {stuk.nummer}</span>
        </>
      }
    />
  )
}
