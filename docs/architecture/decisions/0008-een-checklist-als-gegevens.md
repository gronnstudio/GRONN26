# ADR 0008 · Eén checklist, als gegevens

29 okt 2026 · **Voorgesteld** (fase 1 intake, zie [../intake.md](../intake.md))

**Vraag.** Er staan twee lijsten in code: `INTAKE` (vragen) en `CHECKLIST`
(afvinken). De opdracht wil categorieën die de beheerder zonder code aanpast,
met vervolgvragen per werksoort.

**Besluit.** Eén sjabloon in `crm/checklist.json`, bewerkbaar in het
dashboard. De startinhoud staat in code en wordt gebruikt zolang er geen
bestand is. Elke wijziging verhoogt het versienummer; een antwoord bewaart
vraag-id, vraagtekst en sjabloonversie. Vragen worden nooit hernummerd of
echt verwijderd, alleen "vervallen".

**Waarom.** Oude intakes blijven leesbaar na elke wijziging, en een nieuwe
werksoort (zwemvijver, groendak) is een paar vragen met `toonBij`.

**Wat het kost.** Een bewerkscherm en een omzetting van de bestaande
antwoorden en vinkjes bij het eerste lezen.
