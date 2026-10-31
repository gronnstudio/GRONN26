# Werkwijze: zo werk je in deze repo

Voor Claude Code, GPT/Codex en iedereen die meewerkt. De regels voor AI-agents
staan ook in [AGENTS.md](../AGENTS.md); dit document legt de hele cyclus uit.

## 1. Voor je begint

- **Lees** [besluiten.md](besluiten.md) voor wat Nick al heeft besloten, en de
  ADR's in [architecture/decisions/](architecture/decisions/).
- **Gouden regel:** de eenvoudigste versie die werkt. Een nieuwe pagina,
  animatie, instelling of afhankelijkheid moet een bezoeker of Nick echt
  helpen. Vraagt Nick iets complexers, bouw dan de gewone versie en zeg in één
  zin wat je wegliet en waarom.
- **Nick beslist.** Geeft hij een concrete ontwerpkeuze (kleur, icoon, tekst),
  dan bouw je die. Een risico (contrast) noem je in één zin; je weigert niet.
- **Kijk naar open PR's** die dezelfde bestanden raken. Bij overlap: wachten
  of rebasen. Nooit op andermans branch pushen.

## 2. Branch en PR

- De productietak is `claude/brave-einstein-no9sq8`. Er is geen `main`; een PR
  naar `main` faalt met "base invalid".
- Werk op een eigen branch vanaf de productietak (`claude/…` voor Claude,
  `codex/…` voor Codex).
- Elke PR noemt de mappen die hij raakt, en wat je getest hebt.
- Commitberichten en PR-titels in het Nederlands, in gewone taal: wat de
  bezoeker of Nick merkt ("Offerte met privélink: bekijken en akkoord zonder
  inlog").

## 3. Controleren

```bash
npm run check   # tsc + eslint + next build + Playwright, zoals CI
```

- Playwright draait tegen de productiebuild op poort 3210 en hergebruikt een
  server die daar al draait. Stop eerst een oude `next-server`, anders
  verwijzen pagina's naar CSS die niet meer bestaat en falen ~20 tests op
  "overloop".
- Nieuwe specs importeren `test`/`expect` uit `./fixtures`, niet uit
  `@playwright/test`: de fixture laat foto's buiten de AVIF-omzetting om, wat
  de tests op een koude CI-runner stabiel houdt.
- Na een kleurwijziging: contrast meten (4,5:1 voor tekst, 3:1 voor iconen).
- CI (`.github/workflows/quality.yml`) draait één keer per commit: op de PR, en
  op een push naar de productietak. Alleen `.md` of `docs/` gewijzigd: geen CI.
  Faalt een test die je PR niet raakt op `net::ERR_ABORTED`, draai de job één
  keer opnieuw.

## 4. Review

- **Verplicht door GPT/Codex** voor PR's die `src/app/api`, `src/lib/crm`,
  `src/app/dashboard`, inlog/toegang of `.github/` raken (Nick, 29 okt 2026).
  Codex reviewt een niet-concept-PR vanzelf; op een concept: opmerking
  `@codex review`.
- Elke bevinding krijgt één status: `opgelost` (commit + test), `weerlegd`
  (bewijs) of `besluit Nick`. Eén tegenronde, daarna beslist Nick.
- Niet mergen met een open P0 of P1.
- Raadplegen tijdens het bouwen: `node scripts/gpt.mjs` of de skills
  `/review-with-gpt` en `/vraag-gpt`. Er gaat alleen code naar buiten, nooit
  `.env*`, `.crm-data/`, foto's of klantgegevens. Zie
  [ai-samenwerking.md](ai-samenwerking.md).

## 5. Mergen en uitrol

- Claude merget zijn eigen PR's na groene CI (Nick, 29 sep en 9 okt 2026),
  behalve waar review verplicht is en nog iets openstaat, en behalve PR's die
  als concept "niet mergen" heten.
- Samenvoegen in de productietak = live op gronn.studio binnen een minuut.
- **Controleer na elke merge** dat Vercel een productiedeploy voor die commit
  heeft gemaakt. Op 21 okt 2026 kwam er na drie merges geen enkele; toen hielp
  een handmatige deploy met `gitSource` naar de productietak.
- Takken bouwen geen preview (kosten, 9 okt 2026). Een preview alleen als Nick
  erom vraagt; de stappen staan in [deployment/vercel.md](deployment/vercel.md).
- Terugrollen: `npx vercel rollback` of de knop in Vercel.

## 6. Versies en releases

Zie [ADR 0010](architecture/decisions/0010-versies-en-releases.md) en
[CHANGELOG.md](../CHANGELOG.md).

## 7. Documentatie bijhouden

Bij elke PR die iets merkbaars verandert:

| Wat veranderde | Werk bij |
| --- | --- |
| iets wat Nick besloot | [besluiten.md](besluiten.md), en een ADR als het de opbouw raakt |
| een CRM-module | [implementation-progress.md](implementation-progress.md), [CHANGELOG.md](CHANGELOG.md) (CRM) |
| de site of het systeem, voor een release | [../CHANGELOG.md](../CHANGELOG.md) onder "Nog niet uitgebracht" |
| een omgevingsvariabele | [deployment/vercel.md](deployment/vercel.md) |
| een pagina of route | [architecture/site.md](architecture/site.md) |

Schrijf in het Nederlands, in volzinnen, met datum. Een besluit noemt wie het
nam en waarom.

## 8. Wat nooit

- Geen sleutels, klantgegevens of `.crm-data/` in een commit.
- Geen test overslaan of uitzetten om groen te worden.
- Geen nieuwe afhankelijkheid zonder ADR (ADR 0003).
- Geen bedragen als kommagetal (ADR 0002); getallen van een model zijn een
  voorstel, nooit een uitkomst (ADR 0007).
- Niets in `archief/` aanpassen of importeren; het is naslag.
