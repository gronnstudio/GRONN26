# Blueprint publieke site

9 november 2026 · bij de Master Brief van de eigenaar ("Premium website redesign").
Deze fase: ontwerpsysteem, menu en voet in de nieuwe kleuren, en de voorpagina
helemaal opnieuw. De brief raadt zelf aan eerst één voorpagina af te maken en
te laten beoordelen voordat de rest volgt (Checkpoint 2); dat is ook de
gouden regel van deze repo.

## 1. Audit (stand 9 nov 2026)

| Onderwerp | Wat er is | Besluit |
| --- | --- | --- |
| Stack | Next.js 16.3, React 19.3, Tailwind 4.3, TypeScript, Playwright, ESLint. Vercel Blob, Mollie, Anthropic SDK. **Geen Supabase** in deze repo (de brief noemt het; het staat niet in `package.json`). | Ongewijzigd. Geen nieuwe pakketten; alleen Geist Mono via het bestaande `next/font/google`. |
| Routes | Zie [architecture/site.md](../architecture/site.md): `/`, `/vijvers`, `/tuinen` (+ borderpakketten, cadeaubon, materialen), `/werk` (+ 2 projecten), `/over`, `/journaal`, `/techniek`, `/kennismaken`, `/faq`, juridisch, hulppagina's. Oude adressen in `next.config.ts` (`OUD`). | Alle routes blijven. Geen adres verandert. |
| Privé | `/dashboard`, `/offertes`, `/api/*`, privélinks (`/offerte/[token]`, `/factuur/[token]`, `/werkbon/[token]`). Eigen palet onder `.crm`. | **Niet aangeraakt.** `.crm` heeft eigen tokens, dus de nieuwe kleuren lekken er niet in. Daarom geen verplichte GPT-review. |
| Ontwerp | Zand en bruin palet (11 okt), Syne + Montserrat, glazen pil onderaan met komeet en iconen die elke 8 s bewegen, kaarten van 16px. Twee layouts: Klassiek en Blueprint. | Kleur, type, hoek, menu-glas en beweging vernieuwd (zie ART-DIRECTION). Blueprint blijft zoals hij is. |
| Beeld | Vijverrenovatie F01–F11 + 2 clips, terras Geulle T01–T04, portret, 2 sfeerbeelden, borderfoto (sfeerbeeld). Zonder metadata. | Alleen dit. Sfeerbeelden houden hun label. |
| SEO | Titel en beschrijving per pagina, canonical `./`, OG-beeld, JSON-LD (`studioSchema`), sitemap, robots. | Ongewijzigd en blijft werken; voorpagina houdt één h1 met de zoekwoorden. |
| Twee talen | Alle tekst `{ nl, en }` met `<T>`, Engels via Weergave. | Nieuwe tekst ook in beide talen. |
| Responsief | Getest op 390, 834, 1440 (`tests/basis.spec.ts`): één h1, geen overloop, knopmaten, fotohoek, tikvlak 44px. | De nieuwe voorpagina haalt dezelfde tests. |

## 2. Positionering

> Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.

(eigenaar, 3 okt 2026; ongewijzigd). Waarom anders dan een gewoon hoveniersbedrijf:
**één persoon** van gesprek tot onderhoud, **begint bij water, bodem en licht**,
en **een prijs vooraf**. De site bewijst dat met echt werk en echte maten, niet met beloftes.

## 3. Doelgroepen

1. **Huiseigenaar met een vijver die niet goed meer is** (groen water, lek, oude techniek). Wil weten: kan hij dit, wat kost het ongeveer.
2. **Huiseigenaar die de tuin natuurlijker wil** (omvormen, borders, beplanting). Wil zien: smaak, aanpak, of het bij hem past.
3. **Wie een border of cadeaubon zoekt**: direct naar de shop.

## 4. Conversie

- **Hoofdactie:** Kennismaken (`/kennismaken`, het formulier dat in het dashboard binnenkomt). Eén oranje knop per scherm.
- **Lichte actie:** een foto appen (WhatsApp met een voorgeschreven bericht). Als tekstlink, nooit als tweede knop.
- **Terugval:** bellen. In het slot en de voet.
- Plekken op de voorpagina: opening (boven de vouw, ook op 1440×900), werk ("Bekijk het project"), slot.

## 5. Sitemap en navigatie

De sitemap blijft zoals hij is (zie audit). Menu: de dock die de eigenaar in oktober koos
(Home · Werk · Studio · Shop · Menu, op desktop met Journaal en Kennismaken). Beoordeeld tegen de brief:

