# Shopplan — GRØNN Studio

Opgesteld 25 sep 2026 op verzoek van de eigenaar ("Ontwikkel een plan
voor een shop"). Keuzes van Nick: **alle vier soorten aanbod**, en
**klein beginnen**. Dit is een plan, nog niets gebouwd. Prijzen,
producten en voorwaarden vult Nick in; niets hieronder is verzonnen
aanbod.

## Uitgangspunt

Eén shop, vier soorten aanbod, in drie fases. Elke fase is los bruikbaar
en kost weinig vaste lasten. Afrekenen gaat via **Mollie** (NL, iDEAL,
Wero, Bancontact, creditcard; geen maandkosten, betalen per transactie).
Stripe is het alternatief; Mollie past beter bij Nederlandse klanten.
Geen eigen winkelwagen of voorraadsysteem in fase 1.

## Het aanbod

| Soort | Voorbeelden (Nick kiest) | Levering | Btw | Herroeping |
|---|---|---|---|---|
| Vaste diensten | vijverdoorlichting, najaarsbeurt, bladnet, onderhoudsabonnement | afspraak op locatie | 21 % | 14 dagen; vervalt als de klant vraagt eerder te beginnen en het werk af is |
| Digitale producten | plantplan-sjabloon, zaaikalender, onderhoudsgids (pdf) | directe download | 21 % (e-boeken 9 %, laten toetsen) | vervalt alleen met uitdrukkelijke toestemming vóór levering |
| Fysieke producten | planten, zaden, vijvermateriaal, merch | verzending of afhalen in Stein | 9 % planten/zaden, 21 % overig | 14 dagen; planten mogelijk uitgezonderd (bederfelijk) |
| Cadeaubonnen | advies of onderhoudsbeurt cadeau | pdf met code | btw pas bij inwisselen (meervoudige voucher) | 14 dagen |

De btw- en herroepingskolommen zijn een **startpunt voor de jurist en
boekhouder**, geen advies. Zie "Juridisch" hieronder.

## Fase 1 — Klein beginnen (aanbevolen start)

**Doel:** de eerste verkopen, zonder techniek die onderhoud vraagt.

- Pagina `/winkel` in de V5-stijl, opgebouwd uit bestaande elementen
  (BeeldKaart, Knop, PrijsTabel). Per product: foto (echt werk of
  gelabeld), korte tekst, prijs incl. btw, knop "Bestellen".
- De knop is een **Mollie-betaallink** per product. Geen winkelwagen.
- **Vaste diensten**: na betaling kiest de klant een datum
  (bijvoorbeeld Cal.com of een eenvoudige vervolgmail van Nick). De
  bestaande dienstpagina's krijgen een knop "Direct boeken".
- **Digitale producten**: na betaling een downloadlink (Mollie stuurt
  door naar een bedankpagina met een tijdelijke link). Bestanden in
  Vercel Blob, niet openbaar in `public/`.
- **Cadeaubonnen**: vaste bedragen via betaallink; Nick mailt de bon
  (pdf in huisstijl) met een unieke code. Codes bijhouden in een lijst.
- **Fysieke producten**: in fase 1 alleen **afhalen in Stein** of
  meeleveren bij een klus. Geen verzending, geen voorraadsysteem.
- Orders komen binnen als Mollie-mail; Nick handelt ze met de hand af.

**Kosten:** Mollie per transactie (iDEAL rond € 0,30; kaarten een
percentage). Verder niets vast.
**Werk:** ongeveer een week bouwen en testen, plus Nicks inhoud.

## Fase 2 — Winkelwagen en orders in het dashboard

Pas als fase 1 aantoonbaar verkoopt.

- Winkelwagen (meerdere producten, één betaling) met Mollie Payments
  API; bestellingen in de bestaande Supabase-database.
- Orderoverzicht en status in het eigenaarsdashboard.
- Cadeaubonnen met automatisch gegenereerde codes en saldo, in te
  wisselen bij het boeken van een dienst.
- Digitale producten automatisch leveren (webhook → downloadlink).
- Klantgegevens: `clientId` alleen uit de geauthenticeerde sessie,
  nooit uit een URL of formulier (bestaande regel).

## Fase 3 — Verzending

Alleen als fysieke producten meer worden dan afhalen.

- Verzendkosten en pakketlabels via Sendcloud of MyParcel.
- Voorraad per product; "uitverkocht" zichtbaar.
- Planten: alleen seizoensgebonden en binnen NL, met duidelijke
  verzendvoorwaarden.

## Juridisch en administratief (vóór livegang, niet zelf invullen)

Regel uit dit project: niet zelf juridisch improviseren. Voor de
jurist en boekhouder:

1. **Algemene voorwaarden webshop** naast de huidige `/voorwaarden`
   (die zijn nog een concept).
2. **Herroepingsrecht** per soort aanbod, en de knop/tekst waarmee de
   klant afstand doet bij digitale inhoud en direct startende diensten.
   De bestaande pagina `/herroeping` uitbreiden.
3. **Btw-tarieven** per product (planten 9 %, e-boeken, vouchers).
4. **Privacyverklaring**: Mollie (en later Sendcloud/MyParcel) als
   verwerker noemen; wat er van een koper wordt bewaard en hoe lang.
5. **Verplichte informatie** bij elk product: totaalprijs incl. btw,
   leveringstermijn, verzendkosten, en de knop "Bestelling met
   betaalverplichting".
6. KVK/BTW staan al in `src/lib/business.ts`.

## Wat Nick moet aanleveren

- Welke producten in fase 1 (advies: 2 vaste diensten, 1 digitaal
  product, cadeaubonnen van twee bedragen).
- Prijzen per product.
- Foto's van echt werk of producten.
- Een Mollie-account (zakelijk, op KVK-nummer) — dat maakt Nick zelf
  aan; ik verwerk alleen de betaallinks.
- Akkoord van jurist/boekhouder op de punten hierboven.

## Wat ik bouw zodra dat er is

1. `/winkel` en productkaarten als elementen, met tests (prijs incl.
   btw zichtbaar, verplichte informatie aanwezig, geen product zonder
   foto of label).
2. Knoppen "Direct boeken" op de dienstpagina's.
3. Bedankpagina en beveiligde download voor digitale producten.
4. Cadeaubon-pdf in huisstijl.
5. Privacy- en herroepingsteksten pas na akkoord van de jurist.
6. Live zetten met één vlag: `WINKEL_LIVE` in `src/lib/data/winkel.ts`
   (nu `false`; het concept staat op `/winkel`, noindex). Op `true`
   vervangt Winkel Home in de ingeklapte dock (Nick, 25 sep 2026). In
   dezelfde commit: de noindex uit `src/app/[locale]/winkel/page.tsx`,
   `/winkel` in `src/app/sitemap.ts`, en de conceptbanner en
   plaatshouders uit `src/components/gronn/winkel.tsx`.
