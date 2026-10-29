# Roadmap

Volgorde van de eigenaar (29 okt 2026): Contacten → Leads → Tuinopname →
Calculatie → Offertes → Projecten → Facturen. Elke stap eindigt met tests en
een bijgewerkte [implementation-progress.md](implementation-progress.md).

## Fase 0 · Audit en opzet — klaar
Audit, architectuur, model, ADR's 0001–0004 (deze map).

## Fase 1 · Klanten, leads, opname, calculatie — klaar (PR 1)
Zie [product/modules.md](product/modules.md), modules 02–07.
**Acceptatie:** aanvraag → klant zonder dubbelen; opname met geschiedenis en
foto's; calculatie in centen met versies; catalogus onthoudt prijzen. Getest in `tests/crm*.spec.ts`.

## Fase 2 · Offertes en akkoord — volgende
- Offerte uit een calculatieversie: posten per groep, optioneel werk, uitgangspunten uit de opname (aannames), betaaltermijnen, geldig tot, voorwaarden en herroepingsformulier (particulier).
- De bestaande offertemaker (`/offertes`) leest de versie in plaats van een concept in de browser; nummer GR-O // JJJJMMDDNNNN, één nummer één keer.
- Stand: Concept → Verstuurd → Bekeken (alleen als het echt gemeten is) → Akkoord / Afgewezen / Verlopen; handmatig gezette stand heet ook zo.
- Akkoord door de klant via een eigen link met token (zonder inlog), met tijd en IP in de audit.
- **Acceptatie:** stap 6–7 van het scenario: offerte uit calculatie, klant geeft akkoord, fase gaat naar Akkoord, tijdlijn klopt; afgewezen en verlopen getest.

## Fase 3 · Projecten
Akkoord → project met fasen (instelbaar sjabloon: voorbereiding, sloop, grondwerk, …, oplevering) en taken; uren uit de registratie per project; nacalculatie: geschat tegenover werkelijk per kostensoort; meerwerk; opleverlijst.

## Fase 4 · Facturen
Aanbetaling, termijn, eind, los, credit. Na uitgifte onveranderbaar, correctie alleen met creditnota. Btw per regel (0/9/21, verlegd), KvK en btw-nummer uit `src/lib/business.ts`. Betaalstatus en herinneringen. De aangifte blijft in DigiBoox: export per kwartaal. Eerst nagaan wat DigiBoox als import accepteert, zodat er niets dubbel wordt ingevoerd.

## Fase 5 · Klant en onderhoud
Onderhoudscontracten (uren-bank, bezoeken, rapport), planning met agenda (Europe/Amsterdam, zomertijd), klantportaal op `/clients` met uitnodiging. **Hier gaat de opslag naar Postgres** (ADR 0001), omdat klanten eigen inlog en rijbeveiliging nodig hebben.

## Fase 6 · Verder
Plantendatabase en beplantingsplannen, automatiseringen (met log, idempotent, nooit zelf versturen zonder instelling), rapportages (geboekt ≠ gefactureerd ≠ ontvangen), ⌘K over het hele CRM.

## Losse punten
- Prullenbak in plaats van direct verwijderen; dagelijkse back-up van `dashboard/*.json`.
- `src/lib/beheer/data.ts` (to-do's, facturen, offertes) vervangen door CRM-gegevens.
- Het vaste stuk over Clannad & Stijn in `geheugen.ts` is van begin oktober en loopt achter; laten vervallen nu Grønn de klantkaart leest.
