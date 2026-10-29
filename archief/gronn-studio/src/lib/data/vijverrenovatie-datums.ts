// Wanneer de vijverrenovatie live ging en wanneer de tekst voor het laatst
// veranderde. Uit git, niet bedacht of geschat.
//
// Zo afgeleid (24 sep 2026), op `main`:
//
//   git log --follow --format='%h %cs %s' -- src/lib/data/vijverrenovatie.ts
//   → 4e775c4 2026-09-23 V5 · De publieke site van scratch … (#139)
//
// Dat is de enige commit op `main` die de projecttekst aanraakt: hij zette
// het project op de site (push naar `main` = productie, zie CLAUDE.md) en
// sindsdien is de tekst niet veranderd. Dus gepubliceerd = bijgewerkt =
// 23 september 2026. (Op de zijtak `feat/v4-waterroute` stond de tekst al
// op 22 sep, maar die tak is nooit live gegaan en telt dus niet.)
//
// Verandert Nick de projecttekst in `vijverrenovatie.ts`, zet BIJGEWERKT
// dan op de datum waarop die wijziging naar `main` gaat — alleen dan. Een
// wijziging aan de opmaak (project.tsx) is geen nieuwe versie van de tekst.
// Dit bestand staat bewust los van `vijverrenovatie.ts`, zodat het
// bijwerken van deze datum zelf niet als tekstwijziging in git verschijnt.

/** ISO-datum (JJJJ-MM-DD) waarop het project live ging. */
export const VIJVER_GEPUBLICEERD = "2026-09-23"

/** ISO-datum (JJJJ-MM-DD) van de laatste wijziging aan de projecttekst. */
export const VIJVER_BIJGEWERKT = "2026-09-23"
