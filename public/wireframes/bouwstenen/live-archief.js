/* Bouwstenen uit het live archief (WF-060 … WF-082): de vastgelegde pagina's
   van de oude site gronn.studio. Elke naam zegt "(oude site)".
   Formaat: zie prototype.js. De dashed noten "Op de live site: …" komen mee
   waar ze in hetzelfde element staan. */
window.BOUWSTENEN = (window.BOUWSTENEN || []).concat([
  /* ── Menu ─────────────────────────────────────────────────────────── */
  { id: 'oud-menubalk', groep: 'Menu', naam: 'Menubalk desktop (oude site)', bron: 'oud-menus', kies: 'div.balk', wrap: true, toel: 'Logo, Studio/Diensten/Projecten met paneel, Start een project, Zoeken ⌘K en drie ikonen.' },
  { id: 'oud-paneel-studio', groep: 'Menu', naam: 'Uitklappaneel Studio (oude site)', bron: 'oud-menus', kies: 'div.paneel.r3', wrap: true, toel: 'Drie kolommen: de praktijk, waar ik op let, inloggen.' },
  { id: 'oud-paneel-diensten', groep: 'Menu', naam: 'Megamenu Diensten (oude site)', bron: 'oud-menus', kies: 'div.paneel.diensten-p', wrap: true, toel: 'Elf diensten in drie groepen, met prijzen en een kaart "Nu actueel".' },
  { id: 'oud-zoekvenster', groep: 'Menu', naam: 'Zoekvenster ⌘K (oude site)', bron: 'oud-menus', kies: 'section[aria-label="Zoekvenster"]', wrap: true },
  { id: 'oud-telefoonmenu', groep: 'Menu', naam: 'Telefoon: bovenbalk, dock en voorkeurpanelen (oude site)', bron: 'oud-menus', kies: 'section[aria-label="Telefoon"]', wrap: true, toel: 'Dock in twee standen, plus de panelen Weergave en Kleur.' },
  { id: 'oud-randen', groep: 'Menu', naam: 'Zijbubbels en Omhoog (oude site)', bron: 'oud-menus', kies: 'section[aria-label="Zijbubbels en terug naar boven"]', wrap: true },

  /* ── Opening ──────────────────────────────────────────────────────── */
  { id: 'oud-held', groep: 'Opening', naam: 'Held: foto schermvullend met tekst (oude site)', bron: 'oud-voorpagina', kies: 'section.held', wrap: true, toel: 'Donkere foto, label, grote kop, zin, oranje knop en Nick als afzender.' },
  { id: 'oud-checklist-kop', groep: 'Opening', naam: 'Kop met knoppen (Checklist, oude site)', bron: 'oud-checklist', kies: 'main > section:first-of-type', wrap: true },
  { id: 'oud-herfst-kop', groep: 'Opening', naam: 'Kop van een seizoenspagina (Herfstbeurt, oude site)', bron: 'oud-herfstbeurt', kies: 'main > section:first-of-type', wrap: true },
  { id: 'oud-winkel-kop', groep: 'Opening', naam: 'Kop met "zo werkt het" (Winkel, oude site)', bron: 'oud-winkel', kies: 'main > section:first-of-type', wrap: true },

  /* ── Foto's ───────────────────────────────────────────────────────── */
  { id: 'oud-projectfoto', groep: "Foto's", naam: 'Grote projectfoto met onderschrift (oude site)', bron: 'oud-project-terras', kies: 'main > figure', wrap: true },
  { id: 'oud-moestuin-strook', groep: "Foto's", naam: 'Twee fotostroken "Buiten de opdrachten" (oude site)', bron: 'oud-studio', kies: 'section[aria-label="Buiten de opdrachten"]', wrap: true, toel: 'Op de live site lopen de stroken als marquee in tegengestelde richting.' },

  /* ── Over ─────────────────────────────────────────────────────────── */
  { id: 'oud-merk', groep: 'Over', naam: 'Ontworpen voor leven: merk + drie pijlers (oude site)', bron: 'oud-voorpagina', kies: 'section[aria-label="Ontworpen voor leven."]', wrap: true },
  { id: 'oud-over-kort', groep: 'Over', naam: 'Wie er aan jouw tuin werkt (oude site)', bron: 'oud-voorpagina', kies: 'section[aria-label="Wie er aan jouw tuin werkt."]', wrap: true },
  { id: 'oud-over-kop', groep: 'Over', naam: 'Over mij: verhaal met portret (oude site)', bron: 'oud-studio', kies: 'section.over-kop', wrap: true },
  { id: 'oud-uitgangspunten', groep: 'Over', naam: 'Vijf uitgangspunten (oude site)', bron: 'oud-studio', kies: 'section#uitgangspunten', wrap: true },
  { id: 'oud-manifest', groep: 'Over', naam: 'Manifest: waar ik voor sta (oude site)', bron: 'oud-studio', kies: 'section#manifest', wrap: true },

  /* ── Zo werk ik ───────────────────────────────────────────────────── */
  { id: 'oud-werkwijze', groep: 'Zo werk ik', naam: 'Zes stappen (oude site, Studio)', bron: 'oud-studio', kies: 'section#werkwijze', wrap: true },
  { id: 'oud-herfst-stapjes', groep: 'Zo werk ik', naam: 'Zo begin je: stapjes op een vlak (Herfstbeurt, oude site)', bron: 'oud-herfstbeurt', kies: 'section.vlak', wrap: true },

  /* ── Diensten ─────────────────────────────────────────────────────── */
  { id: 'oud-diensten-drie', groep: 'Diensten', naam: 'Drie dienstrijen met prijs (oude site, voorpagina)', bron: 'oud-voorpagina', kies: 'section[aria-label="Van meekijken tot onderhouden."]', wrap: true },
  { id: 'oud-diensten-vijf', groep: 'Diensten', naam: 'Vijf dingen die ik maak (oude site, Diensten)', bron: 'oud-diensten', kies: 'section[aria-label="Vijf dingen die ik in een tuin maak."]', wrap: true },
  { id: 'oud-dienstgroep', groep: 'Diensten', naam: 'Dienstgroep met rijen: Ontwerp (oude site)', bron: 'oud-diensten', kies: 'section#ontwerp', wrap: true },
  { id: 'oud-dienst-sjabloon', groep: 'Diensten', naam: 'Sjabloon en inhoud van elf dienstpagina\'s (oude site)', bron: 'oud-dienstpaginas', kies: 'section#sjabloon', wrap: true },
  { id: 'oud-dienstblok', groep: 'Diensten', naam: 'Eén dienstpagina als blok (oude site)', bron: 'oud-dienstpaginas', kies: 'article#garden-design', wrap: true, toel: 'Regeneratief tuinontwerp: titel en raster met wat, voor wie, prijs.' },
  { id: 'oud-herfst-prijzen', groep: 'Diensten', naam: 'Wat het kost: drie prijzen (Herfstbeurt, oude site)', bron: 'oud-herfstbeurt', kies: 'section#prijzen', wrap: true },
  { id: 'oud-herfst-abo', groep: 'Diensten', naam: 'Onderhoudsabonnement (Herfstbeurt, oude site)', bron: 'oud-herfstbeurt', kies: 'section.sectie:has(.abo)', wrap: true },
  { id: 'oud-winkel-groep', groep: 'Diensten', naam: 'Winkelgroep met producten (oude site)', bron: 'oud-winkel', kies: 'section.wgroep', wrap: true },

  /* ── Werk ─────────────────────────────────────────────────────────── */
  { id: 'oud-uitgelicht', groep: 'Werk', naam: 'Uitgelicht project met fasen en cijfers (oude site)', bron: 'oud-voorpagina', kies: 'section[aria-label="Twee vijvers. Eén samenhangend watersysteem."]', wrap: true },
  { id: 'oud-projectkaarten', groep: 'Werk', naam: 'Projectkaarten onder elkaar (oude site)', bron: 'oud-projecten', kies: 'section[aria-label="Projecten"]', wrap: true },

  /* ── Project ──────────────────────────────────────────────────────── */
  { id: 'oud-vijver-kop', groep: 'Project', naam: 'Projectkop met fasen (oude site, vijver)', bron: 'oud-project-vijver', kies: 'section.pj-kop', wrap: true },
  { id: 'oud-terras-kop', groep: 'Project', naam: 'Projectkop kort (oude site, terras)', bron: 'oud-project-terras', kies: 'section.pj-kop', wrap: true },
  { id: 'oud-cijfers', groep: 'Project', naam: 'Het project in cijfers + feiten (oude site)', bron: 'oud-project-vijver', kies: 'section[aria-label="Het project in cijfers"]', wrap: true },
  { id: 'oud-inhoudsopgave', groep: 'Project', naam: 'Inhoudsopgave van twaalf hoofdstukken (oude site)', bron: 'oud-project-vijver', kies: 'nav.inhoudsopgave', wrap: true },
  { id: 'oud-hoofdstuk-fotos', groep: 'Project', naam: 'Hoofdstuk met tekst en fotopaar (oude site)', bron: 'oud-project-vijver', kies: 'section.hoofdstuk#opgave', wrap: true },
  { id: 'oud-hoofdstuk-tekening', groep: 'Project', naam: 'Hoofdstuk met waterroute-tekening (oude site)', bron: 'oud-project-vijver', kies: 'section.hoofdstuk#waterroute', wrap: true },
  { id: 'oud-hoofdstuk-tabel', groep: 'Project', naam: 'Hoofdstuk met beplantingstabel (oude site)', bron: 'oud-project-vijver', kies: 'section.hoofdstuk#beplanting', wrap: true },
  { id: 'oud-vijver-slot', groep: 'Project', naam: 'Slotblok van het project (oude site, vijver)', bron: 'oud-project-vijver', kies: 'section[aria-label="Een vijver die weer past bij de tuin"]', wrap: true },
  { id: 'oud-terras-werk', groep: 'Project', naam: 'De werkzaamheden met foto\'s (oude site, terras)', bron: 'oud-project-terras', kies: 'section[aria-label="De werkzaamheden"]', wrap: true },
  { id: 'oud-terras-citaat', groep: 'Project', naam: 'Citaat met beeld (oude site, terras)', bron: 'oud-project-terras', kies: 'section[aria-label="Citaat"]', wrap: true },
  { id: 'oud-volgend-project', groep: 'Project', naam: 'Volgend project (oude site)', bron: 'oud-project-terras', kies: 'section[aria-label="Volgend project"]', wrap: true },

  /* ── FAQ ──────────────────────────────────────────────────────────── */
  { id: 'oud-vragen-vijf', groep: 'FAQ', naam: 'Vijf vragen als kaarten (oude site, voorpagina)', bron: 'oud-voorpagina', kies: 'section[aria-label="Wat je wilt weten voordat je begint."]', wrap: true },
  { id: 'oud-faq-vragen', groep: 'FAQ', naam: 'Twaalf vragen openklapbaar (oude site, FAQ)', bron: 'oud-faq', kies: 'section[aria-label="Vragen"]', wrap: true },
  { id: 'oud-faq-niet-bij', groep: 'FAQ', naam: 'Staat je vraag er niet bij? (oude site)', bron: 'oud-faq', kies: 'section[aria-label="Staat je vraag er niet bij?"]', wrap: true },

  /* ── Kennismaken ──────────────────────────────────────────────────── */
  { id: 'oud-contact', groep: 'Kennismaken', naam: 'Contact: direct + formulier (oude site)', bron: 'oud-contact', kies: 'section.contact', wrap: true },
  { id: 'oud-contact-direct', groep: 'Kennismaken', naam: 'Liever direct? met visitekaartje (oude site)', bron: 'oud-contact', kies: 'div.donker.direct', wrap: true },
  { id: 'oud-checklist-aanmelden', groep: 'Kennismaken', naam: 'Checklist vooraf: aanmelden + inhoud (oude site)', bron: 'oud-voorpagina', kies: 'section[aria-label="Checklist vooraf"]', wrap: true },
  { id: 'oud-herfst-bellen', groep: 'Kennismaken', naam: 'Liever bellen of mailen? (Herfstbeurt, oude site)', bron: 'oud-herfstbeurt', kies: 'main > section:last-of-type', wrap: true },

  /* ── Voet ─────────────────────────────────────────────────────────── */
  { id: 'oud-voet', groep: 'Voet', naam: 'Slot + voet in één donker vlak (oude site)', bron: 'oud-voorpagina', kies: 'main > footer', wrap: true, toel: '"Zullen we eens naar jouw tuin kijken?", knoppen en een voet van vier kolommen.' },
  { id: 'oud-voet-kort', groep: 'Voet', naam: 'Voet schermbreed donker (oude site, korte weergave)', bron: 'oud-dienstpaginas', kies: 'footer.oudvoet', wrap: true },

  /* ── Juridisch ────────────────────────────────────────────────────── */
  { id: 'oud-voorwaarden', groep: 'Juridisch', naam: 'Algemene voorwaarden (oude site)', bron: 'oud-voorwaarden', kies: 'main', wrap: true },
  { id: 'oud-voorwaarden-zakelijk', groep: 'Juridisch', naam: 'Algemene voorwaarden zakelijk (oude site)', bron: 'oud-voorwaarden-zakelijk', kies: 'main', wrap: true },
  { id: 'oud-voorwaarden-portaal', groep: 'Juridisch', naam: 'Voorwaarden klantenportaal (oude site)', bron: 'oud-portaal', kies: 'div.jur', wrap: true },
  { id: 'oud-herroeping', groep: 'Juridisch', naam: 'Modelformulier herroeping (oude site)', bron: 'oud-herroeping', kies: 'main', wrap: true },
  { id: 'oud-colofon', groep: 'Juridisch', naam: 'Colofon: gegevens en documenten (oude site)', bron: 'oud-colofon', kies: 'main', wrap: true },

  /* ── Overig ───────────────────────────────────────────────────────── */
  { id: 'oud-checklist-deel', groep: 'Overig', naam: 'Checklistdeel met vinkpunten (oude site)', bron: 'oud-checklist', kies: 'section.deel', wrap: true },
  { id: 'oud-herfst-tips', groep: 'Overig', naam: 'Drie dingen die je zelf kunt doen (oude site)', bron: 'oud-herfstbeurt', kies: 'section.sectie:has(.tips)', wrap: true },
  { id: 'oud-techniek-filters', groep: 'Overig', naam: 'Filterknoppen Techniek (oude site)', bron: 'oud-techniek', kies: 'main > section:has(.filters)', wrap: true },
  { id: 'oud-techniek-groep', groep: 'Overig', naam: 'Techniek: groep gereedschapskaarten (oude site)', bron: 'oud-techniek', kies: 'section.groep', wrap: true },
  { id: 'oud-kalender-vandaag', groep: 'Overig', naam: 'Zon en maan vandaag (oude site, Tuinkalender)', bron: 'oud-tuinkalender', kies: 'section.sectie:has(.twee)', wrap: true },
  { id: 'oud-kalender-maanden', groep: 'Overig', naam: 'Twaalf maanden, twaalf regels (oude site)', bron: 'oud-tuinkalender', kies: 'section.sectie:has(.maanden)', wrap: true },
  { id: 'oud-kalender-zon', groep: 'Overig', naam: 'Zonnetabel per maand (oude site)', bron: 'oud-tuinkalender', kies: 'section.sectie:has(table.zon)', wrap: true },
  { id: 'oud-portaal-inlog', groep: 'Overig', naam: 'Inloggen klantportaal (oude site)', bron: 'oud-portaal', kies: 'div.inlog', wrap: true },
  { id: 'oud-links-bento', groep: 'Overig', naam: 'Linkpagina als bento (oude site)', bron: 'oud-links', kies: 'div.bento', wrap: true, toel: 'links.gronn.studio: tegels voor Nick, contact, WhatsApp, e-mail, projecten en diensten.' },
  { id: 'oud-404', groep: 'Overig', naam: '404 met voedselbos-perceel (oude site)', bron: 'oud-404', kies: 'div.nf', wrap: true },
])
