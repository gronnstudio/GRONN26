# ADR 0007 · Claude stelt voor, de code rekent, Nick beslist

29 okt 2026 · **Voorgesteld** (fase 1 intake, zie [../intake.md](../intake.md))

**Besluit.**
1. Elke AI-taak (beeld, video, volledigheid, plan) is een eigen bestand in
   `src/lib/crm/ai/` met een vast JSON-schema; de server controleert de
   uitkomst voordat er iets wordt bewaard.
2. Hoeveelheden en prijzen komen alleen uit `rekenhulpen.ts` en `reken()`.
   Een getal van Claude is een voorstel voor invoer, nooit een uitkomst.
3. Alles wat Claude maakt, krijgt de stand "voorstel" tot Nick het
   bevestigt. Claude verstuurt, bestelt en wijzigt niets zelf.
4. Elke aanroep komt in de tijdlijn met taak, model en tokens; boven een
   maandbudget vraagt de knop eerst toestemming.
5. Claude krijgt geen naam, telefoon, e-mail of adres van de klant.

**Waarom.** Een rekenfout in een offerte kost geld en vertrouwen; een
taalmodel is goed in zien en uitleggen, niet in exact rekenen.
