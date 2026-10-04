<!-- Het plan van Nick, 4 oktober 2026, ongewijzigd overgenomen. De uitwerking staat in 01-brief.md en de andere documenten in docs/. -->

# GRØNN Studio: plan nieuwe repo

4 oktober 2026

## Doel

Een nieuwe, kleine site voor GRØNN Studio waar het werk en de beelden de hoofdrol spelen, met de menubalk van Bart Kolenda als vorm. Er komen vijf pagina's, één knop en geen extra's.

Waarom een nieuwe repo: gronn-studio is gegroeid tot zo'n 14 pagina's, 90 elementen en een portaal, dashboard en editor. Opruimen kost meer dan opnieuw beginnen met alleen wat werkt. gronn-studio blijft live tot de nieuwe site klaar is.

## Voorbeelden

Alle voorbeelden laten het beeld spreken, hebben een menu van vier of vijf woorden en zetten één zin plus één knop in de opening.

| Site | Wat we overnemen |
| --- | --- |
| [Bart Kolenda](https://bartkolenda.com) | De menubalk onderaan: links de aanvraagknop, in het midden een glazen pil met vier woorden waarvan het actieve woord gevuld is, rechts een ronde pijl. Donkergroene grond. |
| [Phlypo](https://phlypo.com) | Het beeld leidt. Er zijn vier menuwoorden en de projecten hebben een code. De paginaovergangen zijn rustig. |
| [Studio Verde](https://studioverde.be) | De opening is één zin met één knop ("ontdek onze tuinen") en de tuinen staan als overzicht op een eigen pagina. |
| [Stefan Morael](https://stefanmorael.com) | De foto's staan schermbreed, met weinig tekst ertussen. |
| [Con-Tour](https://con-tour.be) | Het projectoverzicht is een raster met naam en plaats. |
| [Tuinarchitect Puur](https://tuinarchitectpuur.com) | De rustige typografie en de ruimte rond elke foto. |
| [Tuinpionier](https://tuinpionier.nl) | Tegenvoorbeeld: veel blokken en tekst door elkaar. Dit willen we niet. |

Voor de ronde menu's die we eerder bekeken: [Dribbble, circular navigation](https://dribbble.com/search/circular-navigation).

## Pagina's en menu

De site heeft vijf pagina's. Het menu is één balk onderaan, op elk scherm in dezelfde vorm.

| Pagina | Inhoud |
| --- | --- |
| Home | Een schermvullende foto met de positioneringszin en één knop. Daaronder de projecten groot, één regel over Nick en het contactblok. |
| Vijvers | De diensten als rijen met naam en vanaf-prijs, plus één foto. |
| Tuinen | Dezelfde opbouw als Vijvers. |
| Werk | Een raster met de projecten. Elke projectpagina mag uitgebreid zijn, met de fotostrook. |
| Over | Het portret, het verhaal en de werkwijze. |

- **Menubalk:** links Kennismaken in oranje met antraciet tekst. In het midden een glazen pil met Vijvers, Tuinen, Werk en Over, waarvan het actieve woord op salie staat. Rechts een ronde pijl die omlaag wijst en omhoog zodra je leest.
- **Telefoon:** de pil is schermbreed en Kennismaken staat bovenin naast het logo.
- **Kop:** het logo en één knop Weergave, voor kleur (Auto, Licht, Donker) en de leesopties.
- **Voet:** adres, KVK, de juridische pagina's en de FAQ.
- **Niet meer:** de waaier, de dock, de bubbels, de 404-game, de tuinkalender, de techniekpagina, ⌘K en de easter eggs.

## Techniek

We kiezen dezelfde basis als nu, maar dan klein. Alles wat geen bezoeker helpt, blijft weg.

- **Next.js 16 en Tailwind v4 op Vercel:** dit is bekend terrein, en een push naar main blijft een productie-deploy.
- **Inhoud als getypte data in de repo** (projecten, diensten, prijzen), zonder CMS.
- **Alleen Nederlandse routes;** Engels later, als iemand erom vraagt.
- **Beweging in CSS** (scroll-timelines, view transitions tussen pagina's) en geen GSAP. Elke animatie krijgt een stand voor minder beweging.
- **Het contactformulier blijft FormSubmit vanuit de browser,** zoals nu.
- **Checks:** build, lint, de contrastcheck en een paar Playwright-tests (menu, contact, 404, geen metadata in foto's).
- **Niet meenemen:** het portaal, het dashboard, de editor, de DEV-laag, NextAuth, Supabase en Vercel Blob.

## Wat meekomt uit gronn-studio

We kopiëren, we mergen niets.

- **De Brand Guide 2026:** de kleurtokens (60/30/10, oranje vlak met antraciet tekst), Syne, Montserrat en Geist Mono, de typeschaal met clamp, en de logo-SVG's zoals ze zijn.
- **Echt werk:** de vijverrenovatie en het terras in Geulle, met de webfoto's zonder metadata, plus het portret.
- **Teksten:** de positioneringszin, de diensten met de vanaf-prijzen, "Over mij", de FAQ, de privacyverklaring en de voorwaarden.
- **Bedrijfsgegevens:** `business.ts` als de enige bron.
- **Code die bewezen werkt:** de Uren-schakelaar met het pre-paint script, de fotostrook en de contrastcheck.
- **Redirects** voor de oude adressen (/services, /studio, /contact, /kennisbank), zodat geen link breekt.

## Stappen

1. Nick maakt de repo aan op GitHub (voorstel: `gronnstudio/gronn-site`) en voegt hem toe aan dit project.
2. Basis: Next.js, de tokens, de fonts, het logo en de kop en menubalk. Dat levert de eerste previewlink op.
3. Home en Werk, met de twee projecten.
4. Vijvers, Tuinen en Over, plus het contactblok.
5. Voet, juridische pagina's, FAQ, sitemap, redirects en de tests.
6. Nick kijkt op zijn telefoon en geeft akkoord.
7. Het domein gronn.studio verhuist in Vercel naar het nieuwe project, en gronn-studio blijft als archief bestaan.

### Open vragen

- [ ] Blijft de Engelse versie, of eerst alleen Nederlands?
- [ ] Gaan het portaal en het dashboard mee naar een aparte plek, of vervallen ze?
- [ ] Welke naam krijgt de nieuwe repo?
