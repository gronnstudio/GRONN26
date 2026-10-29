# Modules

Per module: doel, wat er staat, regels, rechten, tests en stand. Labels: zie
[../README.md](../README.md). Volgorde van bouwen is die van de eigenaar:
Contacten → Leads → Tuinopname → Calculatie → Offertes → Projecten → Facturen.

## 02 · Contacten en klanten — Getest

- **Doel:** één kaart per klant of partner, zonder dubbele kaarten.
- **Routes:** `/dashboard/klanten` (pijplijn of `?weergave=tabel`, zoeken en
  filter op soort via de URL), `/dashboard/klanten/[id]` met tabbladen
  Overzicht · Tuinen · Calculaties · Offertes en facturen · Tijdlijn.
- **Gegevens:** `Klant` in `src/lib/crm/klant.ts`.
- **Regels:** dubbel = zelfde e-mail, zelfde laatste negen cijfers van het
  nummer, of exact dezelfde naam; dan opent de bestaande kaart (`?bestond=1`).
  Fase, stukken, opname en calculatie schrijven zelf een regel op de tijdlijn.
- **Rechten:** alleen eigenaar (proxy + `eisEigenaar` in elke actie).
- **Tests:** `tests/crm.spec.ts` (dubbele klant, tabel, tijdlijn), `crm-rekenen.spec.ts` (dubbelen, oude gegevens).
- **Nog niet:** huishoudens en organisaties als eigen record, documenten-tab, meerdere contactpersonen per bedrijf.

## 03 · Leads — Getest

- **Fasen:** Aanvraag, Opname, Offerte, Akkoord, Gepland, Uitvoering,
  Opgeleverd, Verloren (met reden). Vast in code, niet instelbaar: de
  eigenaar koos deze reeks (29 okt), en instelbare fasen zijn complexiteit
  zonder vraag.
- **Velden:** waarde (centen), kans (%), prioriteit, bron, opvolgdatum, volgende stap.
- **Pijplijn:** slepen tussen fasen; "Opvolgen · vandaag of eerder" bovenaan;
  "leads, gewogen naar kans" = (laatste calculatie of geschatte waarde) × kans, over Aanvraag/Opname/Offerte.
- **Formulier → lead:** handmatig met **Maak klant →** op het dashboard, zodat
  Nick beslist wie een klantrecord wordt (privacy: aanvragen gaan na 30 dagen weg).
- **Dubbel verzenden:** dezelfde aanvraag binnen 10 minuten telt één keer.
- **Nog niet:** herinneringen buiten het dashboard, eigenaar per lead (er is één gebruiker), lead → project.

## 04/05 · Tuinopname en tuinrecord — Getest

- **Route:** `/dashboard/klanten/[id]/tuin/[tuin]`.
- **Vragenlijst:** `src/lib/crm/intake.ts`: wens en kader, maten, grond/licht/water,
  uitvoering (toegang, KLIC, afvoer), afspraken (eisen, risico's, aannames), 14 soorten werk.
- **Geschiedenis:** elke bewaring met wijzigingen zet de vorige versie in `geschiedenis`; het scherm toont per versie welke velden daarna veranderden.
- **Foto's:** Opname, Voor, Tijdens, Na; verkleind tot 1600px JPG, privé in Blob, alleen via `/api/crm/foto` met inlog.
- **Naar calculatie:** oppervlak (of lengte × breedte), werk en toegang gaan als beschrijving mee.
- **Nog niet:** schetsen en documenten, beplantingszones, kaart of meetgereedschap.

## 06 · Calculatie — Getest

- **Routes:** `/dashboard/prijs` (los, of kies een klant) en `/dashboard/klanten/[id]/calculatie/[calc]` (`nieuw`, `?tuin=`, `?v=`).
- **Rekenkern:** `src/lib/crm/calculatie.ts`, zie ADR 0002. Kostensoorten met eigen standaard opslag en btw, per regel aan te passen. Onvoorzien en korting. Optionele regels los.
- **Toont:** voor de klant (excl., btw per tarief met grondslag, incl.), wat je overhoudt (bedrag, per uur, marge én opslag), tekort onder € 37/uur, na betaling wegzetten.
- **Rekenhulpen:** bestrating met snijverlies, afgraven, grond met inklinking, grind in ton, graszoden, graszaad, planten per m², mulch, machinehuur, uren uit dagproductie.
- **Versies:** elke bewaring is een nieuwe versie (max. 30); de server rekent opnieuw en bewaart totaal en winst als momentopname.
- **Grønn:** urenvoorstel met de catalogusprijzen; bekende namen worden catalogusregels.
- **Tests:** rekenregels in `crm-rekenen.spec.ts`, de flow in `crm.spec.ts`.
- **Nog niet:** groepen/fasen op het scherm (veld bestaat), nacalculatie met echte kosten.

## 07 · Catalogus — Gebouwd

- **Route:** `/dashboard/catalogus`, CSV-export `/dashboard/catalogus/export`.
- **Regels:** prijs wijzigen → oude prijs in de historie. ★ in het rekenblad maakt of werkt een item bij. Start met elf richtprijzen uit het urenvoorstel, gemarkeerd "Richtprijs, controleren".
- **Nog niet:** meerdere leveranciers per item met elk een prijs, CSV-import, afbeeldingen, inkooplijst.

## 15 · Documenten en foto's — Bezig

Foto's per tuin werken (zie 04). Overige documenten: gepland.

## 01 · Overzicht — Bezig

De ring en "Volgende stap" op `/dashboard` komen uit de klanten. To-do's,
facturen en offertes op het tabblad Geld staan nog in `src/lib/beheer/data.ts`.

## Gepland

08 Offertes (uit een calculatieversie, akkoord met audit), 09 Projecten,
10 Planning, 11 Uren aan klant/project koppelen (de registratie bestaat),
12 Facturen (immuun na uitgifte, creditnota's), 13 Onderhoudscontracten,
14 Plantendatabase, 16 Klantportaal, 17 Automatiseringen, 18 Rapportages.
Zie [../roadmap.md](../roadmap.md).
