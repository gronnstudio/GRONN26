import type { L } from "@/lib/i18n"

// Letterlijke kopie van src/lib/invulvelden.ts uit de oude site (gronn-studio).

// De controle van de invulvelden op de publieke site (eigenaar, 28 sep
// 2026: "voor invulvelden geef een licht gedrukt voorbeeld op en verbeter
// als het veld niet juist word ingevuld").
//
// Eén plek voor drie dingen per soort veld:
//   · het VOORBEELD dat licht gedrukt in het lege veld staat — altijd een
//     verzonnen voorbeeld, nooit het label, nooit een echt adres;
//   · de CONTROLE, met een foutregel die zegt wat er wél verwacht wordt;
//   · kleine fouten die veilig recht te zetten zijn (spaties rond een
//     e-mailadres, "6171ab" → "6171 AB"), met een regel die zegt dát het
//     is gebeurd. Een postcode van alleen vier cijfers is goed.
//
// Puur: geen React, geen DOM. Het formulier roept `controleer` aan bij
// blur, bij versturen en — na een eerste fout — bij elke invoer.

export type Uitslag = {
  /** De waarde na het rechtzetten; gelijk aan de invoer als er niets te doen was. */
  waarde: string
  /** Wat er mis is en wat er wél verwacht wordt. Afwezig = in orde. */
  fout?: L
  /** Wat er is rechtgezet, zodat de bezoeker niet schrikt van een veranderd veld. */
  opmerking?: L
}

export type Regel = {
  voorbeeld: L
  controleer: (ruw: string) => Uitslag
}

/* ---------- voorbeelden: verzonnen, in beide talen ---------- */

export const VOORBEELD = {
  naam: { nl: "bijv. Anna de Vries", en: "e.g. Anna de Vries" },
  email: { nl: "bijv. naam@voorbeeld.nl", en: "e.g. name@example.com" },
  telefoon: { nl: "bijv. 06 12 34 56 78", en: "e.g. +31 6 12 34 56 78" },
  plaats: { nl: "bijv. Stein of 6171 AB", en: "e.g. Stein or 6171 AB" },
  bericht: {
    nl: "bijv. Een vijver van zo’n 3 × 4 meter die elke zomer groen wordt…",
    en: "e.g. A pond of about 3 × 4 metres that turns green every summer…",
  },
} satisfies Record<string, L>

/* ---------- e-mail ---------- */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function controleerEmail(ruw: string, verplicht = true): Uitslag {
  const waarde = ruw.trim()
  const opmerking: L | undefined =
    waarde !== ruw && waarde
      ? { nl: "De spaties rond het adres zijn weggehaald.", en: "The spaces around the address were removed." }
      : undefined
  if (!waarde) {
    return verplicht
      ? { waarde, fout: { nl: "Vul je e-mailadres in, zoals naam@voorbeeld.nl.", en: "Enter your e-mail address, like name@example.com." } }
      : { waarde }
  }
  if (EMAIL.test(waarde)) return { waarde, opmerking }
  let fout: L
  if (/\s/.test(waarde)) {
    fout = { nl: "Er staat een spatie in het adres. Een e-mailadres heeft er geen, zoals naam@voorbeeld.nl.", en: "There is a space in the address. An e-mail address has none, like name@example.com." }
  } else if (!waarde.includes("@")) {
    fout = { nl: "Er mist een @. Een e-mailadres ziet eruit als naam@voorbeeld.nl.", en: "The @ is missing. An e-mail address looks like name@example.com." }
  } else if ((waarde.match(/@/g) ?? []).length > 1) {
    fout = { nl: "Er staat meer dan één @ in. Een e-mailadres ziet eruit als naam@voorbeeld.nl.", en: "There is more than one @. An e-mail address looks like name@example.com." }
  } else if (waarde.startsWith("@")) {
    fout = { nl: "Vóór de @ mist je naam, zoals naam@voorbeeld.nl.", en: "Your name is missing before the @, like name@example.com." }
  } else {
    fout = { nl: "Na de @ mist nog iets, zoals voorbeeld.nl in naam@voorbeeld.nl.", en: "Something is missing after the @, like example.com in name@example.com." }
  }
  return { waarde, fout, opmerking }
}

/* ---------- naam, bericht: alleen verplicht ---------- */

export function controleerVerplicht(fout: L) {
  return (ruw: string): Uitslag => (ruw.trim() ? { waarde: ruw } : { waarde: ruw, fout })
}

/* ---------- telefoon (optioneel) ---------- */

