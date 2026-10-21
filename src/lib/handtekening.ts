import { BUSINESS } from "@/lib/business"
const SITE_URL = "https://gronn.studio"

// De e-mailhandtekening (eigenaar, 28 sep 2026: "maak de email
// handtekening uitgebreider en zet deze op de website"; "dan kan ik de
// html weergave kopieren en plakken in gmail").
//
// Mailprogramma's lezen geen stylesheets: alles is een tabel met inline
// stijl, en elk beeld is een absolute URL op gronn.studio, want de
// ontvanger haalt het daar op. De gegevens komen uit business.ts; de
// kleuren zijn die van de huisstijl (Complete branding, Editie 02):
// antraciet, donkeroranje als tekst op licht, grijs voor bijzaken,
// bosgroen voor de belofte. De drie diensticonen zijn de tegels uit het
// beeldsysteem, het woordmerk is de bestaande vector als png.
//
// Het portret is al rond uitgesneden (transparante hoeken), dus geen
// border-radius: Outlook negeert die toch. Breedte én min-/max-breedte
// staan vast: een tabelcel die krimpt drukte de foto anders tot een
// ovaal, want de hoogte bleef 64 (eigenaar, 28 sep 2026: "foto looks
// weird").
//
// De groet erboven staat in Syne Bold (eigenaar, 21 okt 2026). Gmail laadt
// bij de ontvanger geen webfont, dus het is een plaatje (groet.png, 3x) met
// de tekst als alt, zoals het woordmerk.

const BEELD = `${SITE_URL}/brand/mail`

const TEKST = "font-family:Montserrat, Arial, Helvetica, sans-serif;"
const GRIJS = "#5C5A54"
const ORANJE = "#FF5B04"
const ANTRACIET = "#202020"
const BOS = "#23483A"

function link(href: string, tekst: string, kleur = ORANJE) {
  return `<a href="${href}" style="color:${kleur}; text-decoration:none;">${tekst}</a>`
}

function dienst(bestand: string, naam: string) {
  return `<td style="padding:0 14px 0 0; vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr><td style="padding:0 6px 0 0; vertical-align:middle;"><img src="${BEELD}/${bestand}.png" width="16" height="16" alt="" style="display:block; border:0; width:16px; height:16px;"></td><td style="${TEKST} font-size:12px; line-height:16px; color:${ANTRACIET}; vertical-align:middle; white-space:nowrap;">${naam}</td></tr></table></td>`
}

// De socials zoals in de voet van de site (eigenaar, 21 okt 2026: "maak
// handtekening de socials zelfde als de footer"): Instagram, WhatsApp en
// LinkedIn als ronde knopjes, hier als png (3x), want mail kent geen svg.
function social(href: string, bestand: string, naam: string) {
  return `<td style="padding:0 8px 0 0; vertical-align:middle;"><a href="${href}" style="text-decoration:none;"><img src="${BEELD}/${bestand}.png" width="28" height="28" alt="${naam}" style="display:block; border:0; width:28px; height:28px;"></a></td>`
}

const website = SITE_URL.replace("https://", "")

/** De handtekening als HTML, klaar om in Gmail, Outlook of Apple Mail te plakken. */
export const HANDTEKENING_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse; ${TEKST} color:${ANTRACIET};">
<tr>
<td colspan="2" style="padding:0 0 14px 0;"><img src="${BEELD}/groet.png" width="206" height="22" alt="Met vriendelijke groet," style="display:block; border:0; width:206px; height:22px;"></td>
</tr>
<tr>
<td width="80" style="padding:0 16px 0 0; vertical-align:top; width:64px; min-width:64px;"><img src="${BEELD}/portret.png" width="64" height="64" alt="Nick Peters" style="display:block; border:0; width:64px; min-width:64px; max-width:64px; height:64px;"></td>
<td style="padding:0; vertical-align:top;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
<tr><td style="${TEKST} padding:2px 0 0 0; font-size:15px; line-height:22px; font-weight:600; color:${ANTRACIET};">Nick Peters</td></tr>
<tr><td style="${TEKST} padding:0 0 10px 0; font-size:13px; line-height:20px; color:${GRIJS};">Hovenier en ecologisch ontwerper · ${BUSINESS.name}</td></tr>
<tr><td style="padding:0 0 10px 0;"><table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr><td width="40" height="2" style="width:40px; height:2px; line-height:2px; font-size:0; background:${ORANJE};">&nbsp;</td></tr></table></td></tr>
<tr><td style="${TEKST} padding:0; font-size:13px; line-height:21px; color:${ANTRACIET};">${link(BUSINESS.phoneHref, BUSINESS.phone, ANTRACIET)} &nbsp;·&nbsp; ${link(BUSINESS.whatsapp, "WhatsApp")}</td></tr>
<tr><td style="${TEKST} padding:0 0 12px 0; font-size:13px; line-height:21px; color:${ANTRACIET};">${link(BUSINESS.emailHref, BUSINESS.email)} &nbsp;·&nbsp; ${link(SITE_URL, website)}</td></tr>
<tr><td style="padding:0 0 12px 0;"><table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr>${dienst("ontwerp", "Ontwerp")}${dienst("aanleg", "Aanleg")}${dienst("onderhoud", "Onderhoud")}</tr></table></td></tr>
</table>
</td>
</tr>
<tr>
<td colspan="2" style="padding:12px 0 0 0; border-top:1px solid #D6D5D2;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
<tr>
<td style="padding:0 14px 0 0; vertical-align:middle;"><a href="${SITE_URL}" style="text-decoration:none;"><img src="${BEELD}/woordmerk.png" width="96" height="20" alt="${BUSINESS.name}" style="display:block; border:0; width:96px; height:20px;"></a></td>
<td style="${TEKST} padding:0; font-size:12px; line-height:18px; color:${BOS}; vertical-align:middle;">Een tuin die met je meegroeit.</td>
<td style="padding:0 0 0 16px; vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr>${social(BUSINESS.instagram, "instagram", "Instagram")}${social(BUSINESS.whatsapp, "whatsapp", "WhatsApp")}${social(BUSINESS.linkedin, "linkedin", "LinkedIn")}</tr></table></td>
</tr>
</table>
</td>
</tr>
<tr>
<td colspan="2" style="${TEKST} padding:8px 0 0 0; font-size:11px; line-height:17px; color:${GRIJS};">${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city} · KVK ${BUSINESS.kvk}</td>
</tr>
</table>`

/** De beelden die de handtekening van gronn.studio laadt. */
export const HANDTEKENING_BEELDEN = ["groet", "portret", "ontwerp", "aanleg", "onderhoud", "woordmerk", "instagram", "whatsapp", "linkedin"].map(
  (naam) => `/brand/mail/${naam}.png`,
)
