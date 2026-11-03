import "server-only"
import { leesJson, wijzigJson } from "@/lib/crm/opslag"
import { START, type Item } from "@/lib/crm/catalogus"

// Lezen en schrijven van de catalogus (src/lib/crm/catalogus.ts), één JSON-document in Blob.
const PAD = "dashboard/catalogus.json"

export const leesCatalogus = () => leesJson<Item[]>(PAD, () => START)
export const wijzigCatalogus = (f: (items: Item[]) => Item[]) => wijzigJson<Item[]>(PAD, () => START, f)
