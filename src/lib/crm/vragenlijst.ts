import { deel, leesMilli } from "./geld"

// De vragenlijst van de intake (ADR 0008, docs/architecture/intake.md): één
// lijst in plaats van de oude vragen (intake.ts) en de afvinklijst
// (checklist.ts). Dit is de startinhoud; Nick past hem aan op
// /dashboard/vragenlijst en dan staat hij in Blob (src/lib/beheer/vragenlijst.ts).
// Puur en veilig voor de browser.
//
// Regels die de geschiedenis heel houden:
// - Een id verandert nooit. De ids van de oude vragen en vinkjes zijn
//   overgenomen, zodat bestaande opnames gewoon blijven kloppen.
// - Een vraag wordt nooit echt verwijderd, alleen `vervallen`.
// - Een antwoord bewaart de vraagtekst van dat moment (Tuin.vragen).

export const VRAAG_SOORTEN = ["jnov", "keuze", "getal", "tekst", "lang", "datum"] as const
export type VraagSoort = (typeof VRAAG_SOORTEN)[number]
export const SOORT_NAAM: Record<VraagSoort, string> = {
  jnov: "Ja / Nee / Onbekend / N.v.t.",
  keuze: "Keuzelijst",
  getal: "Getal",
  tekst: "Korte tekst",
  lang: "Lange tekst",
  datum: "Datum",
}
export const JNOV = ["Ja", "Nee", "Onbekend", "N.v.t."] as const

export type Vraag = {
  id: string
  tekst: string
  soort: VraagSoort
  opties?: string[]
  eenheid?: string
  hulp?: string
  /** Alleen tonen als een van deze werkzaamheden gekozen is (slimme vervolgvraag). */
  toonBij?: string[]
  /** Hoort bij de snelle intake (telefoon, formulier, kennismaking). */
  snel?: boolean
  vervallen?: boolean
}
export type Categorie = { id: string; naam: string; toonBij?: string[]; vragen: Vraag[] }
export type Vragenlijst = { versie: number; bijgewerkt: string; diensten: string[]; categorieen: Categorie[] }

export const INTAKE_SOORTEN = ["snel", "uitgebreid", "vervolg"] as const
export type IntakeSoort = (typeof INTAKE_SOORTEN)[number]
export const INTAKE_NAAM: Record<IntakeSoort, { naam: string; uitleg: string }> = {
  snel: { naam: "Snelle intake", uitleg: "Telefoon, formulier of kennismaking: de wens, het kader en de werkzaamheden." },
  uitgebreid: { naam: "Uitgebreide intake", uitleg: "Het locatiebezoek: alles voor de gekozen werkzaamheden." },
  vervolg: { naam: "Vervolginspectie", uitleg: "Alleen wat nog open, onbekend of gemarkeerd is." },
}

export const ZONE_SOORTEN = ["Terras", "Pad", "Oprit", "Gazon", "Border", "Vijver", "Haag of hekwerk", "Overig"] as const
export type Zone = { id: string; naam: string; soort: (typeof ZONE_SOORTEN)[number]; lengte: string; breedte: string; oppervlak: string; diepte: string; notitie: string }

// Korte schrijfwijze voor de startinhoud.
type Extra = Partial<Omit<Vraag, "id" | "tekst" | "soort">>
const j = (id: string, tekst: string, x: Extra = {}): Vraag => ({ id, tekst, soort: "jnov", ...x })
const k = (id: string, tekst: string, opties: string[], x: Extra = {}): Vraag => ({ id, tekst, soort: "keuze", opties, ...x })
const g = (id: string, tekst: string, eenheid: string, x: Extra = {}): Vraag => ({ id, tekst, soort: "getal", eenheid, ...x })
const t = (id: string, tekst: string, x: Extra = {}): Vraag => ({ id, tekst, soort: "tekst", ...x })
const l = (id: string, tekst: string, x: Extra = {}): Vraag => ({ id, tekst, soort: "lang", ...x })
const d = (id: string, tekst: string, x: Extra = {}): Vraag => ({ id, tekst, soort: "datum", ...x })

