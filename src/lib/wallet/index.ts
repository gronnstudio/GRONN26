import { createSign } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { PKPass } from "passkit-generator"
import { BUSINESS } from "@/lib/business"
import { APPLE_WWDR_G4 } from "./apple-wwdr"

// Het visitekaartje als Wallet-pas, voor Apple en Google (eigenaar, 12 okt
// 2026). Alles uit business.ts, net als de vCard. De sleutels staan alleen
// als omgevingsvariabelen in Vercel; zonder die variabelen bestaat de pas
// niet en tonen de pagina's de knoppen ook niet.

const SITE = "https://gronn.studio"
/** Wie de QR op de pas scant, komt op de linkpagina met "Bewaar in je contacten". */
const QR = `${SITE}/links`
const NAAM = `${BUSINESS.owner.given} ${BUSINESS.owner.family}`
const WAT = "Vijvers en natuurlijke tuinen"
const WAAR = "Stein en omgeving"
const a = BUSINESS.address

export const APPLE_PAD = "/wallet/visitekaartje.pkpass"

const env = (k: string) => process.env[k]?.trim() || undefined
/** PEM uit een omgevingsvariabele: Vercel bewaart regeleinden soms als \n. */
const pem = (k: string) => env(k)?.replace(/\\n/g, "\n")

export const appleKlaar = () =>
  Boolean(env("APPLE_PASS_TYPE_ID") && env("APPLE_TEAM_ID") && pem("APPLE_PASS_CERT") && pem("APPLE_PASS_KEY"))

export const googleKlaar = () => Boolean(env("GOOGLE_WALLET_ISSUER_ID") && env("GOOGLE_WALLET_SERVICE_ACCOUNT"))

/* ---------- Apple ---------- */

const veld = (key: string, label: string, value: string) => ({ key, label, value })

export async function bouwApplePas(): Promise<Buffer> {
  const beelden = ["icon", "icon@2x", "icon@3x", "logo", "logo@2x", "logo@3x", "thumbnail", "thumbnail@2x", "thumbnail@3x"]
  const map = path.join(process.cwd(), "public", "wallet")
  const bestanden: Record<string, Buffer> = {}
  for (const b of beelden) bestanden[`${b}.png`] = await readFile(path.join(map, `${b}.png`))

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: env("APPLE_PASS_TYPE_ID"),
    teamIdentifier: env("APPLE_TEAM_ID"),
    serialNumber: "visitekaartje-nick-peters",
    organizationName: BUSINESS.name,
    description: `Visitekaartje van ${NAAM}, ${BUSINESS.name}`,
    foregroundColor: "rgb(239, 238, 234)",
    backgroundColor: "rgb(32, 32, 32)",
    labelColor: "rgb(219, 105, 35)",
    sharingProhibited: false,
    generic: {
      primaryFields: [veld("naam", WAT, NAAM)],
      secondaryFields: [veld("tel", "Telefoon", BUSINESS.phone), veld("mail", "E-mail", BUSINESS.email)],
      auxiliaryFields: [veld("waar", "Werkgebied", WAAR)],
      backFields: [
        veld("over", BUSINESS.name, "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf."),
        veld("b-tel", "Telefoon", BUSINESS.phone),
        veld("b-mail", "E-mail", BUSINESS.email),
        veld("b-site", "Website", SITE),
        veld("b-insta", "Instagram", BUSINESS.instagram),
        veld("b-adres", "Adres", `${a.street}, ${a.postalCode} ${a.city}`),
        veld("b-kvk", "KVK", BUSINESS.kvk),
      ],
    },
    barcodes: [{ format: "PKBarcodeFormatQR", message: QR, messageEncoding: "iso-8859-1", altText: "gronn.studio" }],
  }
  bestanden["pass.json"] = Buffer.from(JSON.stringify(passJson))

  const pas = new PKPass(bestanden, {
    wwdr: APPLE_WWDR_G4,
    signerCert: pem("APPLE_PASS_CERT")!,
    signerKey: pem("APPLE_PASS_KEY")!,
    signerKeyPassphrase: env("APPLE_PASS_KEY_PASSPHRASE"),
  })
  return pas.getAsBuffer()
}

/* ---------- Google ---------- */

const tekst = (value: string) => ({ defaultValue: { language: "nl", value } })
const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url")

/** De "Toevoegen aan Google Wallet"-link: een door het serviceaccount ondertekende JWT. */
export function googleWalletLink(): string | null {
  const issuer = env("GOOGLE_WALLET_ISSUER_ID")
  const ruw = env("GOOGLE_WALLET_SERVICE_ACCOUNT")
  if (!issuer || !ruw) return null
  const sa = JSON.parse(ruw) as { client_email: string; private_key: string }

  const classId = `${issuer}.gronn-visitekaartje`
  const object = {
    id: `${issuer}.gronn-visitekaartje-nick-peters`,
    classId,
    state: "ACTIVE",
    cardTitle: tekst(BUSINESS.name),
    header: tekst(NAAM),
    subheader: tekst(WAT),
    hexBackgroundColor: "#202020",
    logo: { sourceUri: { uri: `${SITE}/wallet/google-logo.png` }, contentDescription: tekst(BUSINESS.name) },
    heroImage: { sourceUri: { uri: `${SITE}/wallet/google-kop.png` }, contentDescription: tekst(BUSINESS.name) },
    barcode: { type: "QR_CODE", value: QR, alternateText: "gronn.studio" },
    textModulesData: [
      { id: "tel", header: "Telefoon", body: BUSINESS.phone },
      { id: "mail", header: "E-mail", body: BUSINESS.email },
      { id: "waar", header: "Werkgebied", body: WAAR },
    ],
    linksModuleData: {
      uris: [
        { id: "bellen", uri: BUSINESS.phoneHref, description: "Bellen" },
        { id: "whatsapp", uri: BUSINESS.whatsapp, description: "WhatsApp" },
        { id: "mailen", uri: BUSINESS.emailHref, description: "Mailen" },
        { id: "site", uri: SITE, description: "Website" },
      ],
    },
  }
  const claims = {
    iss: sa.client_email,
    aud: "google",
    typ: "savetowallet",
    origins: [SITE],
    payload: { genericClasses: [{ id: classId }], genericObjects: [object] },
  }
  const ongetekend = `${b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${b64url(JSON.stringify(claims))}`
  const handtekening = createSign("RSA-SHA256").update(ongetekend).sign(sa.private_key.replace(/\\n/g, "\n"))
  return `https://pay.google.com/gp/v/save/${ongetekend}.${b64url(handtekening)}`
}
