import {
  DraftingCompass,
  House,
  Images,
  Send,
  Sprout,
  type LucideIcon,
} from "lucide-react"

import type { DockId, SectionId } from "@/lib/nav"

// Icons for the five sections, and ONLY the five sections.
//
// Their children get none. Eleven bespoke service icons is exactly the
// "clipart" CLAUDE.md rejects, and the mega menu already settled this
// question once: a service's leading mark is its own survey index
// (01–11), because the brand's line-work language already has a mark for
// it. That holds here too — depth is carried by position, not by more
// drawing.
//
// ── WAAROM DIT NU LUCIDE IS ──────────────────────────────────────────
//
// Deze vijf waren met de hand getekend, en dat was niet het probleem: de
// eigenaar zag de rij op zijn telefoon en vond hem niet kloppen, en toen
// er gemeten werd bleek de oorzaak niet de tekening maar het GEWICHT. De
// terug-naar-boven-pijl stond op een 14-raster met streek 1.8 — dat is
// 3.09 op het 24-raster dat alle andere gebruikten, dus 72% zwaarder. De
// plus stond op 2.2. Twee van de zeven stonden in een andere zwaarte, en
// dat is wat een rij scheef laat lezen.
//
// Er zijn drie sets naast elkaar gezet en dit is de gekozene. Het
// argument ervoor is niet dat hij mooier is maar dat hij één FAMILIE is:
// Lucide is als geheel ontworpen op één raster met één streek en één
// eindvorm, dus de vraag "passen deze zeven bij elkaar" is er al
// beantwoord en kan hier niet meer stilletjes uit de pas gaan lopen.
//
// Hij stond al in de afhankelijkheden (`lucide-react`), dus dit voegt er
// geen toe — AGENTS.md §1 verbiedt nieuwe bibliotheken erbij, en die
// regel wordt hier niet aangeraakt.
//
// ── STREEK 1.8, NIET LUCIDE'S EIGEN 2 ────────────────────────────────
//
// Lucide tekent standaard op 2. Op 1.8 staat hij dichter bij de fijne
// lijnvoering die CLAUDE.md als de werkende beeldtaal beschrijft, en het
// is de zwaarte waarin de eigenaar de set heeft gezien en gekozen. Eén
// getal, op één plek: verander het hier en de hele rij verandert mee.
//
// ── WAT ER NOG OPEN STAAT ────────────────────────────────────────────
//
// `Images` (gestapelde foto's) en `NotebookPen` (notitieboek mét pen)
// dragen het meeste binnenwerk van de zeven en lopen op 22px het eerst
// dicht. Als dat op een echte telefoon stoort zijn `Map` en `FileText`
// de rustiger buren binnen dezelfde familie — de set blijft dan heel.

/** De zwaarte van de hele rij, op één plek. */
export const ICON_STROKE = 1.8

/**
 * De maat van elk icoon in het telefoonchroom: de vijf vakken, de drie
 * cirkels van de leesstand en de twee knoppen bovenin. Eén getal, want
 * het waren er drie (20, 22 en 26) en dat zag de eigenaar meteen
 * (23 sep 2026: "Iconen hebben niet dezelfde grootte"). Waar een klasse
 * nodig is staat `size-[24px]` letterlijk (Tailwind leest geen
 * variabelen); `behaviors.spec.ts` meet dat ze allemaal gelijk zijn.
 */
export const ICON_SIZE = 24

const SECTION_GLYPHS: Record<SectionId, LucideIcon> = {
  // Een passer: het instrument van de tekentafel. De studio is degene
  // die het plan maakt, en dit is het gereedschap waarmee dat gebeurt.
  studio: DraftingCompass,
  // Een kiemplant — het werk dat groeit. Hetzelfde onderwerp als de
  // handgetekende voorganger, want dat was nooit waar de klacht over
  // ging.
  services: Sprout,
  // Afbeeldingen: werk dat af is en vastgelegd.
  projects: Images,
  // Een notitieboek met pen — veldnotities, wat we onderweg leren.
  // GEEN envelop, en dat is een oude beslissing die blijft staan:
  // contact is de lijn die je naar iemand trekt, niet de post. Een
  // papieren vliegtuigje is die lijn; het is bovendien wat elke telefoon
  // inmiddels als "stuur iets" leest.
  contact: Send,
}

export function SectionIcon({
  id,
  size = 22,
}: {
  id: SectionId
  size?: number
}) {
  const Glyph = SECTION_GLYPHS[id]
  return <Glyph size={size} strokeWidth={ICON_STROKE} aria-hidden />
}

// ── DE VIJF VAN DE TELEFOONPIL ───────────────────────────────────────
//
// Vier ervan zijn letterlijk de glyphs hierboven; het vijfde is Home, en
// dat bestaat in `SECTIONS` niet omdat Home daar het logo is en geen
// menu-item. In de dock is hij wél een vak, dus hier krijgt hij zijn
// tekening.
//
// Een huisje, en dat is de enige van de vijf die een echte conventie is.
// Juist daarom staat hij vooraan: het vak waar een eerste bezoeker het
// zekerst van is, is het vak waar hij naartoe kan als hij de weg kwijt
// is.
//
// Dezelfde familie, dezelfde streek. Dat is de hele reden dat deze set
// Lucide is en niet handwerk — zie de uitleg hierboven — en een zesde
// glyph uit een andere bron zou dat argument meteen ongedaan maken.
const DOCK_GLYPHS: Record<DockId, LucideIcon> = {
  home: House,
  services: SECTION_GLYPHS.services,
  projects: SECTION_GLYPHS.projects,
  studio: SECTION_GLYPHS.studio,
  contact: SECTION_GLYPHS.contact,
}

export function DockIcon({
  id,
  className,
}: {
  id: DockId
  className?: string
}) {
  const Glyph = DOCK_GLYPHS[id]
  // `className` en geen `size`: de dock zet de maat in Tailwind-klassen
  // (`size-5`), zodat hij in één regel samen met de rest van het chroom
  // te lezen is. De streek blijft die van de familie.
  return <Glyph className={className} strokeWidth={ICON_STROKE} aria-hidden />
}
