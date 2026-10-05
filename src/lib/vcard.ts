import { BUSINESS } from "@/lib/business"
const SITE_URL = "https://gronn.studio"

// De contactkaart (vCard 3.0, RFC 2426), alleen uit business.ts. Een
// waarde die daar niet staat, staat hier ook niet.

export const VCARD_PAD = "/contact.vcf"

/** RFC 2426 §4: komma, puntkomma en backslash ontsnappen. */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n")

export function bouwVcard(): string {
  const b = BUSINESS
  const tel = b.phoneHref.replace(/^tel:/, "")
  const regels = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${esc(b.owner.family)};${esc(b.owner.given)};;;`,
    `FN:${esc(`${b.owner.given} ${b.owner.family}`)}`,
    `ORG:${esc(b.name)}`,
    `TEL;TYPE=WORK,VOICE:${tel}`,
    `EMAIL;TYPE=INTERNET,WORK:${b.email}`,
    `URL:${SITE_URL}`,
  ]
  const a = b.address
  if (a) {
    regels.push(
      `ADR;TYPE=WORK:;;${esc(a.street)};${esc(a.city)};${esc(a.province)};${esc(a.postalCode)};${esc(a.country)}`
    )
  }
  regels.push("END:VCARD")
  return regels.join("\r\n") + "\r\n"
}
