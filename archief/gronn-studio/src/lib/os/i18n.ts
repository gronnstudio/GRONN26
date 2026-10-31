import type { Locale } from "@/lib/i18n"

// The OS in two languages (owner, 30 Sep 2026: "language switch also in
// OS").
//
// Its own cookie, not the site's: the site follows the visitor's
// language, the OS follows Nick's working language, and switching one
// must not flip the other. English by default, as in the brief.
//
// Two tools:
//   tr(locale, en, nl)  for text written in the code, including every
//                       sentence built around a number;
//   say(locale, text)   for the fixed English words the data modules
//                       carry (stages, kinds, demo lines, the pond's
//                       tasks), looked up in NL below. A word missing
//                       from NL stays English rather than going blank.

export const OS_LANG_COOKIE = "gronn-os-lang"

export function osLocaleFrom(cookie: string | undefined): Locale {
  return cookie === "nl" ? "nl" : "en"
}

export function tr(locale: Locale, en: string, nl: string): string {
  return locale === "nl" ? nl : en
}

export function say(locale: Locale, text: string): string {
  if (locale !== "nl") return text
  return NL[text] ?? text
}

/** Dates in the OS: "30 Sep" / "30 sep". */
export function shortDate(locale: Locale, iso: string): string {
  if (!iso) return "—"
  return new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString(locale === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "short",
  })
}

/** "1 day" / "3 days", "1 dag" / "3 dagen". */
export function days(locale: Locale, n: number): string {
  return locale === "nl" ? `${n} ${n === 1 ? "dag" : "dagen"}` : `${n} ${n === 1 ? "day" : "days"}`
}

const NL: Record<string, string> = {
  // Sections
  Core: "Kern",
  Projects: "Projecten",
  Pipeline: "Pijplijn",
  Finance: "Financiën",
  Planning: "Planning",
  Files: "Bestanden",
  Suppliers: "Leveranciers",
  Website: "Website",

  // Project stages
  Lead: "Lead",
  Intake: "Intake",
  Design: "Ontwerp",
  Quotation: "Offerte",
  Approved: "Akkoord",
  Execution: "Uitvoering",
  Waiting: "Wacht",
  Completed: "Afgerond",
  Archived: "Gearchiveerd",
  Maintenance: "Onderhoud",
  Finalisation: "Afronding",

  // Lead stages
  "New lead": "Nieuwe lead",
  Contacted: "Contact gehad",
  Proposal: "Voorstel",
  Decision: "Beslissing",
  Won: "Gewonnen",
  Lost: "Verloren",

  // Kinds and statuses
  "Pond renovation": "Vijverrenovatie",
  "Pond reconstruction": "Vijverreconstructie",
  "Garden redesign": "Tuinherinrichting",
  "Terrace, 24 m²": "Terras, 24 m²",
  Garden: "Tuin",
  Enquiry: "Aanvraag",

  // Project notes
  "Clearing, topsoil and replacement plants left; further planting spring 2027.":
    "Nog opruimen, teelaarde en vervangende planten; verdere beplanting voorjaar 2027.",
  "24 m² of 60 × 60 × 4 cm tiles, laid in two days.": "24 m² tegels van 60 × 60 × 4 cm, in twee dagen gelegd.",
  "No next step recorded.": "Geen volgende stap vastgelegd.",

  // Lead next steps
  "Wait for the decision": "Wachten op de beslissing",
  "Write the quote": "De offerte schrijven",
  Invoiced: "Gefactureerd",

  // Activity
  "Enquiry received": "Aanvraag ontvangen",

  // The pond's tasks
  "Remove the remaining wood and rubble": "Het resterende hout en puin afvoeren",
  "Top up the surrounding beds with topsoil": "De borders rondom aanvullen met teelaarde",
  "Replace the pond plants the fish damaged, and protect the new ones":
    "De door de vissen beschadigde vijverplanten vervangen en de nieuwe beschermen",
  "Walk the owner through the valves and the water split": "De eigenaar de kranen en de waterverdeling uitleggen",
  "Photograph the skimmer (F06 is still empty)": "De skimmer fotograferen (F06 is nog leeg)",
  "Further planting around the ponds": "Verdere beplanting rond de vijvers",
  "Lay the 50 mm pressure PVC with 45° bends": "De 50 mm druk-pvc leggen met bochten van 45°",
  "Set up the three-chamber filter with bypass": "Het driekamerfilter met bypass opstellen",
  "Repair the PP filter (2K glue, then RubberSeal)": "Het PP-filter repareren (2K-lijm, daarna RubberSeal)",
  "Build the waterfall and stream bed": "De waterval en de beekbedding bouwen",
  "Plant the 11 baskets along waterline and stream edge": "De 11 manden langs waterlijn en beekrand beplanten",

  // The pond's materials
  Pump: "Pomp",
  Filter: "Filter",
  "Pressure PVC": "Druk-pvc",
  Bends: "Bochten",
  Fittings: "Hulpstukken",
  Valves: "Kranen",
  Skimmer: "Skimmer",
  Repair: "Reparatie",
  "Plant baskets": "Plantmanden",
  "Replacement pond plants": "Vervangende vijverplanten",
  "Further planting": "Verdere beplanting",
  "3 chambers, with bypass": "3 kamers, met bypass",
  "50 mm, rated to 7.5 bar": "50 mm, tot 7,5 bar",
  "2–4 × 90°, rest 45°": "2–4 × 90°, de rest 45°",
  "T-pieces, reducers, threaded unions": "T-stukken, verloopstukken, schroefkoppelingen",
  "Ball valves on both branches, gate valves on filter drains": "Kogelkranen op beide takken, schuifkranen op de filterafvoeren",
  "1 × surface skimmer": "1 × oppervlakteskimmer",
  "Two-component glue + RubberSeal": "Tweecomponentenlijm + RubberSeal",
  "11 × with clay and substrate": "11 × met klei en substraat",
  "For the ones the fish damaged": "Voor de planten die de vissen beschadigden",
  "Around the ponds": "Rond de vijvers",
  Installed: "Geplaatst",
  "To order": "Te bestellen",
  Planned: "Gepland",

  // The pond's notes
  "More fittings were needed than planned: a route on paper has to be translated on site into every single connection.":
    "Er waren meer hulpstukken nodig dan gepland: een route op papier moet op locatie vertaald worden naar elke losse verbinding.",
  "The PP filter repair took two rounds. Two-component glue alone was not enough; RubberSeal finished it.":
    "De reparatie van het PP-filter kostte twee rondes. Tweecomponentenlijm alleen was niet genoeg; RubberSeal maakte het af.",
  "The fish damaged part of the new planting. Placement and protection of the replacements need thought.":
    "De vissen beschadigden een deel van de nieuwe beplanting. Plaats en bescherming van de vervangers vragen aandacht.",
  "Keep the valves and unions reachable: maintenance was designed in from the start.":
    "Houd de kranen en koppelingen bereikbaar: onderhoud zat vanaf het begin in het ontwerp.",

  // Photo groups
  "Existing situation": "Bestaande situatie",
  Process: "Proces",
  Construction: "Uitvoering",
  Visualisations: "Visualisaties",

  // System
  ponds: "vijvers",
  waterfall: "waterval",
  stream: "beekloop",
}