export function controleerTelefoon(ruw: string): Uitslag {
  const waarde = ruw.trim()
  if (!waarde) return { waarde }
  const kaal = waarde.replace(/[\s()./-]/g, "")
  if (!/^\+?\d+$/.test(kaal)) {
    return { waarde, fout: { nl: "Gebruik alleen cijfers, zoals 06 12 34 56 78.", en: "Use digits only, like +31 6 12 34 56 78." } }
  }
  const kort = (uitleg: L): Uitslag => ({ waarde, fout: uitleg })
  if (/^(\+|00)31/.test(kaal)) {
    // +31 is Nederland: daarna nog 9 cijfers (een "(0)" ertussen mag).
    const rest = kaal.replace(/^(\+|00)31/, "").replace(/^0/, "")
    if (rest.length < 9) return kort({ nl: "Dit telefoonnummer is te kort: na +31 komen 9 cijfers, zoals +31 6 12 34 56 78.", en: "This phone number is too short: +31 is followed by 9 digits, like +31 6 12 34 56 78." })
    if (rest.length > 9) return kort({ nl: "Dit telefoonnummer is te lang: na +31 komen 9 cijfers, zoals +31 6 12 34 56 78.", en: "This phone number is too long: +31 is followed by 9 digits, like +31 6 12 34 56 78." })
    return { waarde }
  }
  if (/^(\+|00)/.test(kaal)) {
    // Een ander landnummer: E.164 staat 8 tot 15 cijfers toe.
    const n = kaal.replace(/^(\+|00)/, "").length
    if (n < 8) return kort({ nl: "Dit telefoonnummer is te kort. Met landnummer ziet het eruit als +31 6 12 34 56 78.", en: "This phone number is too short. With a country code it looks like +31 6 12 34 56 78." })
    if (n > 15) return kort({ nl: "Dit telefoonnummer is te lang. Met landnummer ziet het eruit als +31 6 12 34 56 78.", en: "This phone number is too long. With a country code it looks like +31 6 12 34 56 78." })
    return { waarde }
  }
  // Zonder landnummer: een Nederlands nummer, 10 cijfers met een 0 vooraan.
  if (!kaal.startsWith("0")) return kort({ nl: "Een Nederlands nummer begint met 0, zoals 06 12 34 56 78. Uit het buitenland? Begin met je landnummer.", en: "A Dutch number starts with 0, like 06 12 34 56 78. Abroad? Start with your country code." })
  if (kaal.length < 10) return kort({ nl: "Dit telefoonnummer is te kort: 10 cijfers, zoals 06 12 34 56 78.", en: "This phone number is too short: 10 digits, like 06 12 34 56 78." })
  if (kaal.length > 10) return kort({ nl: "Dit telefoonnummer is te lang: 10 cijfers, zoals 06 12 34 56 78.", en: "This phone number is too long: 10 digits, like 06 12 34 56 78." })
  return { waarde }
}

/* ---------- plaats of postcode (optioneel) ---------- */

// Vier cijfers (niet met 0 beginnend) en twee letters, met of zonder
// spatie, eventueel gevolgd door de plaats: "6171ab stein" → "6171 AB stein".
const POSTCODE = /^([1-9]\d{3})\s*([a-z]{2})(?![a-z])(.*)$/i

// Alleen de vier cijfers is ook goed (eigenaar, 29 sep 2026: "alle punten
// zijn prima!"): die wijzen de buurt al aan, het scheelt de bezoeker een
// stap, en wat niet gevraagd hoeft te worden, vragen we niet. Eventueel
// gevolgd door een plaats ("6171 Stein"), maar niet door één losse letter
// of een cijfer: "6171 a" en "61712" zijn eerder half getypt, en krijgen
// de foutregel zoals voorheen.
const VIER_CIJFERS = /^[1-9]\d{3}(?: [^\d\s].{2,})?$/

export function controleerPlaats(ruw: string): Uitslag {
  const waarde = ruw.trim().replace(/\s+/g, " ")
  if (!waarde) return { waarde }
  const pc = waarde.match(POSTCODE)
  if (pc) {
    const netjes = `${pc[1]} ${pc[2].toUpperCase()}${pc[3]}`
    return netjes === waarde
      ? { waarde }
      : { waarde: netjes, opmerking: { nl: `Genoteerd als ${pc[1]} ${pc[2].toUpperCase()}.`, en: `Written as ${pc[1]} ${pc[2].toUpperCase()}.` } }
  }
  if (VIER_CIJFERS.test(waarde)) return { waarde }
  // Begint het met cijfers maar is het geen postcode, dan zeggen wat er
  // verwacht wordt. Een plaatsnaam (zonder cijfers vooraan) is altijd goed.
  if (/^\d/.test(waarde)) {
    return {
      waarde,
      fout: {
        nl: "Een postcode is 4 cijfers, eventueel met 2 letters: 6171 of 6171 AB. Of vul je plaats in.",
        en: "A Dutch postcode is 4 digits, optionally with 2 letters: 6171 or 6171 AB. Or enter your town.",
      },
    }
  }
  return { waarde }
}

/* ---------- de velden van het contactformulier ---------- */

export const CONTACT_REGELS: Record<"naam" | "email" | "telefoon" | "plaats" | "bericht", Regel> = {
  naam: {
    voorbeeld: VOORBEELD.naam,
    controleer: controleerVerplicht({ nl: "Vul je naam in, zoals Anna de Vries.", en: "Enter your name, like Anna de Vries." }),
  },
  email: { voorbeeld: VOORBEELD.email, controleer: (w) => controleerEmail(w, true) },
  telefoon: { voorbeeld: VOORBEELD.telefoon, controleer: controleerTelefoon },
  plaats: { voorbeeld: VOORBEELD.plaats, controleer: controleerPlaats },
  bericht: {
    voorbeeld: VOORBEELD.bericht,
    controleer: controleerVerplicht({
      nl: "Vertel in een paar woorden waar het over gaat, bijvoorbeeld hoe groot de tuin of vijver is.",
      en: "Tell me in a few words what it is about, for example how big the garden or pond is.",
    }),
  },
}
