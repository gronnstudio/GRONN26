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

const BEELD = `${SITE_URL}/brand/mail`

const TEKST = "font-family:Montserrat, Arial, Helvetica, sans-serif;"
const GRIJS = "#5C5A54"
const ORANJE = "#A14312"
const ANTRACIET = "#202020"
const BOS = "#23483A"

function link(href: string, tekst: string, kleur = ORANJE) {
  return `<a href="${href}" style="color:${kleur}; text-decoration:none;">${tekst}</a>`
}

function dienst(bestand: string, naam: string) {
  return `<td style="padding:0 14px 0 0; vertical-align:middle;"><table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;"><tr><td style="padding:0 6px 0 0; vertical-align:middle;"><img src="${BEELD}/${bestand}.png" width="16" height="16" alt="" style="display:block; border:0; width:16px; height:16px;"></td><td style="${TEKST} font-size:12px; line-height:16px; color:${ANTRACIET}; vertical-align:middle; white-space:nowrap;">${naam}</td></tr></table></td>`
}

const website = SITE_URL.replace("https://", "")
const instagram = BUSINESS.instagram.replace(/^https:\/\/(www\.)?instagram\.com\//, "@")

/** De handtekening als HTML, klaar om in Gmail, Outlook of Apple Mail te plakken. */
export const HANDTEKENING_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse; ${TEKST} color:${ANTRACIET};">
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
</tr>
</table>
</td>
</tr>
<tr>
<td colspan="2" style="${TEKST} padding:8px 0 0 0; font-size:11px; line-height:17px; color:${GRIJS};">${BUSINESS.address.street}, ${BUSINESS.address.postalCode} ${BUSINESS.address.city} · KVK ${BUSINESS.kvk} · ${link(BUSINESS.instagram, `Instagram ${instagram}`, GRIJS)}</td>
</tr>
</table>`

/** De beelden die de handtekening van gronn.studio laadt. */
export const HANDTEKENING_BEELDEN = ["portret", "ontwerp", "aanleg", "onderhoud", "woordmerk"].map(
  (naam) => `/brand/mail/${naam}.png`,
)
