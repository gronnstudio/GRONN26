// Vaste teksten van de site. Alles hier komt letterlijk uit gronn-studio;
// niets is voor deze build bedacht.

/** De opening (gronn-studio, home.tsx, sinds 3 okt 2026). */
export const OPENING = {
  label: "Vijvers en tuinen · Stein en omgeving",
  kop: "Een vijver en tuin die gezond blijven.",
  zin: "Ik ben Nick. Ik renoveer en onderhoud vijvers en leg natuurlijke tuinen aan, voor huiseigenaren in Stein en omgeving. Waar het kan met een vaste prijs vooraf.",
}

/** Merkbasis: ook de sitebeschrijving en de JSON-LD (plekken.ts). */
export const MERKBASIS =
  "GRØNN Studio ontwerpt, legt aan en onderhoudt vijvers en tuinen bij particulieren in Stein en omgeving. Planten, water en bodem als één systeem, zodat het gezond blijft met weinig ingrijpen."

/** Merkbelofte, Brand Guide 2026 p. 2. */
export const MERKBELOFTE = "Een tuin die met je meegroeit."

/** Het hoofdmenu: precies vier woorden. Home is het logo. */
export const NAV = [
  { href: "/vijvers", label: "Vijvers" },
  { href: "/tuinen", label: "Tuinen" },
  { href: "/werk", label: "Werk" },
  { href: "/over", label: "Over" },
] as const

export const KENNISMAKEN = { href: "/kennismaken", label: "Kennismaken" } as const

/** Over Nick: zijn eigen zinnen uit "Over mij" (gronn-studio teksten.ts), letterlijk. */
export const OVER_KORT = {
  uitspraak: "Ik denk in beelden, patronen en verbanden.",
  zin: "Als ik naar een tuin kijk, zie ik hoe licht, water, materialen en beplanting elkaar beïnvloeden.",
}

/** Het portret (gronn-studio public/nick, verkleind tot 1000px, zonder metadata). */
export const PORTRET = {
  src: "/nick/portret.jpg",
  width: 1000,
  height: 1333,
  alt: "Nick Peters met een espressokopje op een terras in een Maastrichtse straat, kijkend in de camera.",
}
