# ADR 0006 · Video via beelden uit de browser

29 okt 2026 · **Voorgesteld** (fase 1 intake, zie [../intake.md](../intake.md))

**Vraag.** De opdracht wil een locatievideo laten analyseren. De Claude API
neemt afbeeldingen en tekst aan, geen video en geen audio.

**Besluit.** De video gaat privé naar Blob (client-upload, hooguit 200 MB).
De browser haalt er met `<video>` en `<canvas>` beelden uit (één per 3 s,
hooguit 20, plus scènewissels), elk met tijdcode, en stuurt die als JPG naar
de server. Claude krijgt de beelden met tijdcodes. Gesproken uitleg wordt niet
uitgeschreven; Nick spreekt notities in met spraak naar tekst.

**Waarom.** Geen ffmpeg op de server, geen nieuwe afhankelijkheid (ADR 0003),
geen nieuwe betaalde dienst, en de bevindingen verwijzen naar een beeld dat
Nick zelf terugziet.

**Wat het kost.** Op een oude telefoon duurt het uitpakken even; dat gebeurt
met een voortgangsbalk. Formaten die de browser niet afspeelt (sommige HEVC
op Android) geven een duidelijke melding.

**Opnieuw bekijken** als de API video of audio gaat aannemen.
