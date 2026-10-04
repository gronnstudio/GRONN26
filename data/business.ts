// De enige bron voor bedrijfsgegevens. Footer, juridische pagina's,
// contact en JSON-LD lezen hier; nergens anders een adres of nummer
// hardcoden. Overgenomen uit gronn-studio (src/lib/business.ts).
export const BUSINESS = {
  name: "GRØNN Studio",
  owner: { given: "Nick", family: "Peters" },
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
  kvk: "42072154",
  btw: "NL005473265B04",
  legalForm: "eenmanszaak",
  instagram: "https://instagram.com/gronn.studio",
  whatsapp: "https://wa.me/31618118014",
  url: "https://gronn.studio",
} as const
