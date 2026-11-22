import type { L } from "@/lib/i18n"

// De GRØNN-familie, gelijk aan FAMILIE in gronnstudio/gr-nn-backbone
// (backbone.js). Komt er een site bij of verandert een adres, dan op beide
// plekken. Zodra gronn.earth gekocht en gekoppeld is, alleen die href.
export const FAMILIE: { id: string; naam: string; sub: L; href: string }[] = [
  { id: "earth", naam: "GRØNN Earth", sub: { nl: "De tuinencyclopedie", en: "The garden encyclopedia" }, href: "https://gronn-atlas.vercel.app" },
  { id: "outdoor", naam: "GRØNN Outdoor", sub: { nl: "Dichter bij de natuur", en: "Closer to nature" }, href: "https://gronn-outdoor.vercel.app" },
]
