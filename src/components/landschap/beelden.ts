import type { Foto } from "@/lib/data/vijverrenovatie"
import { FOTOS } from "@/lib/data/vijverrenovatie"
import { TERRAS_FOTOS } from "@/lib/data/terras-geulle"
import { PORTRET } from "@/components/over/portret"
import type { L } from "@/lib/i18n"

// Alle beelden van de voorpagina uit de visuele bouwbrief (Nick, 21 nov 2026),
// met hun soort: "project" is eigen werk met toestemming van de klant,
// "studio" is Nick zelf, "sfeer" is stock en "ai" is een AI-visualisatie.
// Alleen project-beelden komen in een projectkaart. Sfeer en AI dragen altijd
// een zichtbaar label (brief §08: "Sfeer ondersteunt. Werk bewijst.").
export type Soort = "project" | "studio" | "sfeer" | "ai"
export type Beeld = Foto & { soort: Soort; brandpunt?: string }

export const LABEL: Record<Exclude<Soort, "project" | "studio">, L> = {
  sfeer: { nl: "Sfeerbeeld", en: "Mood image" },
  ai: { nl: "Sfeerbeeld · AI-visualisatie", en: "Mood image · AI visualisation" },
}

/** Beeld 25: de tuin uit Nicks eerste voorbeeld, als AI-reconstructie zonder de
 *  interface. Hetzelfde bestand voor desktop, telefoon en elke zoomstand. */
export const TUIN: Beeld = {
  soort: "ai",
  src: "/landschap/tuin-voorbeeld.jpg",
  width: 2020,
  height: 779,
  // het brandpunt houdt vijver, stapstenen en het donkere huis in beeld op een smalle crop
  brandpunt: "68% 62%",
  alt: "Een natuurlijke tuin in avondlicht: een vijver met waterlelies, brede natuurstenen stapstenen en rechts een donker huis met grote ramen.",
  en: { alt: "A natural garden in evening light: a pond with water lilies, wide natural stepping stones and a dark house with large windows on the right." },
}

export const BEPLANTING: Beeld = {
  soort: "ai",
  src: "/landschap/sfeer-beplanting.jpg",
  width: 1536,
  height: 1024,
  brandpunt: "40% 50%",
  alt: "Zonnehoed, siergras en kattenkruid in laag tegenlicht.",
  en: { alt: "Coneflower, ornamental grass and catmint in low backlight." },
}

export const MATERIALEN: Beeld = {
  soort: "ai",
  src: "/landschap/sfeer-materialen.jpg",
  width: 1536,
  height: 1024,
  alt: "Natuurstenen stapstenen in donker water, met kattenkruid en grassen langs de rand.",
  en: { alt: "Natural stepping stones in dark water, with catmint and grasses along the edge." },
}

export const BEEKLOOP: Beeld = {
  soort: "ai",
  src: "/landschap/sfeer-beekloop.jpg",
  width: 1536,
  height: 1024,
  brandpunt: "62% 50%",
  alt: "Water dat over natuursteen een beekloop in stroomt, tussen varens en munt.",
  en: { alt: "Water flowing over natural stone into a stream, between ferns and mint." },
}

export const VIJVER_SFEER: Beeld = {
  soort: "ai",
  src: "/landschap/sfeer-vijver.jpg",
  width: 1536,
  height: 1024,
  alt: "Een stille vijver onder een grote boom, met lissen en waterlelies langs een natuurstenen rand.",
  en: { alt: "A still pond under a large tree, with irises and water lilies along a natural stone edge." },
}

export const BLAUWE_UUR: Beeld = {
  soort: "ai",
  src: "/landschap/sfeer-blauwe-uur.jpg",
  width: 2019,
  height: 779,
  brandpunt: "64% 60%",
  alt: "Dezelfde voorbeeldtuin in het blauwe uur, met zacht licht uit het huis.",
  en: { alt: "The same example garden at blue hour, with soft light from the house." },
}

export const BORDER: Beeld = {
  soort: "sfeer",
  src: "/borderpakketten/vlinderborder.jpg",
  width: 1600,
  height: 1200,
  alt: "Een bloeiende border met zonnehoed en siergras.",
  en: { alt: "A flowering border with coneflowers and ornamental grass." },
}

export const NICK: Beeld = { ...PORTRET, soort: "studio", brandpunt: "50% 30%" }
export const NICK_WERK: Beeld = {
  soort: "studio",
  src: "/nick/zaagtafel-lach.jpg",
  width: 720,
  height: 1280,
  alt: "Nick lacht met een net gezaagde steen in zijn handen, achter de steenzaagtafel.",
  en: { alt: "Nick laughing with a freshly cut stone in his hands, behind the stone saw table." },
}

export const VIJVERRENOVATIE: Beeld = { ...(FOTOS.F10 as Foto), soort: "project" }
export const VIJVERRENOVATIE_OVERZICHT: Beeld = { ...(FOTOS.F01 as Foto), soort: "project", brandpunt: "50% 60%" }
export const TERRAS: Beeld = { ...TERRAS_FOTOS.hoofd, soort: "project" }

/** Het zichtbare herkomstlabel van een beeld, of niets voor eigen werk. */
export const labelVoor = (b: Beeld): L | null => (b.soort === "sfeer" || b.soort === "ai" ? LABEL[b.soort] : null)
