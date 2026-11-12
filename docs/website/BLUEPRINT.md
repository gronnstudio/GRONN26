# Blueprint: de nieuwe publieke site

Stand 9 nov 2026. Branch `claude/veldboek-voorpagina`. Hoort bij
[ART-DIRECTION.md](ART-DIRECTION.md) en de Website Master Brief (GRONN26).

## 1. Wat de audit liet zien

**Wat er staat en blijft.** Next.js 16 / React 19 / Tailwind 4, tekst als
getypte data in `src/lib/data/`, twee talen via `<T>`, Vercel Blob (privé),
Mollie, het CRM onder `/dashboard` met Google-inlog, de pil-navigatie
(18 okt), redirects van de vorige site in `next.config.ts`, 25 Playwright-specs.
Er is **geen Supabase** in deze repo; de brief ging daar ten onrechte van uit.
Niets aan API, CRM, dashboard, inlog of `.github/` wordt in deze branch
aangeraakt, dus de verplichte GPT-review is hier niet nodig.

**Wat zwak was aan de voorpagina (Klassiek).**

| Plek | Probleem | Waarom het telt |
| --- | --- | --- |
| Opening | Tekst over een drukke foto, weggezakt in een waas | De kop moet tegen het beeld vechten; elke hovenierssite doet dit |
| Wat ik doe | Drie gelijke afgeronde kaarten met chips en een ronde pijl | Precies het sjabloon dat de brief uitsluit; de foto's laden laat en de derde kaart is een sfeerbeeld |
| Uitgelicht werk | Twee gelijke vakken voor/na | Geen ritme, geen verhaal, geen bijschrift |
| Afsluiter | Losse kop met een omlijnde pijl | Geen tweede weg (WhatsApp), terwijl Nick die verkiest boven bellen |
| Overal | Één compositie herhaald, overal dezelfde hoek (16 px) | Niets valt op; het ziet eruit als "een site" in plaats van als GRØNN |

Het sterkste materiaal stond al in de repo maar niet op de voorpagina: de
**observatiekaders** (`/proef/observatie`), de zin "eerst water, bodem en
licht, dan pas de planten", en twee echte projecten met bijschriften.

## 2. Positionering (besluit 3 okt 2026, ongewijzigd)

> Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in
> Stein en omgeving, met een vaste prijs vooraf.

Wat GRØNN onderscheidt en wat de site moet laten zíen, niet zeggen:

1. **Kijken voor maken.** Nick begint bij water, bodem en licht. Dat is het
   verhaal van de observatiekaders.
2. **Eén persoon.** Van het eerste gesprek tot de laatste plant.
3. **Vaste prijs vooraf** waar het kan.
4. **Lokaal**: Stein plus ~30 km.

## 3. Doelgroepen en doelen

| Wie | Komt voor | Moet vinden | Conversie |
| --- | --- | --- | --- |
| Huiseigenaar met een vijver die troebel/vermoeid is | Hulp, vertrouwen | Dat Nick snapt wat er misgaat; echt werk | Kennismaken of WhatsApp |
| Huiseigenaar die een natuurlijke tuin wil | Ontwerp + aanleg | Een aanpak, geen catalogus | Kennismaken |
| Iemand die snel iets wil kopen | Borderpakket, cadeaubon | De shop | Mollie-betaling |

Primaire conversie: **Kennismaken** (formulier). Secundair: **WhatsApp**.
Bellen staat niet vooraan (Nick zit overdag op locatie).

## 4. Informatiearchitectuur

De bestaande routes blijven; de brief noemt routes als startpunt, niet als
eis, en oude adressen staan in Google en in mails.

```
/                 Voorpagina (nieuw: Veldboek)
/vijvers          Dienst: vijvers
/tuinen           Dienst: tuinen  → /tuinen/borderpakketten, /cadeaubon, /materialen
/werk             Dossiers        → /werk/vijverrenovatie, /werk/terras-geulle
/over             Studio / Nick
/journaal         Stukken
/kennismaken      Start een project
/faq · /privacy · /voorwaarden · /herroeping · /colofon
```

Navigatie: de pil blijft (Home, Werk, Studio, Shop, menu; besluit 18 okt).
Voet: drie kolommen, nu in antraciet.

## 5. Voorpagina, sectie voor sectie

Mobiel eerst ontworpen; desktop is de uitgerekte versie, niet andersom.

| # | Sectie | Doel | Compositie |
| --- | --- | --- | --- |
| 00 | **Opening** (papier) | In twee seconden: wie, wat, waar, en waarom anders | Veldboekregel in mono; enorme kop in drie regels *Eerst water, / bodem en licht. / Dan pas de planten.*; foto met drie hoekhaken; één zin; Kennismaken + WhatsApp |
| 01 | **Wat ik doe** (papier) | Drie diensten, geen kaarten | Index als lijst: groot nummer, Syne-titel, werkwoorden in mono, pijl; op desktop schuift er bij aanwijzen een beeld mee |
| 02 | **Observatie 001** (antraciet) | Bewijs van vakkennis zonder testimonials | De bestaande observatiefoto met vijf kaders, legenda eronder, kop links |
| 03 | **Dossiers** (papier) | Echt werk, redactioneel | Asymmetrisch: GR/001 groot links, GR/002 kleiner en verspringend rechts, met code, jaar, status en bijschrift |
| 04 | **Werkwijze** (papier) | Vertrouwen via helderheid | Vier genummerde uitspraken + portret van Nick |
| 05 | **Afsluiter** (antraciet) | Conversie | Grote kop, Kennismaken, WhatsApp, e-mail |

Licht/donker wisselt bewust: papier → papier → **antraciet** → papier →
papier → **antraciet** → voet. Elk vlak heeft een eigen compositie.

## 6. Gebruikersreizen

- **Vijver met problemen** → opening → Observatie 001 ("hij ziet wat ik
  niet zie") → Dossier GR/001 → Kennismaken.
- **Nieuwe tuin** → opening → Wat ik doe → /tuinen → Kennismaken.
- **Snel kopen** → pil → Shop.

## 7. Contentbehoeften (niet verzonnen; wacht op Nick)

- Meer projecten met toestemming: de dossierreeks draagt er nu twee.
- Een tweede observatie (tuin, niet vijver) zodra er een geschikte foto is.
- Echte eindfoto GR/001 na de aanplant van voorjaar 2027.
- Beslissing over het Klassiek/Blueprint-experiment (zie §8).

## 8. Open besluiten voor Nick

1. **Kleur.** De brief vraagt crème + antraciet; het besluit van 11 okt was
   zand + aardebruin. Deze branch volgt de brief (de nieuwere opdracht):
   papier licht, antraciet donker, oranje blijft het ene accent. Groen alleen
   uit foto's, dus het "geen groen"-besluit blijft overeind.
2. **Layout-experiment.** De Blueprint-voorpagina (`html.plan`) is niet
   aangeraakt, zodat de meting doorloopt. Na deze branch voelt Klassiek
   als "Veldboek"; beslis of het experiment stopt.
3. **Mergen.** Deze PR staat als concept en wordt niet gemerged zonder jouw ja.
