/* Bouwstenen uit het gekozen prototype (WF-019 … WF-035).
   Formaat: { id, groep, naam, bron, kies, wrap?, toel? }
   - bron: bestandsnaam van een wireframe in /wireframes (zonder .html)
   - kies: CSS-selector van het stuk in dat wireframe (het eerste dat past)
   - wrap: true = in een .wrap zetten (het stuk stond in de paginakolom)
   De bouwer haalt het stuk live op, met de eigen <style> van dat wireframe. */
window.BOUWSTENEN = (window.BOUWSTENEN || []).concat([
  { id: 'kop-standaard', groep: 'Menu', naam: 'Kop: logo + weergave', bron: 'voorpagina', kies: 'header.kop', wrap: true, toel: 'Logo links, weergaveknop rechts; op telefoon ook Kennismaken.' },
  { id: 'menu-dock', groep: 'Menu', naam: 'Menu onderaan (dock)', bron: 'voorpagina', kies: 'nav.dock', vast: true, toel: 'Kennismaken in oranje, pil met vier woorden, pijl.' },

  { id: 'opening-kop-foto', groep: 'Opening', naam: 'Kop met foto en zin', bron: 'voorpagina', kies: 'section.opening', wrap: true },
  { id: 'opening-pagina-kop', groep: 'Opening', naam: 'Paginakop met inleiding', bron: 'vijvers', kies: 'section.pagina-kop', wrap: true },
  { id: 'opening-tuinen', groep: 'Opening', naam: 'Kop met tekst en foto (Tuinen)', bron: 'tuinen', kies: 'section.opening', wrap: true },
  { id: 'opening-project-held', groep: 'Opening', naam: 'Projectfoto schermvullend', bron: 'project-vijverrenovatie', kies: 'section.held' },
  { id: 'opening-project-titel', groep: 'Opening', naam: 'Projecttitel met fiche', bron: 'project-vijverrenovatie', kies: 'section.titel', wrap: true },

  { id: 'foto-beeld', groep: "Foto's", naam: 'Brede foto + paar', bron: 'voorpagina', kies: 'section.beeld', wrap: true },
  { id: 'foto-onderbreking', groep: "Foto's", naam: 'Schermbrede foto (onderbreking)', bron: 'vijvers', kies: 'div.onderbreking', wrap: true },
  { id: 'foto-slot', groep: "Foto's", naam: 'Groot slotbeeld', bron: 'project-vijverrenovatie', kies: 'main > section.sectie:not([aria-labelledby]):not([aria-label])' },

  { id: 'tekening-waterroute', groep: 'Tekening', naam: 'Waterroute met uitleg', bron: 'voorpagina', kies: 'section[aria-label="De waterroute"]', wrap: true },

  { id: 'over-kort', groep: 'Over', naam: 'Over: portret + zin', bron: 'voorpagina', kies: 'section[aria-labelledby="h-over"]', wrap: true },
  { id: 'over-verhaal', groep: 'Over', naam: 'Het hele verhaal (portret blijft staan)', bron: 'over', kies: 'section.verhaal', wrap: true },

  { id: 'stappen-zes', groep: 'Zo werk ik', naam: 'Zes stappen (openklapbaar op telefoon)', bron: 'voorpagina', kies: 'section[aria-labelledby="h-stappen"]', wrap: true },

  { id: 'diensten-vijvers', groep: 'Diensten', naam: 'Dienstrijen met prijs (Vijvers)', bron: 'vijvers', kies: 'section.rijen', wrap: true },
  { id: 'diensten-fase-1', groep: 'Diensten', naam: 'Fase met diensten (Tuinen · Kijken)', bron: 'tuinen', kies: 'section.fase', wrap: true },
  { id: 'diensten-vraag', groep: 'Diensten', naam: 'Eén veelgestelde vraag', bron: 'vijvers', kies: 'section[aria-label="Veelgestelde vraag"]', wrap: true },

  { id: 'werk-lijst-raster', groep: 'Werk', naam: 'Werk: lijst/raster', bron: 'werk', kies: 'main', wrap: true },
  { id: 'werk-blok-vijver', groep: 'Werk', naam: 'Eén project uitgelicht', bron: 'vijvers', kies: 'section[aria-labelledby="vijver-werk"]', wrap: true },

  { id: 'project-inleiding', groep: 'Project', naam: 'Leeskolom (inleiding)', bron: 'project-vijverrenovatie', kies: 'section.lees', wrap: true },
  { id: 'project-uitspraak', groep: 'Project', naam: 'Uitspraak + fotopaar', bron: 'project-vijverrenovatie', kies: 'section[aria-labelledby="opgave"]', wrap: true },
  { id: 'project-cijfer', groep: 'Project', naam: 'Groot cijfer', bron: 'project-vijverrenovatie', kies: 'section[aria-labelledby="cijfer1"]', wrap: true },
  { id: 'project-inhoud', groep: 'Project', naam: 'Inhoud: 12 hoofdstukken', bron: 'project-vijverrenovatie', kies: 'section[aria-labelledby="hoofdstukken"]', wrap: true },
  { id: 'project-tabel', groep: 'Project', naam: 'Beplantingstabel', bron: 'project-vijverrenovatie', kies: 'section[aria-labelledby="planten"]', wrap: true },
  { id: 'project-citaat', groep: 'Project', naam: 'Citaat', bron: 'project-vijverrenovatie', kies: 'section[aria-label="Citaat"]', wrap: true },
  { id: 'project-slot', groep: 'Project', naam: 'Slotzin + volgend project', bron: 'project-vijverrenovatie', kies: 'section[aria-label="Slot"]', wrap: true },

  { id: 'faq-vragen', groep: 'FAQ', naam: 'Alle vragen (openklapbaar)', bron: 'faq', kies: 'div.vragen', wrap: true },

  { id: 'kennis-formulier', groep: 'Kennismaken', naam: 'Formulier + gegevens', bron: 'kennismaken', kies: 'div.indeling', wrap: true },
  { id: 'kennis-vlak', groep: 'Kennismaken', naam: 'Kennismaken-vlak (bosgroen)', bron: 'voorpagina', kies: 'section.kennis' },
  { id: 'kennis-einde', groep: 'Kennismaken', naam: 'Groot "Kennismaken" onderaan', bron: 'over', kies: 'section.einde', wrap: true },

  { id: 'voet-colofon', groep: 'Voet', naam: 'Voet A: colofon', bron: 'voet-colofon', kies: 'footer', wrap: true },
  { id: 'voet-regel', groep: 'Voet', naam: 'Voet B: één regel', bron: 'voet-regel', kies: 'footer', wrap: true },
  { id: 'voet-woordmerk', groep: 'Voet', naam: 'Voet C: groot woordmerk', bron: 'voet-woordmerk', kies: 'footer', wrap: true },
])
