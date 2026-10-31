import type { L } from "@/lib/i18n"

// De moestuinfoto's op de Studio-pagina: de persoon achter de studio,
// buiten de opdrachten (een deel in de eigen tuin, een deel op een
// vakantiepark in Beringe, België).
//
// Aangeleverd door Nick op 24 sep 2026 via Drive, map "Claude/content":
// eigen foto's van Nick, geen klanten of kinderen in beeld. De webversies
// in /public/studio/moestuin zijn 600 × 800 en ZONDER metadata opgeslagen
// (geen GPS, geen camera-info); moestuin-markee.spec.ts bewaakt dat.
// Alt-teksten zijn geschreven na het bekijken van elke foto.

export type MoestuinFoto = {
  src: string
  width: number
  height: number
  alt: L
}

const foto = (nr: string, nl: string, en: string): MoestuinFoto => ({
  src: `/studio/moestuin/${nr}.jpg`,
  width: 600,
  height: 800,
  alt: { nl, en },
})

/** Twee rijen voor de markee: rij 1 loopt naar links, rij 2 naar rechts. */
export const MOESTUIN_RIJEN: MoestuinFoto[][] = [
  [
    foto("M01", "Nick gehurkt in de moestuin, lachend, met een handvol pas gerooide aardappels.", "Nick crouching in the vegetable garden, laughing, with a handful of freshly dug potatoes."),
    foto("M02", "Een kist vol pas gerooide gele aardappels op het gras.", "A crate full of freshly dug yellow potatoes on the grass."),
    foto("M03", "Nick houdt een bos snijbiet met roze stelen omhoog.", "Nick holding up a bunch of chard with pink stems."),
    foto("M04", "Nick lachend tussen de bonenranken, met een aardappel in de hand.", "Nick laughing among the bean vines, with a potato in his hand."),
    foto("M05", "Twee handen vol rode aardappels.", "Two hands full of red potatoes."),
    foto("M06", "Nick met een kist aardappels op het omgespitte bed.", "Nick with a crate of potatoes on the freshly dug bed."),
  ],
  [
    foto("M07", "Nick met een kist aardappels, één opvallend gevormde aardappel omhoog.", "Nick with a crate of potatoes, holding up one oddly shaped potato."),
    foto("M08", "Nick bij een kist rode aardappels in de moestuin, in de avondzon.", "Nick beside a crate of red potatoes in the vegetable garden, in the evening sun."),
    foto("M09", "Nick geknield voor de bonenranken, lachend, met een aardappel in de hand.", "Nick kneeling in front of the bean plants, laughing, with a potato in his hand."),
    foto("M10", "Nick houdt een aardappel omhoog tussen de hoge bonenranken.", "Nick holding up a potato among the tall bean vines."),
    foto("M11", "Nick gehurkt tussen de snijbiet, aan het oogsten.", "Nick crouching among the chard, harvesting."),
    foto("M12", "Nick gehurkt in de moestuin, met een handvol aardappels, tussen de tomatenpalen.", "Nick crouching in the vegetable garden with a handful of potatoes, among the tomato stakes."),
  ],
]
