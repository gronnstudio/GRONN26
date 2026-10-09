import type { L } from "@/lib/i18n"

// De maandbalk (eigenaar, 9 okt 2026, naar chrisjanssenstein.com: "maak enkel
// die balk met maanden en de maand die actief is, en dan een interactieve tip,
// of tips"). Per maand één tip voor de vijver en één voor de tuin, elk met een
// link naar de pagina waar die dienst staat.

export type Tip = { tekst: L; href: "/vijvers" | "/tuinen" }
export type Maand = { kort: L; naam: L; vijver: Tip; tuin: Tip }

const v = (nl: string, en: string): Tip => ({ tekst: { nl, en }, href: "/vijvers" })
const t = (nl: string, en: string): Tip => ({ tekst: { nl, en }, href: "/tuinen" })

export const MAANDEN: Maand[] = [
  {
    kort: { nl: "jan", en: "jan" },
    naam: { nl: "januari", en: "January" },
    vijver: v("Bevroren? Houd een wak open, maar sla het ijs nooit kapot: de drukgolf schaadt de vissen.", "Frozen? Keep a hole open, but never smash the ice: the shock wave harms the fish."),
    tuin: t("Laat zaaddozen en holle stengels staan. Daar overwinteren insecten in.", "Leave seed heads and hollow stems standing. Insects overwinter in them."),
  },
  {
    kort: { nl: "feb", en: "feb" },
    naam: { nl: "februari", en: "February" },
    vijver: v("Kijk pomp en filter na nu het nog rustig is, dan draaien ze als het water opwarmt.", "Check pump and filter while it is quiet, so they run when the water warms up."),
    tuin: t("Snoei appel en peer op een droge dag zonder vorst.", "Prune apple and pear trees on a dry, frost-free day."),
  },
  {
    kort: { nl: "mrt", en: "mar" },
    naam: { nl: "maart", en: "March" },
    vijver: v("Haal het bladnet weg en schep het oude blad eruit voordat het water warmer wordt.", "Take the leaf net off and scoop out old leaves before the water warms up."),
    tuin: t("Knip vaste planten en grassen terug zodra je nieuwe groei ziet.", "Cut back perennials and grasses as soon as you see new growth."),
  },
  {
    kort: { nl: "apr", en: "apr" },
    naam: { nl: "april", en: "April" },
    vijver: v("Zet het filter weer aan. Voer de vissen pas als het water boven 10 °C komt.", "Switch the filter back on. Only feed the fish once the water is above 10 °C."),
    tuin: t("Goede maand om vaste planten te zetten en bloemrijk gras in te zaaien.", "A good month to plant perennials and sow flower-rich grass."),
  },
  {
    kort: { nl: "mei", en: "may" },
    naam: { nl: "mei", en: "May" },
    vijver: v("Plant nu waterplanten: het water is warm genoeg om ze snel te laten aanslaan.", "Plant water plants now: the water is warm enough for them to take quickly."),
    tuin: t("Maai mei niet. Laat het gras bloeien, de bijen hebben het nu nodig.", "No Mow May. Let the grass flower, the bees need it now."),
  },
  {
    kort: { nl: "jun", en: "jun" },
    naam: { nl: "juni", en: "June" },
    vijver: v("Draadalg? Draai het met een stok uit het water en zorg dat een derde van de vijver in de schaduw ligt.", "Blanket weed? Twist it out with a stick and keep a third of the pond shaded."),
    tuin: t("Geef 's ochtends vroeg water, liever één keer flink dan elke dag een beetje.", "Water early in the morning, once thoroughly rather than a little every day."),
  },
  {
    kort: { nl: "jul", en: "jul" },
    naam: { nl: "juli", en: "July" },
    vijver: v("Vul verdampt water aan met regenwater uit de ton, dat voedt geen algen.", "Top up evaporated water with water from the rain barrel; it does not feed algae."),
    tuin: t("Leg een laag mulch tussen de planten, dan droogt de bodem minder uit.", "Spread mulch between the plants so the soil dries out less."),
  },
  {
    kort: { nl: "aug", en: "aug" },
    naam: { nl: "augustus", en: "August" },
    vijver: v("Warme nachten zijn zuurstofarm. Laat de beekloop of een luchtpomp 's nachts lopen.", "Warm nights are low in oxygen. Keep the stream or an air pump running at night."),
    tuin: t("Verzamel zaad van je vaste planten voor volgend jaar.", "Collect seed from your perennials for next year."),
  },
  {
    kort: { nl: "sep", en: "sep" },
    naam: { nl: "september", en: "September" },
    vijver: v("Dun woekerende waterplanten uit en knip afgestorven blad weg.", "Thin out rampant water plants and cut away dead leaves."),
    tuin: t("Het plantseizoen begint: zet vaste planten en bloembollen in de grond.", "Planting season starts: put perennials and bulbs in the ground."),
  },
  {
    kort: { nl: "okt", en: "oct" },
    naam: { nl: "oktober", en: "October" },
    vijver: v("Span een bladnet over de vijver voordat de bladval begint.", "Stretch a leaf net over the pond before the leaves start to fall."),
    tuin: t("Laat het blad in de borders liggen. Het voedt de bodem en beschermt wat erin leeft.", "Leave the leaves in the borders. They feed the soil and shelter what lives there."),
  },
  {
    kort: { nl: "nov", en: "nov" },
    naam: { nl: "november", en: "November" },
    vijver: v("Stop met voeren als het water onder 10 °C zakt en maak de vijver winterklaar.", "Stop feeding once the water drops below 10 °C and get the pond ready for winter."),
    tuin: t("Plant bomen en hagen met blote wortel: ze wortelen de hele winter door.", "Plant bare-root trees and hedges: they root all through the winter."),
  },
  {
    kort: { nl: "dec", en: "dec" },
    naam: { nl: "december", en: "December" },
    vijver: v("Maak het bladnet leeg, anders hangt het blad alsnog in het water.", "Empty the leaf net, or the leaves end up in the water after all."),
    tuin: t("Plan in de winter, leg aan in het voorjaar. Nu is de tijd voor een ontwerp.", "Plan in winter, build in spring. Now is the time for a design."),
  },
]
