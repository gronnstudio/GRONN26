// Inloggen als eigenaar met Google (eigenaar, 6 okt 2026: "gebruik gewoon mijn
// google SSO"). Zelfde model als de oude site: één toegestaan adres
// (EDITOR_ALLOWED_EMAIL), geen database. Na het inloggen staat er een
// ondertekend koekje (HMAC met AUTH_SECRET) met het adres en een vervaldatum.
// Alleen Web Crypto, zodat het zowel in de proxy als in een route draait.
export const KOEKJE = "gronn-eigenaar"
export const DUUR = 60 * 60 * 24 * 30 // 30 dagen

export const toegestaan = () => (process.env.EDITOR_ALLOWED_EMAIL ?? "hello@gronn.studio").toLowerCase()

const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

async function handtekening(tekst: string) {
  const geheim = process.env.AUTH_SECRET
  if (!geheim) throw new Error("AUTH_SECRET ontbreekt")
  const sleutel = await crypto.subtle.importKey("raw", new TextEncoder().encode(geheim), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  return b64(await crypto.subtle.sign("HMAC", sleutel, new TextEncoder().encode(tekst)))
}

export async function maakKoekje(email: string) {
  const inhoud = `${email.toLowerCase()}.${Math.floor(Date.now() / 1000) + DUUR}`
  return `${inhoud}.${await handtekening(inhoud)}`
}

/** Is dit koekje van de eigenaar, ondertekend en niet verlopen? */
export async function isEigenaar(koekje: string | undefined) {
  if (!koekje || !process.env.AUTH_SECRET) return false
  // Het adres zelf bevat punten: neem de laatste twee delen als vervaldatum en handtekening.
  const delen = koekje.split(".")
  const sig = delen.pop()
  const verloopt = delen.pop()
  const email = delen.join(".")
  if (!email || !verloopt || !sig) return false
  if (Number(verloopt) < Date.now() / 1000) return false
  if (email !== toegestaan()) return false
  return sig === (await handtekening(`${email}.${verloopt}`))
}
