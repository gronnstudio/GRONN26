# Documentatie · GRØNN-CRM

Het CRM is het dashboard achter de inlog op gronn.studio (`/dashboard`),
uitgebouwd tot bedrijfssysteem voor een hoveniersbedrijf: van aanvraag via
opname en calculatie naar offerte, project en factuur. De publieke site staat
er los van; niets hier verandert iets voor bezoekers.

Begin bij [implementation-progress.md](implementation-progress.md) voor wat er
nu echt werkt, en [roadmap.md](roadmap.md) voor wat komt.

| Onderwerp | Bestand |
| --- | --- |
| Opbouw, audit van wat er al was, migratie | [architecture/overview.md](architecture/overview.md) |
| Gegevensmodel | [architecture/database.md](architecture/database.md) |
| Intake en projectvoorbereiding (plan) | [architecture/intake.md](architecture/intake.md) |
| Beslissingen (ADR) | [architecture/decisions/](architecture/decisions/) |
| AI-samenwerking (Claude × GPT/Codex) | [ai-samenwerking.md](ai-samenwerking.md) |
| Ontwerp en tokens | [design/design-system.md](design/design-system.md) |
| Componenten | [design/components.md](design/components.md) |
| Modules en hun stand | [product/modules.md](product/modules.md) |
| Werkstromen | [product/workflows.md](product/workflows.md) |
| Inlog en rechten | [security/authorization.md](security/authorization.md) |
| Koppelingen | [integrations/README.md](integrations/README.md) |
| Testen | [testing/strategy.md](testing/strategy.md) |
| Uitrol | [deployment/vercel.md](deployment/vercel.md) |
| Wijzigingen | [CHANGELOG.md](CHANGELOG.md) |

Stand-labels, overal hetzelfde en eerlijk: **Gepland**, **Bezig**,
**Gebouwd** (werkt in de app), **Getest** (ook automatisch getest),
**Productieklaar** (getest, gebruikt met echte gegevens, geen bekende gaten).
Een scherm dat bestaat is nog geen werkende module.