| Idee uit de brief | Oordeel |
| --- | --- |
| Compacte pil, vijf bestemmingen, onderaan | **Houden.** Duim-bereik, al getest, mensen kennen het. |
| Instagram-achtige pil, twee acties tijdens lezen | Bestaat al als Omhoog dat verschijnt tijdens het lezen. Houden. |
| Wiel / radiaal menu | **Niet.** Slecht vindbaar, slecht met toetsenbord, was in V2 al weg. |
| Glas | **Weg** (brief: geen glassmorphism). De pil is nu dicht antraciet met een haarlijn. |
| Komeet en bewegende iconen | Komeet loopt **één ronde** bij binnenkomst; iconen bewegen alleen bij aanwijzen. Geen constante beweging. |

## 6. Voorpagina, sectie voor sectie

| # | Sectie | Doel | Compositie |
| --- | --- | --- | --- |
| — | Opening (antraciet) | In één scherm: wat, voor wie, waar, en de knop | Logo en coördinaten bovenaan; kop in drie regels over de volle breedte; vanaf 1280px zin en knop naast de laatste regels; de waterval tot aan de schermrand die over de rand in de crème sectie steekt. |
| 01 | Studio (crème) | De persoon verkopen | Kop over 8 kolommen, leesalinea, Nick tussen de oeverplanten verschoven rechts (zachte parallax); drie uitgangspunten als regels. |
| 02 | Wat ik maak (crème) | Kiezen tussen vijver, tuin, border | Index met drie grote woorden; desktop: één beeld dat meewisselt bij aanwijzen; telefoon: duimnagel per rij. |
| 03 | Werk (antraciet) | Bewijs | Ervoor (staand) links, kop en Nu rechts, Tijdens verschoven, maten uit de projectdata als specificatie; tweede project als één regel. |
| 04 | Werkwijze (crème) | Drempel verlagen | Drie stappen op één lijn met een oranje beginpunt. |
| — | Slot (crème) | Actie | Grote zin, één knop, WhatsApp en telefoon als tekstlinks, maatlijn met het werkgebied. |
| — | Voet (antraciet) | Alles wat je zoekt | Bestaande voet, nieuwe kleuren. |

Wat gewone hovenierssites weglaten en deze site wel heeft: **echte maten** van het werk
(liters, leidingdiameter, uren), **ervoor/tijdens/nu** in plaats van alleen het mooie eindbeeld,
**het werkgebied als maat**, en **één persoon met naam en gezicht**.

## 7. Gebruikersreizen

1. *Vijver met groen water* → opening → 02 Vijvers → `/vijvers` (diensten en prijzen) → Kennismaken of foto appen.
2. *Twijfelt of hij dit kan* → 03 Werk → `/werk/vijverrenovatie` → Kennismaken.
3. *Wil een border* → 02 Borders → `/tuinen/borderpakketten` → bestellen (Mollie).

## 8. Volgende fasen (na akkoord op de voorpagina)

Vijvers en Tuinen, Studio (`/over`), Werk en de casepagina's (één sjabloon met vrije volgorde van
beeldreeksen), Kennismaken. Dezelfde bouwstenen (`src/components/ontwerp/`).

## 9. Inhoud die ontbreekt (niet verzonnen)

- [ ] Een voor- en nafoto **vanaf dezelfde plek** (vijverrenovatie of de volgende klus). Dan kan er een voor/na-schuif komen.
- [ ] Een **afgeronde natuurlijke tuin** (Clannad & Stijn, per fase gefotografeerd). Tot dan draagt Tuinen het terras.
- [ ] Nick aan het werk, **liggend formaat**, voor Studio.
- [ ] Toestemming per klant voor plaatsnaam en eventueel prijs (vijverrenovatie heeft nu geen plaats).
- [ ] Echte Google-reviews, als ze er zijn. Tot dan geen reviews op de site.

## 10. Checklist vóór livegang

| Prio | Punt | Stand |
| --- | --- | --- |
| P1 | Nick beoordeelt de preview op zijn telefoon | open |
| P1 | Typecheck, lint, build, Playwright groen in CI | zie PR |
| P1 | Contrast van alle tekstparen ≥ 4,5:1 (gemeten, zie ART-DIRECTION) | gedaan |
| P1 | Toetsenbord: index, werkregel en knoppen hebben een zichtbare focus | gedaan |
| P1 | Minder beweging: kop, beeld en opkomst staan meteen stil | gedaan (CSS) |
| P2 | Andere pagina's in het nieuwe systeem (volgende fase) | open |
| P2 | OG-beeld en titel van de voorpagina controleren in WhatsApp | open |
| P2 | Dode code van de oude voorpagina (`voorpagina.css`) opruimen zodra `/over` mee is | open |
| P3 | Blueprint-layout: houden of schrappen (besluit Nick) | open |
