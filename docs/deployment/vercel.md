# Uitrol

- Vercel-project `gronn26` in team `gronn`. gronn.studio en www wijzen hierheen;
  links.gronn.studio hangt nog aan het oude project `gronn-studio`.
- Productietak `claude/brave-einstein-no9sq8`; samenvoegen = live op gronn.studio.
  Controleer na een merge dat er een productiedeploy voor die commit is. Komt
  er geen (gebeurde op 21 okt 2026), start er een met de Vercel-koppeling
  (`create_deployment`, target production, `gitSource` naar GRONN26, deze tak
  en de sha) of `npx vercel deploy --prod`.
- Takken bouwen geen preview (kostenbesparing, 9 okt 2026): de Ignored Build
  Step is `if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi`.
  Vraagt Nick om een preview: zet tijdelijk
  `… || [ "$VERCEL_GIT_COMMIT_REF" = "<branch>" ]` erbij, start een deploy voor
  die tak, en zet de oude regel terug zodra de build voorbij die stap is. De
  link (`gronn26-git-<branch>-gronn.vercel.app`) zit achter de Vercel-inlog.
- Buildmachine Basic, één teamlid, geen Speed Insights Plus of Observability Plus.

## Omgevingsvariabelen

Alleen in Vercel (en lokaal in `.env.local`, die niet in git staat).

| Variabele | Waarvoor | Zonder |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google-inlog voor het dashboard | `/dashboard` en `/offertes` geven 404 |
| `AUTH_SECRET` | ondertekent het inlogkoekje | idem |
| `EDITOR_ALLOWED_EMAIL` | het ene adres dat mag inloggen | niemand komt binnen |
| `BLOB_READ_WRITE_TOKEN` | privé Vercel Blob: CRM, aanvragen, foto's | niets wordt bewaard |
| `ANTHROPIC_API_KEY` | Grønn, urenvoorstel, vijverfoto | die functies werken niet |
| `MOLLIE_API_KEY` | betalen van borderpakketten en cadeaubon | geen online betaling |
| `APPLE_PASS_TYPE_ID`, `APPLE_TEAM_ID`, `APPLE_PASS_CERT`, `APPLE_PASS_KEY` | visitekaartje in Apple Wallet | geen Apple-pas |
| `GOOGLE_WALLET_ISSUER_ID`, `GOOGLE_WALLET_SERVICE_ACCOUNT` | visitekaartje in Google Wallet | geen Google-pas |
| `OPENAI_API_KEY` (of `OPENAI_API_KEY_FILE`), `GPT_MODEL` | alleen `scripts/gpt.mjs`, lokaal of in een sessie, niet op Vercel | geen GPT-review via het script |

- `CRM_LOKAAL=1` zet de opslag op een map (`.crm-data/`) voor tests en lokaal
  werken; op Vercel (`VERCEL=1`) wordt hij genegeerd.
- Een sleutel nooit in chat, code of commit; alleen als omgevingsvariabele of
  GitHub-secret.

## Terugrollen

`npx vercel rollback` of de knop in Vercel. Zie
[architecture/overview.md §3](../architecture/overview.md) voor wat er met de
gegevens gebeurt.
