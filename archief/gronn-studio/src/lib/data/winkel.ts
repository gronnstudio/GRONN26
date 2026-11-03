// De winkel (docs/shop-plan.md). Zolang dit `false` is, is /winkel een
// CONCEPT: noindex, niet in de sitemap, een conceptbanner bovenaan, en
// in de ingeklapte dock blijft Home staan.
//
// Nick, 25 sep 2026: "Winkel" vervangt "Home" in de INGEKLAPTE dock —
// maar pas als de winkel echt live gaat. Omzetten naar `true` betekent
// óók, in dezelfde commit: de noindex in src/app/[locale]/winkel/page.tsx
// weg, /winkel in src/app/sitemap.ts, en de conceptbanner (en de
// plaatshouders) uit src/components/gronn/winkel.tsx.
export const WINKEL_LIVE = false
