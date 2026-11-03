# 2026-09-30 — GRØNN Command Center, fase 1

Het begin van `/os`: de shell, de GRØNN Core, het commandopalet en de
vijverrenovatie (Vijverklant) als eerste project met een volledige
controleweergave. Beslissingen en open vragen staan in
[`docs/gronn-os/README.md`](../gronn-os/README.md).

## Wat er besloten is

- **Gebouwd in deze repo onder `/os`**, niet in `gronncore` (die was
  leeg). Hergebruikt fonts, tokens, eigenaarslogin, de vijverdata en de
  foto's, en elke PR krijgt een preview.
- **Elke `/os`-pagina controleert zelf de eigenaar**, niet alleen de
  layout. Een layout die de inlogpoort teruggeeft stuurt de markup van de
  pagina tóch mee in de RSC-payload; `os-gate.spec.ts` vond zo de
  klantnamen van de Core in een uitgelogd antwoord. Die spec bewaakt het
  nu.
- **Geen GSAP, geen Three.js**: AGENTS.md verbiedt een tweede
  animatiebibliotheek, en de Core werkt als SVG + DOM.
- **Oranje alleen voor "dit vraagt je aandacht"**; groen (salie) voor
  actief, gezond en focus. Eerste versie had de verlopen leads als twee
  grote oranje bogen in de Core: te luid, nu één klein oranje punt per
  boog.

## Wat er verworpen is

- Een draaiende baan voor de projectnodes ("radial nodes gently
  reposition"): draait ook de labels, en beweging zonder betekenis.
- Kaarten "Nog geen foto's" voor projecten zonder beeld op de Core: twee
  lege grijze vlakken naast de vijverfoto. Nu zijn dat regels met de
  stand en de volgende stap.
