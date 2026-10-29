# GRONN26

De website en het bedrijfssysteem van **GRØNN Studio**: vijvers en natuurlijke
tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.

- **Live:** https://gronn.studio (Vercel-project `gronn26`, team `gronn`)
- **Eigenaar:** Nick Peters · hello@gronn.studio · GitHub `gronnstudio`
- **Productietak:** `claude/brave-einstein-no9sq8`. Er is geen `main`.
  Samenvoegen in deze tak = binnen een minuut live.

Eén Next.js-app met twee delen:

| Deel | Waar | Voor wie |
| --- | --- | --- |
| Publieke site | `/`, `/vijvers`, `/tuinen`, `/werk`, `/over`, `/shop`, `/journaal`, `/kennismaken`, … | bezoekers |
| CRM (het "systeem") | `/dashboard`, `/offertes` achter Google-inlog | alleen Nick |
| Offerte voor de klant | `/offerte/[token]`, privélink zonder inlog | de klant met de link |

## Snel starten

```bash
npm ci
npm run dev            # http://localhost:3000
npm run check          # typecheck + lint + build + Playwright, zoals CI
CRM_LOKAAL=1 npm run dev   # CRM bewaart in .crm-data/ in plaats van Vercel Blob
```

Node 22. Zonder `GOOGLE_CLIENT_ID` en `AUTH_SECRET` geeft `/dashboard` een
404; de publieke site werkt zonder sleutels. Alle variabelen staan in
[docs/deployment/vercel.md](docs/deployment/vercel.md).

## Techniek

Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind 4,
Playwright. In productie verder alleen `@anthropic-ai/sdk`, `@vercel/blob`,
`@vercel/analytics`, `@vercel/speed-insights` en `passkit-generator`. Een
nieuwe afhankelijkheid vraagt een ADR (ADR 0003).

Next.js 16 wijkt af van wat de meeste modellen kennen: lees bij twijfel
`node_modules/next/dist/docs/` (zie [AGENTS.md](AGENTS.md)).

## Mappen

```
src/app/            pagina's en API-routes (publieke site, dashboard, api/)
src/components/     componenten; beheer/ en crm/ zijn van het dashboard
src/lib/data/       inhoud van de site als getypte data (geen CMS)
src/lib/crm/        domein van het CRM: geld in centen, rekenkern, opslag, toegang
src/lib/beheer/     lezen en schrijven per dashboardonderdeel
src/proxy.ts        houdt /dashboard en /offertes dicht
public/             foto's, video, iconen, wireframes (statische HTML)
tests/              Playwright; nieuwe specs importeren uit ./fixtures
scripts/            gpt.mjs (review door GPT), documenten.mjs
docs/               de kennisbank (hieronder)
```

## Documentatie

Begin bij **[docs/README.md](docs/README.md)**. Daar staan:

- [werkwijze](docs/werkwijze.md): branches, PR's, CI, mergen, uitrol controleren;
- [besluiten](docs/besluiten.md): alles wat Nick heeft besloten, met datum;
- [architectuur van de site](docs/architecture/site.md) en
  [van het CRM](docs/architecture/overview.md);
- de ADR's in [docs/architecture/decisions/](docs/architecture/decisions/);
- [AI-samenwerking](docs/ai-samenwerking.md): Claude Code schrijft, GPT/Codex reviewt.

Wijzigingen per release staan in [CHANGELOG.md](CHANGELOG.md).

## Regels die altijd gelden

1. **Gouden regel:** functioneel en eenvoudig. De eenvoudigste versie die werkt.
2. **Nick beslist** over scope, kosten, privacy, productie en smaak.
3. Geld in centen, nooit kommagetallen (ADR 0002).
4. Klantgegevens nooit naar een extern model, nooit in een commit.
5. Op de site staat nergens dat Claude de site bouwt.

## Archief

De vorige site staat in de privé-repo `gronnstudio/gronn-studio` (live tot
9 okt 2026; serveert nog links.gronn.studio). Wat daar besloten werd en nog
geldt, staat in [docs/besluiten.md](docs/besluiten.md).
