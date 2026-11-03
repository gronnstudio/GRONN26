# Werkstromen

## Aanvraag → klant → opname → calculatie (werkt nu)

1. Het formulier op Kennismaken stuurt een kopie naar `/api/aanvraag`.
   Dezelfde aanvraag binnen tien minuten telt één keer.
2. Dashboard, tab Klanten: **Maak klant →**. Bestaat de persoon al (zelfde
   e-mail, laatste negen cijfers van het nummer, of exact dezelfde naam), dan
   komt de aanvraag op de tijdlijn van die klant. Anders een nieuwe klant in
   fase Aanvraag, opvolgen morgen.
3. Klantkaart: fase, kans, waarde en opvolgdatum. Gesprekken en bezoeken op de tijdlijn.
4. Tab Tuinen: tuin toevoegen, opname invullen (maten, grond, licht, toegang,
   leidingen, afvoer, risico's, aannames), foto's per moment. Elke wijziging
   bewaart de vorige versie.
5. **Calculatie met deze maten →**: het rekenblad met de opname als
   beschrijving. Rekenhulp, catalogusprijzen, Grønns urenvoorstel.
   **Bewaar bij klant** maakt versie 1, 2, … .
6. ★ bij een regel zet de prijs in de catalogus.

## Nog niet (zie roadmap)

Calculatie → offerte met akkoord, akkoord → project, project → planning en
uren, facturen uit het CRM, onderhoudscontracten, klantportaal.
