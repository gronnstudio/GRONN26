import QRCode from "qrcode"

import { SITE_URL } from "@/lib/seo"
import { VCARD_PAD } from "@/lib/vcard"

/** Wat de QR op het visitekaartje draagt: de vCard, absoluut. */
export const VCARD_URL = `${SITE_URL}${VCARD_PAD}`

/**
 * De QR als inline SVG, op de server gebouwd (de contactpagina is
 * statisch, dus bij `next build`) — nooit een externe dienst. Niveau M,
 * vier modules stille zone, antraciet op gebroken wit in beide thema's:
 * een scanner heeft een lichte rand nodig.
 */
export async function qrSvg(data: string = VCARD_URL): Promise<string> {
  return QRCode.toString(data, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 4,
    color: { dark: "#202020", light: "#efeeea" },
  })
}
