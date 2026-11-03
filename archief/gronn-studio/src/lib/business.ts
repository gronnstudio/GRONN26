// Single source of truth for legal/business identity (Dutch website
// requirements: name, physical address, KVK, contact). Referenced by the
// footer, menu, contact page and legal pages.
export const BUSINESS = {
  name: "GRØNN Studio",
  /** De eigenaar, voor het visitekaartje en de vCard (eigenaar, 25 sep 2026). */
  owner: { given: "Nick", family: "Peters" },
  tagline: "Designing Living Ecosystems",
  address: {
    street: "Kelderstraat 32",
    postalCode: "6171 GB",
    city: "Stein",
    province: "Limburg",
    country: "Nederland",
  },
  phone: "+316 181 180 14",
  phoneHref: "tel:+31618118014",
  email: "hello@gronn.studio",
  emailHref: "mailto:hello@gronn.studio",
  // NOTE: the IBAN deliberately does NOT live here. It is in
  // src/lib/business-private.ts, server-side only — this module is
  // imported by client components on every page. See that file.
  kvk: "42072154",
  btw: "NL005473265B04",
  /** Zzp'er: bij de KVK ingeschreven als eenmanszaak (eigenaar, 24 sep 2026). */
  legalForm: "eenmanszaak",
  instagram: "https://instagram.com/gronn.studio",
  whatsapp: "https://wa.me/31618118014",
} as const
