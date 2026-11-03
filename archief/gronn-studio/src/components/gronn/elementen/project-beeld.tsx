import { fotosVoor } from "@/lib/data/vijverrenovatie"

import { Beeld } from "./beeld"
import { WaterrouteSchema } from "./waterroute-schema"

/**
 * Het beeld van het vijverproject op een kaart: de eerste foto (F01)
 * zodra Nick die in `FOTOS` zet, tot die tijd de waterroute. Eén plek
 * voor die keuze, zodat de home en het projectenoverzicht tegelijk
 * omschakelen. `id` maakt de ids in de tekening uniek per pagina.
 *
 * Staat F10 (de waterval) er ook, dan vloeit die onder de muis over F01
 * (`BeeldWissel`). De trekker is de voorouder met `g-wissel-groep`: de
 * kaartlink op projecten, het bosgroene vlak op home.
 *
 * `priority` alleen waar de foto het grootste element boven de vouw is
 * (de eerste kaart op /projects): dan laadt hij meteen, zonder onthulling.
 */
export function ProjectBeeld({
  id,
  sizes,
  vul = false,
  priority = false,
}: {
  id: string
  sizes: string
  vul?: boolean
  priority?: boolean
}) {
  const foto = fotosVoor("F01")[0]
  const tweede = fotosVoor("F10")[0]
  return foto ? (
    <Beeld src={foto.src} alt={foto.alt} width={foto.width} height={foto.height} sizes={sizes} wissel={tweede} vul={vul} priority={priority} />
  ) : (
    <WaterrouteSchema id={id} compact />
  )
}