const GRONDWERK = ["Complete aanleg", "Bestrating", "Gazon", "Grondverbetering", "Drainage", "Vijver of waterelement"]
const BESTRATING = ["Bestrating", "Complete aanleg"]
const GROEN = ["Tuinontwerp", "Complete aanleg", "Beplanting", "Gazon"]
const VIJVER = ["Vijver of waterelement"]
const BOUW = ["Complete aanleg", "Erfafscheiding", "Pergola of overkapping"]
const TECHNIEK = ["Tuinverlichting", "Beregening", "Drainage", "Vijver of waterelement"]

export const STANDAARD: Vragenlijst = {
  versie: 1,
  bijgewerkt: "2026-10-29",
  diensten: [
    "Tuinontwerp",
    "Complete aanleg",
    "Bestrating",
    "Beplanting",
    "Gazon",
    "Grondverbetering",
    "Drainage",
    "Beregening",
    "Tuinverlichting",
    "Erfafscheiding",
    "Pergola of overkapping",
    "Vijver of waterelement",
    "Onderhoud",
    "Anders",
  ],
  categorieen: [
    {
      id: "meenemen",
      naam: "Meenemen",
      vragen: [
        j("meetwiel-of-rolmaat-30-m-duimstok-waterp", "Meetwiel of rolmaat (30 m), duimstok, waterpas"),
        j("telefoon-met-volle-batterij-voor-foto-s", "Telefoon met volle batterij voor foto's en video"),
        j("magazines-en-stalen-bestrating-kiezel-bl", "Magazines en stalen (bestrating, kiezel, blokken)"),
        j("het-ontwerp-of-de-schets-als-die-er-al-i", "Het ontwerp of de schets, als die er al is"),
      ],
    },
    {
      id: "klant",
      naam: "A · Klant en project",
      vragen: [
        k("woning", "Soort woning", ["Rijtjeshuis", "Hoekwoning", "Twee-onder-een-kap", "Vrijstaand", "Appartement", "Bedrijfspand", "Anders"], { snel: true }),
        k("situatie", "Nieuwbouw of bestaand", ["Nieuwbouw", "Bestaande tuin omvormen", "Onderhoud"], { snel: true }),
        l("doelen", "Wat moet de tuin worden?", { hulp: "In de woorden van de klant", snel: true }),
        t("stijl", "Gewenste uitstraling en stijl", { hulp: "Laat 2 of 3 voorbeelden aanwijzen" }),
        k("budget", "Budget", ["Onder € 2.500", "€ 2.500–5.000", "€ 5.000–10.000", "€ 10.000–20.000", "Boven € 20.000", "Nog geen idee"], { snel: true }),
        t("start", "Gewenste start", { hulp: "bijv. maart 2027", snel: true }),
        t("klaar", "Wanneer moet het af zijn? Data waarop het niet kan?"),
        k("flexibel", "Flexibiliteit in planning", ["Vaste datum", "Paar weken speling", "Maakt niet uit"]),
        j("wie-beslist-er-is-iedereen-erbij-die-mee", "Is iedereen erbij die mee beslist?", { snel: true }),
        t("gebruik", "Hoe gebruiken ze de tuin?", { hulp: "Kinderen, hond, zitten, eten, moestuin" }),
        l("blijven", "Wat moet blijven staan?", { hulp: "Bomen, terras, schuur, planten" }),
        k("onderhoud", "Gewenst onderhoudsniveau", ["Zo weinig mogelijk", "Af en toe", "Tuinieren is hobby", "Wij doen het onderhoud"]),
        j("zelf", "Doet de klant zelf een deel van het werk?"),
        j("anderen", "Zijn er andere aannemers bij betrokken?"),
        t("duurzaam", "Duurzaamheidswensen", { hulp: "Regenwater, inheems, hergebruik, minder verharding" }),
        l("bijzonderheden", "Bijzonderheden en afspraken"),
      ],
    },
    {
      id: "logistiek",
      naam: "B · Bereikbaarheid en logistiek",
      vragen: [
        k("toegang", "Toegang", ["Minigraver past (≥ 1 m)", "Alleen kruiwagen", "Door het huis", "Via buren of achterpad"]),
        g("toegangBreedte", "Smalste doorgang, breedte", "m"),
        g("toegangHoogte", "Smalste doorgang, hoogte", "m"),
        j("minigraver", "Kan er een minigraver naar de werkplek?"),
        j("minidumper", "Kan er een minidumper naar de werkplek?"),
        g("losafstand", "Afstand losplaats tot werkplek", "m"),
        t("parkeren", "Parkeren en laden voor de bus"),
        k("afvoer", "Grond en puin afvoeren", ["Container op straat", "Container op oprit", "Kan blijven liggen", "Niet nodig"]),
        j("waar-kan-een-container-staan-is-er-een-v", "Vergunning nodig voor een container op de stoep?"),
        j("waar-kan-materiaal-worden-gelost-en-opge", "Is er plek om materiaal te lossen en op te slaan?"),
        j("bescherming", "Moet bestaande bestrating beschermd worden (rijplaten)?"),
        l("obstakels", "Obstakels en hoogteverschillen onderweg", { hulp: "Trap, drempel, smalle bocht, overhangende takken" }),
      ],
    },
    {
      id: "bestaand",
      naam: "C · Bestaande situatie",
      vragen: [
        g("lengte", "Lengte tuin", "m"),
        g("breedte", "Breedte tuin", "m"),
        g("oppervlak", "Oppervlak totaal", "m²"),
        g("verhard", "Bestaande bestrating", "m²"),
        g("gazon", "Bestaand gazon", "m²"),
        g("beplant", "Bestaande beplanting", "m²"),
        g("hoogteverschil", "Hoogteverschil in de tuin", "m"),
        j("hoogteverschil-in-de-tuin-en-de-afstand", "Afstand tot de dorpel van het huis gemeten?"),
        l("metingen", "Overige maten", { hulp: "Muren, deuren, putten, bomen, afstanden" }),
        j("maak-een-schets-met-de-maten-erop-en-een", "Schets met maten en een foto van elke hoek gemaakt?"),
        k("ligging", "Ligging tuin", ["Noord", "Noordoost", "Oost", "Zuidoost", "Zuid", "Zuidwest", "West", "Noordwest"]),
        k("zon", "Zon", ["Volle zon", "Halfschaduw", "Schaduw", "Wisselend"]),
        k("grond", "Grondsoort", ["Zand", "Leem / löss", "Klei", "Veen", "Puin of ophoging", "Onbekend"], { hulp: "Steek een schop in de grond" }),
        j("verdicht", "Is de grond verdicht?"),
        k("afwatering", "Afwatering", ["Goed", "Plassen na regen", "Staat lang nat", "Onbekend"]),
        j("grondwater", "Hoog grondwater of wateroverlast?"),
        t("regenpijpen", "Waar zitten de regenpijpen en de put?"),
        k("water", "Water in de tuin", ["Buitenkraan", "Geen kraan", "Regenton", "Vijver aanwezig"]),
        k("leidingen", "Kabels en leidingen", ["KLIC-melding nodig", "Bekend, ingetekend", "Geen graafwerk"]),
        l("bomen", "Bomen en wortelzones", { hulp: "Ook bomen van de buren die in de weg zitten" }),
        l("constructies", "Bestaande constructies", { hulp: "Schuur, muren, vlonder, oude vijver" }),
        l("verwijderen", "Wat moet weg?", { hulp: "Bestrating, beplanting, puin, oude fundering" }),
        l("hergebruik", "Wat kan opnieuw gebruikt worden?"),
        j("aansluiting", "Sluit het nieuwe werk aan op bestaande hoogtes?"),
        l("plekNotities", "Wat viel op"),
      ],
    },
    {
      id: "grondwerk",
      naam: "D · Grondwerk",
      toonBij: GRONDWERK,
      vragen: [
        g("ontgraven", "Oppervlak ontgraven", "m²"),
        g("ontgraafDiepte", "Ontgravingsdiepte", "cm"),
        g("grondAf", "Grond afvoeren", "m³"),
        g("grondAan", "Grond aanvoeren", "m³"),
        t("eindhoogte", "Gewenste eindhoogte", { hulp: "Ten opzichte van de dorpel of een vast punt" }),
        k("verdichten", "Verdichten met", ["Trilplaat", "Wals", "Stamper", "Handmatig", "Niet nodig"]),
        t("machines", "Machines voor het grondwerk"),
        j("kabels-en-leidingen-klic-melding-doen-vo", "KLIC-melding gedaan vóór het graafwerk?"),
        j("oude-funderingen-beton-puin-wortels-of-e", "Oude fundering, beton, puin of een oude vijver in de grond?"),
        j("verontreiniging", "Aanwijzingen voor bodemverontreiniging?", { hulp: "Asbest, olie, onbekend puin" }),
      ],
    },
    {
      id: "bestrating",
      naam: "E · Bestrating",
      toonBij: BESTRATING,
      vragen: [
        g("bestratingM2", "Oppervlak nieuwe bestrating", "m²"),
        k("bestratingType", "Soort", ["Betonklinker", "Gebakken klinker", "Betontegel", "Keramische tegel", "Natuursteen", "Grind of split", "Anders"]),
        t("bestratingMaat", "Afmeting van de steen", { hulp: "bijv. 21 × 10,5 × 8 cm" }),
        j("bestrating-soort-kleur-legverband-en-een", "Kleur gekozen, en een tweede keus als het niet leverbaar is?"),
        k("legverband", "Legverband", ["Halfsteens", "Keperverband", "Elleboogverband", "Wildverband", "Tegelverband", "Anders"]),
        g("voeg", "Voegbreedte", "mm"),
        g("snijverlies", "Snijverlies", "%"),
        g("opsluiting", "Opsluitbanden", "m"),
        k("funderingType", "Fundering", ["Menggranulaat", "Gebroken puin", "Split", "Zand", "Anders"]),
        g("funderingDikte", "Funderingsdikte", "cm"),
        g("zandbed", "Zandbed", "cm"),
        g("afschot", "Afschot", "%", { hulp: "1 tot 2 % van het huis af" }),
        k("regenwater", "Regenwater naar", ["Kolk of put", "Lijngoot", "Infiltratie", "De border in", "Onbekend"]),
        k("belasting", "Belasting", ["Lopen", "Auto", "Zwaar verkeer"]),
        l("trappen", "Trappen en niveauverschillen"),
        j("dorpel", "Aansluiting op deuren en dorpels gecontroleerd?"),
        k("afwerking", "Voegen", ["Ingeveegd zand", "Voegmortel", "Polymeer", "Anders"]),
        j("kiezel-blokken-randen-soort-en-kleur", "Kiezel, blokken en randen: soort en kleur gekozen?"),
      ],
    },
    {
      id: "beplanting",
      naam: "F · Beplanting en tuinontwerp",
      toonBij: GROEN,
      vragen: [
        l("zonSchaduw", "Zon- en schaduwplekken", { hulp: "Per deel van de tuin, ook in de winter" }),
        k("vocht", "Vochtigheid", ["Droog", "Normaal", "Vochtig", "Nat"]),
        l("planten", "Gewenste planten, kleuren en bloeitijd"),
        l("nietWillen", "Wat willen ze absoluut niet?"),
        j("wintergroen", "Wintergroen gewenst?"),
        j("inheems", "Inheemse beplanting gewenst?"),
        j("biodiversiteit", "Biodiversiteit belangrijk (vogels, bijen, egels)?"),
        j("privacy", "Is privacy een wens?"),
        l("groeiruimte", "Groeiruimte en plantafstanden", { hulp: "Ruimte voor bomen en struiken op volle grootte" }),
        j("bodemverbetering", "Bodemverbetering nodig?"),
        j("mulch", "Afwerken met mulch of houtsnippers?"),
        j("beregening", "Beregening gewenst?"),
      ],
    },
    {
      id: "vijver",
      naam: "G · Vijvers en waterelementen",
      toonBij: VIJVER,
      vragen: [
        k("vijverType", "Soort", ["Siervijver", "Natuurvijver", "Koivijver", "Zwemvijver", "Waterelement", "Renovatie bestaande vijver"]),
        g("vijverLengte", "Lengte", "m"),
        g("vijverBreedte", "Breedte", "m"),
        g("vijverDiepte", "Diepste punt", "m"),
        g("vijverVolume", "Watervolume (schatting)", "m³", { hulp: "Lengte × breedte × diepte × 0,6" }),
        k("folie", "Folie of bak", ["EPDM", "PVC", "Vijverbak", "Beton", "Anders"]),
        t("pomp", "Pomp", { hulp: "Merk, type, vermogen" }),
        t("filter", "Filter", { hulp: "Soort, voor hoeveel m³" }),
        g("leiding", "Leidingdiameter", "mm"),
        g("debiet", "Debiet", "l/u"),
        g("vijverHoogte", "Hoogteverschil waterval of beekloop", "m"),
        j("waterval", "Waterval of beekloop?"),
        j("overloop", "Overloop aanwezig of nodig?"),
        j("skimmer", "Skimmer?"),
        j("vijverplanten", "Vijverbeplanting?"),
        j("vissen", "Vissen in de vijver?", { hulp: "Tijdens het werk opvangen" }),
        j("vijverStroom", "Stroom met aardlekschakelaar bij de vijver?"),
        j("vijverOnderhoud", "Filter en pomp goed bereikbaar voor onderhoud?"),
        j("winter", "Wintervoorzieningen nodig (ijsvrijhouder, pomp eruit)?"),
      ],
    },
    {
      id: "constructies",
      naam: "H · Constructies en erfafscheiding",
      toonBij: BOUW,
      vragen: [
        j("schutting", "Schutting of hekwerk?"),
        j("hekwerk-soort-hoogte-kleur-poort-ja-of-n", "Hekwerk: soort, hoogte en kleur gekozen?"),
        j("poort", "Poort?"),
        j("pergola", "Pergola of overkapping?"),
        j("keermuur", "Keermuur?"),
        g("keerhoogte", "Keerhoogte", "m", { hulp: "Boven 1 m is een berekening nodig" }),
        g("hekwerkM", "Hekwerk of schutting, lengte", "m"),
        g("hekwerkHoogte", "Hekwerk of schutting, hoogte", "m"),
        t("bouwFundering", "Fundering", { hulp: "Poeren, betonvoet, schroeffundering" }),
        l("bouwMateriaal", "Materiaal en afmetingen"),
        l("constructief", "Constructieve aandachtspunten"),
        j("erfgrens-duidelijk-weten-de-buren-ervan", "Erfgrens duidelijk en weten de buren ervan?"),
        j("is-er-een-vergunning-nodig-hoge-schuttin", "Vergunning nodig (hoge schutting, overkapping, bomen kappen)?"),
      ],
    },
    {
      id: "techniek",
      naam: "I · Technische installaties",
      toonBij: TECHNIEK,
      vragen: [
        j("verlichting", "Tuinverlichting?"),
        t("kabeltrace", "Kabeltracé", { hulp: "Waar de kabels komen, diepte" }),
        j("is-er-een-buitenkraan-en-stroom", "Buitenkraan en stroom in de buurt?"),
        j("buitenstopcontact", "Buitenstopcontact met aardlek?"),
        j("beregeningInstallatie", "Beregeningsinstallatie?"),
        j("drainage", "Drainage nodig?"),
        j("besturing", "Automatische besturing (tijdklok, app)?"),
        l("elektra", "Bestaande elektra en veiligheid"),
        j("techniekOnderhoud", "Installaties bereikbaar voor onderhoud?"),
      ],
    },
    {
      id: "financieel",
      naam: "J · Financieel en uitvoering",
      vragen: [
        j("wat-zit-er-wel-en-niet-in-de-prijs-benoe", "Besproken wat wel en niet in de prijs zit?"),
        l("stelposten", "Stelposten", { hulp: "Wat nog niet vast te prijzen is" }),
        k("betaling", "Betaling", ["Aanbetaling", "Reservering", "Termijnen", "Na oplevering"]),
        l("meerwerk", "Afspraken over meerwerk"),
        t("inkoop", "Inkoop via", { hulp: "Leverancier, of de klant koopt zelf" }),
        j("onderaannemers", "Onderaannemers nodig?"),
        l("leverbaar", "Beschikbaarheid materialen", { hulp: "Wat is moeilijk leverbaar, en het alternatief" }),
        l("fasering", "Fasering", { hulp: "In delen uitvoeren?" }),
        d("startdatum", "Gewenste startdatum"),
        t("opruimen", "Wie ruimt wat op voor de start?", { hulp: "Spullen, planten, meubels" }),
        t("waterGeven", "Wie geeft water na de oplevering?"),
        d("offerteDatum", "Offerte sturen op"),
        l("eisen", "Eisen van de klant"),
        l("risicos", "Risico's", { hulp: "Wortels, oude fundering, hoogteverschil, buren" }),
        l("aannames", "Aannames voor de prijs", { hulp: "Komen als uitgangspunten op de offerte" }),
      ],
    },
  ],
}

