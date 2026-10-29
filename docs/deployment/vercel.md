# Uitrol

- Productietak `claude/brave-einstein-no9sq8`; samenvoegen = live op gronn.studio.
  Controleer na een merge dat er een productiedeploy voor die commit is.
- Takken bouwen geen preview (kostenbesparing, 9 okt 2026).
- Omgevingsvariabelen: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `AUTH_SECRET`, `EDITOR_ALLOWED_EMAIL`, `BLOB_READ_WRITE_TOKEN`,
  `ANTHROPIC_API_KEY`. Het CRM vraagt geen nieuwe.
- `CRM_LOKAAL=1` zet de opslag op een map (`.crm-data/`) voor tests en lokaal
  werken; op Vercel (`VERCEL=1`) wordt hij genegeerd.
- Terugrollen: `npx vercel rollback` of de knop in Vercel. Zie
  architecture/overview.md §3 voor wat er met de gegevens gebeurt.
