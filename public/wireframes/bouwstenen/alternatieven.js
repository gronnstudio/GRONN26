/* Bouwstenen uit de alternatieve wireframes: keuze, veldboek, systeem,
   contactvel, verhaal, menu-boven, combi-*, werk-*, project-*, vijvers-,
   tuinen-, over- en kennismaken-varianten, privacy en 404.
   Formaat: zie prototype.js. Dubbelingen met prototype.js zijn weggelaten.
   A–D en werk-1/2 leveren niets: hun stijl staat inline op een omhullende
   div (los: wit vlak, schreefletter) en ze lopen op de telefoon uit beeld. */
window.BOUWSTENEN = (window.BOUWSTENEN || []).concat([
  // Menu
  { id: 'alt-menu-balk', groep: 'Menu', naam: 'Menubalk bovenaan', bron: 'menu-boven', kies: 'header.balk', vast: true, toel: 'Logo, vier woorden en Kennismaken in één balk.' },
  { id: 'alt-menu-onder', groep: 'Menu', naam: 'Menu onderaan (alleen telefoon)', bron: 'menu-boven', kies: 'nav.onder', vast: true, toel: 'Bij de balk bovenaan: de vier woorden onderin, alleen op de telefoon.' },

  // Opening
  { id: 'alt-combi-spread', groep: 'Opening', naam: 'Spread met plaat en knoppen', bron: 'combi-spread', kies: 'section.spread' },
  { id: 'alt-combi-volle-foto', groep: 'Opening', naam: 'Foto schermvullend, alleen woordmerk', bron: 'combi-volle-foto', kies: 'section.volle' },
  { id: 'alt-combi-na-foto', groep: 'Opening', naam: 'Kop en zin na de volle foto', bron: 'combi-volle-foto', kies: 'section.na-foto', wrap: true },
  { id: 'alt-combi-typo', groep: 'Opening', naam: 'Alleen typografie, heel groot', bron: 'combi-typografie', kies: 'section.typo', wrap: true },
  { id: 'alt-combi-kort', groep: 'Opening', naam: 'Korte opening (kop + zin)', bron: 'combi-stappen-eerst', kies: 'section.kort', wrap: true },
  { id: 'alt-combi-contactvel', groep: 'Opening', naam: 'Contactvel boven de kop', bron: 'combi-contactvel', kies: 'section[aria-labelledby="kop"]', wrap: true, toel: 'Twee rijen kleine foto’s van al het werk, daaronder kop en zin.' },
  { id: 'alt-combi-veldboek', groep: 'Opening', naam: 'Veldboek als opening', bron: 'combi-veldboek', kies: 'section.boek', wrap: true, toel: 'Wie en wat links, het werk als logboek rechts.' },
  { id: 'alt-keuze-opening', groep: 'Opening', naam: 'Projectnamen als kop', bron: 'keuze', kies: 'section.opening', wrap: true, toel: '001 Vijverrenovatie, 002 Terras Geulle — het werk is de kop.' },
  { id: 'alt-contactvel-onder', groep: 'Opening', naam: 'Kop en zin naast elkaar', bron: 'contactvel', kies: 'section.onder', wrap: true },

  // Foto's
  { id: 'alt-keuze-foto', groep: "Foto's", naam: 'Schermbrede foto + bijschrift', bron: 'keuze', kies: 'section.foto' },
  { id: 'alt-contactvel', groep: "Foto's", naam: 'Contactvel: alle foto’s', bron: 'contactvel', kies: 'div.vel', wrap: true },
  { id: 'alt-strook', groep: "Foto's", naam: 'Fotostrook om door te vegen', bron: 'project-strook', kies: 'section[aria-labelledby="strook-kop"]' },
  { id: 'alt-terras-pad', groep: "Foto's", naam: 'Twee staande foto’s, verspringend', bron: 'project-terras', kies: 'section[aria-label="Het pad"]', wrap: true },

  // Tekening
  { id: 'alt-systeem-opening', groep: 'Tekening', naam: 'Kop naast de waterroute', bron: 'systeem', kies: 'section.opening', wrap: true, toel: 'Opening: kop en zin links, schema rechts.' },
  { id: 'alt-combi-tekening', groep: 'Tekening', naam: 'Tekening groot, kop eronder', bron: 'combi-tekening-groot', kies: 'section[aria-labelledby="kop"]', wrap: true },
  { id: 'alt-vijvers-tekening', groep: 'Tekening', naam: 'Paginakop met tekening (Vijvers)', bron: 'vijvers-tekening', kies: 'section.opening', wrap: true },
  { id: 'alt-strook-route', groep: 'Tekening', naam: 'Waterroute groot met uitleg', bron: 'project-strook', kies: 'section[aria-labelledby="route"]', wrap: true },

  // Over
  { id: 'alt-over-kort', groep: 'Over', naam: 'Over mij, kort (groot portret)', bron: 'over-kort', kies: 'section.kort', wrap: true },

  // Zo werk ik
  { id: 'alt-over-kort-stappen', groep: 'Zo werk ik', naam: 'Zes stappen met grote kop', bron: 'over-kort', kies: 'section[aria-labelledby="stappen-kop"]', wrap: true },

  // Diensten
  { id: 'alt-vijvers-open', groep: 'Diensten', naam: 'Dienstrijen die openklappen', bron: 'vijvers-open', kies: 'section.rijen', wrap: true },
  { id: 'alt-tuinen-fasen', groep: 'Diensten', naam: 'Drie fasen naast elkaar (Tuinen)', bron: 'tuinen-fasen', kies: 'div.fasen', wrap: true },

  // Werk
  { id: 'alt-systeem-werk', groep: 'Werk', naam: 'Drie foto’s met bijschrift', bron: 'systeem', kies: 'section[aria-labelledby="werk-kop"]', wrap: true },
  { id: 'alt-verhaal-werk', groep: 'Werk', naam: 'Twee projectkaarten, verspringend', bron: 'verhaal', kies: 'section[aria-labelledby="h-werk"]', wrap: true },
  { id: 'alt-keuze2-werk', groep: 'Werk', naam: 'Werklijst (jaar, code, titel)', bron: 'keuze-2', kies: 'section[aria-labelledby="werk-kop"]', wrap: true },
  { id: 'alt-veldboek', groep: 'Werk', naam: 'Veldboek: vaste kolom + logboek', bron: 'veldboek', kies: 'main.boek', wrap: true },
  { id: 'alt-tijdlijn', groep: 'Werk', naam: 'Tijdlijn per maand', bron: 'werk-tijdlijn', kies: 'ol.lijn-tijd', wrap: true },
  { id: 'alt-werk-contactvel', groep: 'Werk', naam: 'Eén project als contactvel', bron: 'werk-contactvel', kies: 'section.groep', wrap: true },
  { id: 'alt-tuinen-werk', groep: 'Werk', naam: 'Eén project, foto rechts (Tuinen)', bron: 'tuinen-fasen', kies: 'section[aria-labelledby="tuin-werk"]', wrap: true },

  // Project
  { id: 'alt-strook-cijfers', groep: 'Project', naam: 'Het project in vier cijfers', bron: 'project-strook', kies: 'section[aria-label="Het project in cijfers"]', wrap: true },
  { id: 'alt-terras-stappen', groep: 'Project', naam: 'De werkzaamheden in stappen', bron: 'project-terras', kies: 'section[aria-labelledby="werk-stappen"]', wrap: true },
  { id: 'alt-sticky-boek', groep: 'Project', naam: 'Hele verhaal met inhoud opzij', bron: 'project-sticky', kies: 'div.boek', wrap: true, toel: 'Lang: twaalf hoofdstukken met foto, de inhoud blijft links staan.' },

  // Kennismaken
  { id: 'alt-keuze-einde', groep: 'Kennismaken', naam: 'Groot Kennismaken met pijl', bron: 'keuze', kies: 'section.einde', wrap: true },
  { id: 'alt-systeem2-einde', groep: 'Kennismaken', naam: 'Kennismaken + contactregel', bron: 'systeem-2', kies: 'section.einde', wrap: true },
  { id: 'alt-kennis-stappen', groep: 'Kennismaken', naam: 'Formulier in vijf stappen', bron: 'kennismaken-stappen', kies: 'form#vorm', wrap: true },
  { id: 'alt-kennis-direct', groep: 'Kennismaken', naam: 'Bellen, mailen, appen', bron: 'kennismaken-direct', kies: 'nav.wegen', wrap: true },
  { id: 'alt-kennis-adres', groep: 'Kennismaken', naam: 'Adres en KVK', bron: 'kennismaken-direct', kies: 'section.adres', wrap: true },
  { id: 'alt-verzonden', groep: 'Kennismaken', naam: 'Bericht verzonden', bron: 'kennismaken-verzonden', kies: 'section.staat[aria-labelledby="s1"]', wrap: true },
  { id: 'alt-verzonden-mislukt', groep: 'Kennismaken', naam: 'Verzenden mislukt', bron: 'kennismaken-verzonden', kies: 'section.staat[aria-labelledby="s2"]', wrap: true },

  // Juridisch, overig
  { id: 'alt-privacy', groep: 'Juridisch', naam: 'Juridische tekst met inhoud opzij', bron: 'privacy', kies: 'div.juridisch', wrap: true },
  { id: 'alt-404', groep: 'Overig', naam: '404: niets + de weg terug', bron: '404', kies: 'main', wrap: true },
])