export const alleVragen = (lijst: Vragenlijst) => lijst.categorieen.flatMap((c) => c.vragen)
export const vraagMap = (lijst: Vragenlijst) => new Map(alleVragen(lijst).map((v) => [v.id, v]))

/** Hoort deze vraag bij de gekozen werkzaamheden? Categorie én vraag tellen. */
export function getoond(c: Categorie, v: Vraag, diensten: string[]) {
  if (v.vervallen) return false
  const past = (bij?: string[]) => !bij?.length || bij.some((x) => diensten.includes(x))
  return past(c.toonBij) && past(v.toonBij)
}

export type IntakeStand = { antwoorden: Record<string, string>; notities: Record<string, string>; aandacht: string[]; diensten: string[] }

/** Leeg of "Onbekend": moet nog uitgezocht worden. */
export const isOpenAntwoord = (w: string | undefined) => !w || w === "Onbekend"

/** De vragen die je bij deze soort intake ziet. */
export function vragenVoor(lijst: Vragenlijst, s: IntakeStand, soort: IntakeSoort) {
  return lijst.categorieen
    .map((c) => ({
      ...c,
      vragen: c.vragen.filter((v) => {
        if (!getoond(c, v, s.diensten)) return false
        if (soort === "snel") return Boolean(v.snel)
        if (soort === "vervolg") return isOpenAntwoord(s.antwoorden[v.id]) || s.aandacht.includes(v.id)
        return true
      }),
    }))
    .filter((c) => c.vragen.length)
}

