# 2026-09-01 — Het klantportaal, het dashboard en het afvoerputje

Eén lange ronde met veel PR's. De volledige beschrijving staat in
[`PROGRESS.md`](../../PROGRESS.md); dit is het gedistilleerde deel — wat
er besloten is, wat er verworpen is en met welke reden.

## Wat de eigenaar oplegde, en wat daaruit volgde

> `clientId moet uit de geauthenticeerde sessie komen. Nooit uit: query
> parameter, URL, form body, filename, projectnaam`

Dat is de reden dat `/clients` en `/clients/admin` aparte routes met
aparte API-handlers zijn, en niet één scherm met `if (isAdmin)`. Het is
ook de reden dat de server de intake-verwijzing zelf munt (datum + 48
willekeurige bits) in plaats van hem uit de projectnaam af te leiden: die
naam was een door de bezoeker ingevoerde string, en dus een adres waarop
iemand een token kon vragen naar het dossier van een echte klant.

> `Een leesfout mag nooit worden geïnterpreteerd als []`

Toegepast op twee plekken: `makeQuote` weigert te schrijven zolang de
leesstatus `error` is, en `readArchive()` geeft `status: "unavailable"`
terug in plaats van een lege lijst. Een lege lijst en "de opslag gaf geen
antwoord" zien er in code identiek uit, en maar één ervan is veilig om
overheen te schrijven.

> `Niet zelf juridisch gaan improviseren`

Aangehouden. `/privacy` en `/voorwaarden` zijn niet aangepast aan het
portaal; dat staat als openstaande actie voor de eigenaar.

## Verworpen, met de reden

**Omzet per dienst.** Zou het nuttigste cijfer op het dashboard zijn — het
enige dat zegt waar het geld vandaan komt — en het kan niet berekend
worden. Een `StudioDocument` draagt regels met vrije tekst en geen
dienst-slug. Matchen op woorden tegen de dienstentitels levert een grafiek
op die gezaghebbend oogt en rekenwerk op een toeval is. De pagina zegt dit
zelf, in plaats van het cijfer te verzinnen. Het kan zodra een document
weet welke dienst het beantwoordt.

**Een verwijderknop voor facturen.** Gevraagd, en bewust niet gebouwd.
Art. 52 AWR legt zeven jaar bewaarplicht op; een knop die een verzonden
factuur echt weggooit kan de boekhouding beschadigen. Archiveren doet wat
er gevraagd werd — de oude regel staat niet meer in de weg — zonder dat
risico.

**Gekleurde dienst-iconen.** `section-icons.tsx` legt vast dat elf
zelfgetekende dienst-iconen ooit gebouwd en verworpen zijn ("slaan op
oorlog"). De eigenaar heeft die regel expliciet overruled: *"omzeil
gekleurde iconen, ik geef toestemming!"* Wat er kwam is kleur zónder
clipart — `RowMark` draagt de landmeterindex in bestaande merktokens op
lage alpha. Een verlopen regel is ember en omringd, zodat een staat en
een versiering nooit verward kunnen worden.

**Een kalenderpakket voor de agenda.** Niet toegevoegd. Het scherm telt
twaalf vakjes; `season-year.tsx` deed het al met `div`'s en percentages.

**Responsive werk.** Op verzoek van de eigenaar volledig buiten scope:
*"Desktop-only voor de volledige omgeving… geen responsive/mobile werk
meenemen."* Dat geldt alleen voor het paneel — de publieke site blijft
mobiel eersteklas, zoals `CLAUDE.md` voorschrijft.

## Incidenten

**Ik heb een productiestoring veroorzaakt (#101).** De navigatie gaf
lucide-iconen als componenten door van een Server- naar een
Client-Component. `next build` slaagde en 146 tests slaagden, en het
scherm was stuk voor iedereen die ingelogd was — want een test zonder
sessie komt nooit verder dan het inlogscherm.

De structurele les, en de reden dat dit hier staat: **CI kan structureel
niets zien wat achter de Google-login staat.** Wat daar getest wordt zijn
invarianten in de bron (`panel-boundary.spec.ts`,
`intake-reference.spec.ts`, `secrets.spec.ts`, `archive-and-drain.spec.ts`)
en niet pagina's. Dat is een keuze, geen achterstand.

**Een vals alarm van 39 falende tests.** Een verouderde server op poort
3210 die `reuseExistingServer` hergebruikte, plus een ontbrekende
`NEXTAUTH_SECRET`. Na het vrijmaken van de poort en opnieuw bouwen: alles
groen. Het scheelde weinig of dit was als bevinding gemeld. Lokaal draaien
dus altijd met de variabele gezet en op een verse poort.

**Een audit van 42 agenten op het intakepad**: 30 bevestigd, 6 weerlegd.
Zeven hersteld in #102, waarvan de scherpste: de doorbel-e-mail stuurde
zolang Slack niet ingesteld is — de huidige configuratie — 12.000 tekens
antwoorden van de klant mee naar FormSubmit. Nu een melding en niets meer.
23 bevindingen staan nog open, waaronder `bg-accent` met
`text-gronn-white` op 1,15:1 in vijf paletten.

## Nog niet opgelost

De **mislukte upload** bij inzendingen met bestanden. Drie theorieën zijn
inmiddels weerlegd: het verschil in verwijzingen (hersteld, was het niet),
de typelijst (hersteld, was het niet) en het oude tabblad (hersteld, was
het niet). Sinds #103 bewaart het record de echte foutmelding van de
opslag. Eén testinzending mét bestanden maakt zichtbaar wat er werkelijk
gebeurt; zonder die inzending is er niets meer te raden.

## Voor wie dit oppakt

De Cijfers-tak (`f31b911`) staat nog op de oude `/clients/admin`-paden en
moet naar `/dashboard` verhuizen voordat hij samengevoegd kan worden.
`OPERATIONS.md` klopt niet meer in §1, §2, §6, §8 en §12.
