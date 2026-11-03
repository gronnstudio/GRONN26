# ADR 0002 · Geld in centen, hoeveelheden in duizendsten

29 okt 2026 · **Besloten**

Geld is een geheel getal in centen, een hoeveelheid in duizendsten, een
percentage in honderdsten van een procent (bp). Invoer wordt als tekst
ontleed (`leesDecimaal`), nooit als `Number("12,34") * 100`. Afronden op één
plek (`deel`): half weg van nul.

**Afrondregels**
- Verkoopprijs per eenheid = inkoop + opslag, op de cent; regelbedrag = prijs per eenheid × hoeveelheid, op de cent. Zo klopt de regel op de offerte met wat de klant narekent.
- Afval verhoogt de hoeveelheid (55 m² + 7 % = 58,85 m²), op 0,001.
- Btw per tarief over de som van dat tarief, één keer afgerond.
- Onvoorzien en korting naar rato over de tarieven verdeeld (grootste rest), zodat de grondslagen exact optellen tot de verkoop.
- Stuks planten altijd naar boven; arbeid uit dagproductie naar boven op een half uur.

**Niet gekozen:** een decimal-bibliotheek (`decimal.js`, `big.js`). Gehele
getallen tot 2^53 zijn ruim genoeg (tot ± 90 biljoen euro) en het scheelt een afhankelijkheid.

De oude `Stuk.bedrag` (offertes en facturen uit DigiBoox) staat nog in euro's;
dat is overgenomen administratie, geen rekenwerk. Bij de facturatiemodule gaat
dat naar centen.
