# 0011 · PDF van de offerte in de browser

Datum: 30 oktober 2026 · Status: aangenomen

## Context

Nick wil onder de offerte één knop die meteen een PDF downloadt en één knop om
te printen (30 okt 2026). Het printvenster ("Opslaan als PDF") was niet genoeg.

## Besluit

Twee nieuwe afhankelijkheden, alleen in de browser en pas geladen bij de klik:
`jspdf` (het PDF-bestand) en `html2canvas-pro` (het blad als afbeelding; de
gewone html2canvas kan niet met de oklch-kleuren van Tailwind 4).

Geen PDF op de server: headless Chrome op Vercel is zwaar en traag, en een
aparte PDF-opmaak (react-pdf) zou de huisstijl dubbel bijhouden.

## Gevolg

De PDF is een afbeelding per pagina: tekst is niet te selecteren. Voor een
offerte en een specificatie bij de factuur is dat genoeg. Wie selecteerbare
tekst wil, gebruikt Printen → Opslaan als PDF.
