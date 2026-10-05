/* Bouwstenen uit de Uncode-wireframes (WF-056 … WF-059) en het Kolenda-menu (WF-054).
   In de bouwer draaien geen scripts: elk blok staat stil in zijn uitweg-stand
   (zonder JS / Minder beweging). De toel noemt het effect dat het in het
   bronwireframe wél heeft. */
window.BOUWSTENEN = (window.BOUWSTENEN || []).concat([
  /* ── WF-056 Uncode Creative Architect ─────────────────────────────── */
  { id: 'unc-architect-held', groep: 'Opening', naam: 'Schermvullende foto, kop linksonder (Architect)', bron: 'uncode-architect', kies: 'section.held',
    toel: 'Effect in het bron: parallax, de foto schuift trager mee en de kop zakt en vervaagt tijdens scrollen.' },
  { id: 'unc-architect-diep', groep: 'Zo werk ik', naam: 'Donker blok: zin, zes stappen, diensten (Architect)', bron: 'uncode-architect', kies: 'section.diep',
    toel: 'Drie kolommen op antraciet. Effect in het bron: de kolommen komen zacht op als ze in beeld komen.' },
  { id: 'unc-architect-collage', groep: "Foto's", naam: 'Losse fotocollage met groot woord (Architect)', bron: 'uncode-architect', kies: 'section.collage',
    toel: 'Effect in het bron: "Vijvers en tuinen" schuift groot achter de foto\'s langs tijdens scrollen, en elke foto opent met een masker.' },
  { id: 'unc-architect-voet', groep: 'Voet', naam: 'Donkere voet in kolommen (Architect)', bron: 'uncode-architect', kies: 'footer.voet',
    toel: 'Groot "Kennismaken" links, contact en gegevens in kolommen. Effect in het bron: kolommen komen zacht op.' },

  /* ── WF-057 Uncode Creative Persona ───────────────────────────────── */
  { id: 'unc-persona-held', groep: 'Opening', naam: 'Grote kop "Dit ben ik" met draaibadge (Persona)', bron: 'uncode-persona', kies: 'section.held',
    toel: 'Effect in het bron: de kopregels komen uit een masker omhoog en de ronde tekstbadge draait mee met scrollen.' },
  { id: 'unc-persona-vol', groep: "Foto's", naam: 'Schermbrede foto (Persona)', bron: 'uncode-persona', kies: 'main > div.vol',
    toel: 'Effect in het bron: lichte parallax binnen het beeld.' },
  { id: 'unc-persona-verhaal', groep: 'Over', naam: '"Hallo! Dit is mijn verhaal" + portret (Persona)', bron: 'uncode-persona', kies: 'section.verhaal',
    toel: 'Effect in het bron: kop komt uit een masker omhoog, alinea\'s komen op.' },
  { id: 'unc-persona-diensten', groep: 'Diensten', naam: 'Lopende band + grote dienstnamen (Persona)', bron: 'uncode-persona', kies: 'section.donker',
    toel: 'Effect in het bron: de band schuift tijdens scrollen, en bij hover over een dienst loopt een foto met de muis mee.' },
  { id: 'unc-persona-werkwijze', groep: 'Zo werk ik', naam: 'Zes stappen op lichtgrijs (Persona)', bron: 'uncode-persona', kies: 'section.werkwijze',
    toel: 'Openklapbare stappen. Effect in het bron: kop uit een masker, stappen komen op.' },
  { id: 'unc-persona-slot', groep: 'Kennismaken', naam: 'Collage + groot Kennismaken + voetregel (Persona)', bron: 'uncode-persona', kies: 'section.slot',
    toel: 'Fotocollage half over het donkere slotblok, met contact en voetregel. Effect in het bron: foto\'s en tekst komen op.' },

  /* ── WF-058 Uncode Atelier (donker) ───────────────────────────────── */
  { id: 'unc-atelier-held', groep: 'Opening', naam: 'Reuzenkop GRØNN Studio + groeiende foto (Atelier)', bron: 'uncode-atelier', kies: 'section.held',
    toel: 'Donker. Effect in het bron: de reuzenkop blijft staan en de foto eronder groeit tijdens scrollen van 70 % naar vol (hier op 70 %).' },
  { id: 'unc-atelier-onthul', groep: 'Over', naam: 'Lange tekst die oplicht (Atelier)', bron: 'uncode-atelier', kies: 'section.onthul',
    toel: 'Donker. Effect in het bron: de tekst licht woord voor woord op tijdens scrollen.' },
  { id: 'unc-atelier-vel', groep: "Foto's", naam: 'Reuzenwoord + zwevende collage (Atelier)', bron: 'uncode-atelier', kies: 'section.vel',
    toel: 'Donker. Effect in het bron: het reuzenwoord schuift opzij en de foto\'s bewegen elk met hun eigen snelheid (parallax).' },
  { id: 'unc-atelier-stappen', groep: 'Zo werk ik', naam: 'Zes stappen op donker (Atelier)', bron: 'uncode-atelier', kies: 'section.blok[aria-labelledby="h-stappen"]',
    toel: 'Rustige openklapbare lijst, geen effect.' },
  { id: 'unc-atelier-diensten', groep: 'Diensten', naam: 'Diensten in twee kolommen (Atelier)', bron: 'uncode-atelier', kies: 'section.blok[aria-labelledby="h-diensten"]',
    toel: 'Vijvers en Tuinen naast elkaar, op donker. Geen effect.' },
  { id: 'unc-atelier-slot', groep: 'Kennismaken', naam: 'Grote foto + kolommen + reuzig Kennismaken (Atelier)', bron: 'uncode-atelier', kies: 'section.slot',
    toel: 'Donker, doet ook dienst als voet. Effect in het bron: de inhoud schuift trager over de foto (parallax).' },

  /* ── WF-059 Uncode Creative Freelance ─────────────────────────────── */
  { id: 'unc-freelance-opening', groep: 'Opening', naam: 'Kop in drie regels, één woord oranje (Freelance)', bron: 'uncode-freelance', kies: 'section.opening',
    toel: 'Effect in het bron: de woorden komen één voor één uit een gordijn omhoog en de kop zweeft trager mee (parallax).' },
  { id: 'unc-freelance-strook', groep: "Foto's", naam: 'Fotostrook op donker, opzij te scrollen (Freelance)', bron: 'uncode-freelance', kies: 'section.donker',
    toel: 'Effect in het bron: de strook schuift over de opening heen; stippen eronder kiezen een foto (die ontbreken hier).' },
  { id: 'unc-freelance-over', groep: 'Over', naam: 'Lange zin op bosgroen (Freelance)', bron: 'uncode-freelance', kies: 'section.groen',
    toel: 'Effect in het bron: de tekst licht woord voor woord op tijdens scrollen en klapt dicht met "Lees verder" (hier helemaal open).' },
  { id: 'unc-freelance-stappen', groep: 'Zo werk ik', naam: 'Raster 3 × 2 stappen (Freelance)', bron: 'uncode-freelance', kies: 'section.raster',
    toel: 'Effect in het bron: de stappen komen per kolom zacht op.' },
  { id: 'unc-freelance-portret', groep: "Foto's", naam: 'Portret over de volle breedte (Freelance)', bron: 'uncode-freelance', kies: 'main > div.portret',
    toel: 'In het bron schuift de voet over de onderrand van dit portret.' },
  { id: 'unc-freelance-voet', groep: 'Voet', naam: 'Donkere voet met zin en oranje knop (Freelance)', bron: 'uncode-freelance', kies: 'footer.voet',
    toel: 'Effect in het bron: schuift over het portret erboven, en de zin krijgt woord voor woord een onderstreping.' },

  { id: 'unc-architect-intro', groep: 'Over', naam: 'Architect: portret + lange intro (Lees meer)', bron: 'uncode-architect', kies: 'section.intro',
    toel: 'Portret links, lange intro rechts die onderaan vervaagt; in het bron klapt "Lees meer" hem open.' },

  /* ── WF-054 Menu naar Kolenda ─────────────────────────────────────── */
  { id: 'unc-kolenda-pil', groep: 'Menu', naam: 'Kolenda: glazen pil onderaan', bron: 'menu-kolenda', kies: 'nav.km', vast: true,
     toel: 'Vaste pil met vier woorden, half doorzichtig met blur. In het bron kleurt de tekst donker of licht naar de grond eronder; hier staat hij vast.' },
  { id: 'unc-kolenda-hoeken', groep: 'Menu', naam: 'Kolenda: Kennismaken links, pijl rechts', bron: 'menu-kolenda', kies: 'div.km-hoeken', vast: true,
    toel: 'De hoeken van het Kolenda-menu, alleen vanaf 1024 breed (op de telefoon leeg). Effect in het bron: het woord rolt bij hover, de pijl draait om naar "terug naar boven" tijdens scrollen.' },
])
