# Wijzigingen

Releases van gronn.studio (site en systeem). Versie = datum van de release
([ADR 0010](docs/architecture/decisions/0010-versies-en-releases.md), voorgesteld).
Elke PR die iets merkbaars verandert, zet een regel onder "Nog niet uitgebracht".
De details van het CRM staan in [docs/CHANGELOG.md](docs/CHANGELOG.md).

## Nog niet uitgebracht

- Archief: de vorige site (gronn-studio) als naslag in `archief/`, buiten de build.
- Documentatie: README opnieuw, kennisbank met werkwijze, besluiten, opbouw van
  de site, overzicht van de ADR's en alle omgevingsvariabelen. ADR "GPT als
  reviewer" heet nu 0008 (twee ADR's droegen 0005).

## v2026.10.29 · De stand van 29 oktober 2026

De eerste release: alles wat sinds 4 okt 2026 in deze repo is gebouwd, tot en
met PR #159 (commit `b793e7d`).

### Site

- **Nieuwe site live** op gronn.studio sinds 9 okt; oude adressen van de vorige
  site worden doorgestuurd.
- **Opening en voorpagina:** vijver als opening, rustigere voorpagina, wie Nick
  is, Wat ik doe (Vijvers, Tuinen, Borderpakketten), vragen (lessen van
  danhoye.com).
- **Werk:** vijverrenovatie (met fotostapel) en terras Geulle; alleen echt werk.
- **Over mij:** het verhaal in hoofdstukken die zijwaarts schuiven.
- **Shop:** borderpakketten online bestellen en betalen via Mollie, cadeaubon
  met eigen bedrag, materialenpagina.
- **Journaal:** twintig stukken in tijdschriftopmaak.
- **Navigatie:** één glazen pil onderaan met Home, Werk, Studio, Shop en menu,
  Omhoog tijdens het lezen, komeet; brede balk bovenaan op desktop; zoeken met
  ⌘K en sneltoetsen; kruimelpad op elke subpagina.
- **Weergave:** Licht (aards zand) en Donker (warm aardebruin), Auto volgt de
  klok; twee layouts (Klassiek en Blueprint) 50/50 gemeten; minder beweging,
  groter, contrast, onderstreping; muziek.
- **Merk:** één oranje #FF5B04 uit het logo; voet in warm aardebruin.
- **Visitekaartje** voor Apple en Google Wallet, vCard, mailhandtekening.
- **Snelheid en toegankelijkheid:** AVIF/WebP, GSAP na de eerste verf,
  knopnamen gelijk aan de zichtbare tekst, zoomen aan.
- **Beveiliging:** basisheaders, veilig terugadres na inloggen.

### Systeem (dashboard en CRM)

- Dashboard met Vandaag, Aanvragen, Planning, Uren (urencriterium), Social,
  Leveranciers en Links; nieuw systeem met zijbalk, ⌘K en assistent Grønn.
- **CRM fase 0 en 1:** klanten en leads als pijplijn met klantkaart, tuinopname
  met geschiedenis en foto's, calculaties in centen met versies, catalogus met
  prijshistorie, aanvraag → klant zonder dubbelen.
- **Rekenblad Prijs berekenen:** vaste opslag per kostensoort, urenvoorstel,
  prijsoverzicht printen.
- **Offerte met privélink:** de klant bekijkt en geeft akkoord zonder inlog.
- Adres zoekt mee via PDOK.

### Werkwijze

- CI één keer per commit, met caches.
- Claude Code schrijft, GPT/Codex reviewt; `scripts/gpt.mjs` en de skills
  `/review-with-gpt` en `/vraag-gpt`.
- Plan voor intake en projectvoorbereiding (ADR 0005–0007, voorgesteld).
