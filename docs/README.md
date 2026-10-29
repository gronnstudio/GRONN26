# Documentatie · GRONN26

De kennisbank van de site en het systeem. Nieuw hier? Lees in deze volgorde:

1. [../README.md](../README.md): wat dit is en hoe je het start;
2. [werkwijze.md](werkwijze.md): branches, PR's, CI, review, mergen, uitrol;
3. [besluiten.md](besluiten.md): wat Nick heeft besloten, met datum;
4. [architecture/site.md](architecture/site.md) en [architecture/overview.md](architecture/overview.md): hoe het in elkaar zit.

## Het CRM

Het CRM is het dashboard achter de inlog op gronn.studio (`/dashboard`),
uitgebouwd tot bedrijfssysteem voor een hoveniersbedrijf: van aanvraag via
opname en calculatie naar offerte, project en factuur. De publieke site staat
er los van; niets hier verandert iets voor bezoekers.

Begin bij [implementation-progress.md](implementation-progress.md) voor wat er
nu echt werkt, en [roadmap.md](roadmap.md) voor wat komt.

| Onderwerp | Bestand |
| --- | --- |
| Werkwijze | [werkwijze.md](werkwijze.md) |
| Besluiten van Nick | [besluiten.md](besluiten.md) |
| Opbouw van de publieke site | [architecture/site.md](architecture/site.md) |
| Opbouw van het CRM, audit, migratie | [architecture/overview.md](architecture/overview.md) |
| Gegevensmodel | [architecture/database.md](architecture/database.md) |
| Intake en projectvoorbereiding (plan) | [architecture/intake.md](architecture/intake.md) |
| Beslissingen (ADR), met overzicht | [architecture/decisions/](architecture/decisions/README.md) |
| AI-samenwerking (Claude × GPT/Codex) | [ai-samenwerking.md](ai-samenwerking.md) |
| Ontwerp en tokens | [design/design-system.md](design/design-system.md) |
| Componenten | [design/components.md](design/components.md) |
| Modules en hun stand | [product/modules.md](product/modules.md) |
| Werkstromen | [product/workflows.md](product/workflows.md) |
| Inlog en rechten | [security/authorization.md](security/authorization.md) |
| Koppelingen | [integrations/README.md](integrations/README.md) |
| Testen | [testing/strategy.md](testing/strategy.md) |
| Uitrol | [deployment/vercel.md](deployment/vercel.md) |
| Wijzigingen CRM | [CHANGELOG.md](CHANGELOG.md) |
| Releases van site en systeem | [../CHANGELOG.md](../CHANGELOG.md) |
| Ideeën (niet besloten) | [ideas/](ideas/) |

Stand-labels, overal hetzelfde en eerlijk: **Gepland**, **Bezig**,
**Gebouwd** (werkt in de app), **Getest** (ook automatisch getest),
**Productieklaar** (getest, gebruikt met echte gegevens, geen bekende gaten).
Een scherm dat bestaat is nog geen werkende module.
