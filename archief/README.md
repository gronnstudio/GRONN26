# Archief

Naslag, geen code van deze site. Niets hier wordt gebouwd, getypecheckt,
gelint, door Tailwind gelezen of naar Vercel geüpload (zie
[ADR 0009](../docs/architecture/decisions/0009-archief-van-de-vorige-site.md)).
Pas niets aan en importeer niets; wil je iets hergebruiken, kopieer het naar
`src/` en laat het daar voldoen aan de regels van nu.

## gronn-studio/ — de vorige site (juli – oktober 2026)

Momentopname van repo [`gronnstudio/gronn-studio`](https://github.com/gronnstudio/gronn-studio),
tak `main`, commit `73d59af` (5 okt 2026), op 29 okt 2026 overgenomen. Foto's,
video en lettertypen (68 bestanden, 16 MB) zijn weggelaten; die staan in de
oude repo, en de projectfoto's staan ook in `public/projecten/` van deze site.
De oude repo blijft bestaan met zijn hele geschiedenis en serveert nog
links.gronn.studio.

Die site doorliep V2 (menuwiel, Engelse routes), V3 en V5 (van scratch, 23 sep
2026), en ging op 9 okt 2026 over naar deze repo.

### Waar je wat vindt

| Bestand | Wat erin staat |
| --- | --- |
| [CLAUDE-oud.md](gronn-studio/CLAUDE-oud.md) | De regels van de oude site: Brand Guide 2026 (kleur, type, logo), V5, de telefoonnavigatie, ontwerpregels uit Nicks feedback. Hernoemd zodat Claude Code het niet als geldende regels laadt. |
| [AGENTS-oud.md](gronn-studio/AGENTS-oud.md) | De agentregels van toen (hernoemd, zelfde reden). |
| [OPERATIONS.md](gronn-studio/OPERATIONS.md) | Handboek: domein, DNS (Cloudflare), mail, FormSubmit, Vercel, terugrollen. |
| [ROADMAP.md](gronn-studio/ROADMAP.md) | Merkplan GRØNN × Equilibrium en de stand toen. |
| [TECH-STACK.md](gronn-studio/TECH-STACK.md) | Techniek van de oude site en Equilibrium. |
| [PROGRESS.md](gronn-studio/PROGRESS.md) | Klantportaal, eigenaar-dashboard en intake van toen (Supabase). |
| [HOURS_MANIFEST.md](gronn-studio/HOURS_MANIFEST.md), [website-hours.md](gronn-studio/website-hours.md) | Werklog en uren aan de website (geheugensteun voor DigiBoox). |
| [TIMEVAULT/](gronn-studio/TIMEVAULT/) | Het geheugen van het project: architectuur, besluiten, experimenten, problemen, tijdlijn. |
| [docs/](gronn-studio/docs/) | Awwwards-plan, referenties, worklog, perf-metingen, concepten, shopplan. |
| `src/`, `tests/`, `supabase/` | De code van de oude site, ter naslag. |

Wat daar besloten werd en nu nog geldt, staat overgenomen in
[docs/besluiten.md](../docs/besluiten.md). Bij verschil geldt die, niet het archief.

### Aangepast bij het overnemen

De repo is openbaar, dus echte klantgegevens zijn vervangen: namen en adressen
van klanten heten in het archief "Klant & Partner", "Vijverklant",
"Voorbeeldstraat 1", en het projectbedrag staat op 0. De oude repo heeft de
oorspronkelijke versie.
