# ADR 0010 · Versies en releases

29 okt 2026 · **Voorgesteld** (Nick: "there is also no release"; keuze ligt bij hem)

**Vraag.** De repo had geen tags en geen releases. Wat er wanneer live ging,
stond alleen in losse PR-titels.

**Voorstel.**
- Versie = de datum van de release: `vJJJJ.MM.DD` (CalVer), bij twee op één dag
  `vJJJJ.MM.DD.2`. Een website heeft geen afnemers die op een versienummer
  leunen; een datum zegt meteen wanneer iets live ging.
- [CHANGELOG.md](../../../CHANGELOG.md) in de hoofdmap. Elke PR die iets
  merkbaars verandert, zet een regel onder "Nog niet uitgebracht".
- Een release maak je wanneer een samenhangend stuk live staat (niet bij elke
  PR): kop "Nog niet uitgebracht" wordt de versie, tag op de commit van de
  productietak, GitHub-release met die tekst.
- De eerste release, `v2026.10.29`, markeert wat op 29 okt 2026 live staat
  (commit `b793e7d`), met een samenvatting van 4–29 okt.

**Niet gekozen.** SemVer (`v1.0.0`): de vraag "is dit groot of klein" levert
voor een site niets op. Automatische releases per merge: te veel ruis.