/** Wat nog open staat: gemarkeerd eerst, dan onbekend, dan leeg. */
export function openPunten(lijst: Vragenlijst, s: IntakeStand) {
  const punten: { categorie: Categorie; vraag: Vraag; reden: "aandacht" | "onbekend" | "leeg" }[] = []
  for (const c of lijst.categorieen)
    for (const v of c.vragen) {
      if (!getoond(c, v, s.diensten)) continue
      const w = s.antwoorden[v.id]
      if (s.aandacht.includes(v.id)) punten.push({ categorie: c, vraag: v, reden: "aandacht" })
      else if (w === "Onbekend") punten.push({ categorie: c, vraag: v, reden: "onbekend" })
      else if (!w) punten.push({ categorie: c, vraag: v, reden: "leeg" })
    }
  const volgorde = { aandacht: 0, onbekend: 1, leeg: 2 }
  return punten.sort((a, b) => volgorde[a.reden] - volgorde[b.reden])
}

/** Telling over de vragen die voor deze tuin gelden (geen percentage dat meer belooft dan het is). */
export function telling(lijst: Vragenlijst, s: Pick<IntakeStand, "antwoorden" | "diensten">) {
  let gevuld = 0
  let van = 0
  for (const c of lijst.categorieen)
    for (const v of c.vragen) {
      if (!getoond(c, v, s.diensten)) continue
      van++
      if (s.antwoorden[v.id]) gevuld++
    }
  return { gevuld, van }
}

