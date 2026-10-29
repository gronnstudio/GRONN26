import "server-only"
import { leesJson, wijzigJson } from "@/lib/crm/opslag"
import { STANDAARD, schoonLijst, type Vragenlijst } from "@/lib/crm/vragenlijst"

// De vragenlijst van de intake (src/lib/crm/vragenlijst.ts) in Blob. Zolang
// Nick niets aanpast is er geen bestand en geldt de startinhoud.
const PAD = "dashboard/vragenlijst.json"

export const leesVragenlijst = async () => schoonLijst(await leesJson<Vragenlijst>(PAD, () => STANDAARD))
export const wijzigVragenlijst = (f: (l: Vragenlijst) => Vragenlijst) => wijzigJson<Vragenlijst>(PAD, () => STANDAARD, (ruw) => f(schoonLijst(ruw)))
