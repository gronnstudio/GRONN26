# ADR 0012 · QR-code op de factuur

5 nov 2026 · **Aangenomen**

**Vraag.** Nick koos "Facturen in het dashboard" (5 nov 2026). Een factuur
krijgt een betaalcode: de Mollie-betaallink, of een SEPA-betaalcode
(EPC069-12) die elke bankapp leest. Daar is een QR-code voor nodig.

**Besluit.** `qrcode-generator` (MIT, geen eigen afhankelijkheden, ±60 kB,
alleen op de server). De code wordt een SVG-pad in de pagina: geen script
in de browser, scherp bij printen en in de PDF van ADR 0011.

**Afgewogen.** Zelf een QR-encoder schrijven (Reed-Solomon, maskers) is veel
code voor iets wat een kleine, oude bibliotheek goed doet. Een externe
QR-dienst zou het bedrag en de IBAN naar een derde sturen.

**Gevolg.** Eén afhankelijkheid erbij. Wil iemand hem weg, dan is alleen
`src/components/crm/qr.tsx` te vervangen.