/** Is dit een geldig antwoord op deze vraag? Leeg betekent: antwoord weghalen. */
export function schoonAntwoord(v: Vraag, ruw: unknown): string | null {
  const w = String(ruw ?? "").trim().slice(0, v.soort === "lang" ? 2000 : 160)
  if (!w) return ""
  if (v.soort === "jnov") return (JNOV as readonly string[]).includes(w) ? w : null
  if (v.soort === "keuze") return v.opties?.includes(w) ? w : null
  if (v.soort === "datum") return /^\d{4}-\d{2}-\d{2}$/.test(w) ? w : null
  return w
}

/** Een id uit een tekst: kleine letters en streepjes, uniek binnen de lijst. */
export function nieuwId(tekst: string, bestaand: Set<string>) {
  const basis =
    tekst
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "vraag"
  let id = basis
  for (let n = 2; bestaand.has(id); n++) id = `${basis}-${n}`
  return id
}

/** Een opgeslagen lijst van onbekende vorm veilig maken; mist er iets, dan de startinhoud. */
export function schoonLijst(ruw: unknown): Vragenlijst {
  const r = ruw as Partial<Vragenlijst> | null
  if (!r || !Array.isArray(r.categorieen) || !r.categorieen.length) return STANDAARD
  const s = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "")
  const lijst = (v: unknown, n = 40) => (Array.isArray(v) ? v.map((x) => s(x, 80)).filter(Boolean).slice(0, n) : undefined)
  return {
    versie: Number.isSafeInteger(r.versie) ? (r.versie as number) : 1,
    bijgewerkt: s(r.bijgewerkt, 10) || STANDAARD.bijgewerkt,
    diensten: lijst(r.diensten) ?? STANDAARD.diensten,
    categorieen: r.categorieen.slice(0, 40).map((c) => ({
      id: s(c.id, 64) || "categorie",
      naam: s(c.naam, 80) || "Categorie",
      toonBij: lijst(c.toonBij)?.length ? lijst(c.toonBij) : undefined,
      vragen: (Array.isArray(c.vragen) ? c.vragen : []).slice(0, 200).map((v) => ({
        id: s(v.id, 64),
        tekst: s(v.tekst, 200) || "Vraag",
        soort: (VRAAG_SOORTEN as readonly string[]).includes(v.soort) ? v.soort : "tekst",
        opties: lijst(v.opties, 30),
        eenheid: s(v.eenheid, 12) || undefined,
        hulp: s(v.hulp, 200) || undefined,
        toonBij: lijst(v.toonBij)?.length ? lijst(v.toonBij) : undefined,
        snel: v.snel === true || undefined,
        vervallen: v.vervallen === true || undefined,
      })),
    })),
  }
}

/** Het oppervlak uit de opname in duizendsten m²: ingevuld, of lengte × breedte. */
export function oppervlakUit(a: Record<string, string>): number | null {
  const opp = a.oppervlak ? leesMilli(a.oppervlak) : null
  if (opp && opp > 0) return opp
  const lg = a.lengte ? leesMilli(a.lengte) : null
  const br = a.breedte ? leesMilli(a.breedte) : null
  return lg && br && lg > 0 && br > 0 ? deel(lg * br, 1000) : null
}

/** Het oppervlak van een zone: ingevuld, of lengte × breedte (duizendsten m²). */
export const zoneOppervlak = (z: Pick<Zone, "oppervlak" | "lengte" | "breedte">) => oppervlakUit({ oppervlak: z.oppervlak, lengte: z.lengte, breedte: z.breedte })
