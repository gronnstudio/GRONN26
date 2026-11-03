"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { SearchIcon, ShoppingBagIcon } from "lucide-react"
import type Lenis from "lenis"

import { LocaleLink } from "@/components/locale-link"
import { useT } from "@/components/language-provider"
import { useSearch } from "@/components/search/command-palette"
import { DockIcon, ICON_SIZE, ICON_STROKE } from "@/components/layout/section-icons"
import { Komeet } from "@/components/layout/komeet"
import { BUSINESS } from "@/lib/business"
import { useFlag } from "@/lib/flags"
import { activeSection, DOCK_ORDER, dockHref, dockLabel } from "@/lib/nav"
import { useInRust, wekBalken } from "@/lib/scroll-rest"
import { useReducedMotion } from "@/lib/use-reduced-motion"
import { cn } from "@/lib/utils"

/**
 * De telefoondock. Vijf vaste bestemmingen, en niets anders.
 *
 * ── WAT DIT VERVANGT ────────────────────────────────────────────────
 *
 * Het menuwiel: acht slots op een echte poolcirkel, een binnenring, drie
 * panelen en een sectievel. Elf taken, drie volledige herontwerpen en
 * een numerieke fitter over vier schermbreedtes om te voorkomen dat een
 * label onder een knop viel. De eigenaar over het resultaat: "in mijn
 * hoofd beter uitgedacht, maar in praktijk dramatisch."
 *
 * De diagnose staat in die zin zelf. Het wiel veranderde onderweg van
 * vorm — het draaide, het klapte in tot twee hoeken, het kwam 24px
 * omhoog bij aanraking, en er verscheen een tweede ring die er daarvoor
 * niet was. Elk van die bewegingen was op zichzelf te verdedigen en
 * samen maakten ze een balk waarvan je niet wist waar hij zou staan
 * als je hem nodig had.
 *
 * Wat hier staat doet het omgekeerde: **zes vakken, altijd alle zes,
 * altijd op dezelfde plaats.** Er verdwijnt niets en er komt niets bij.
 * Het enige dat verandert is de MAAT van de balk — tijdens het lezen
 * wordt hij smaller, bij aanraken weer vol.
 *
 * ── WAT WEL IS MEEGEKOMEN VAN HET WIEL ──────────────────────────────
 *
 * De mechaniek die daar duur is geleerd: `env(safe-area-inset-bottom)`
 * altijd via `max()`, en een scrolldrempel met een dode zone van 4px
 * zodat de uitloop van Lenis en het rubber-banden van iOS hem niet
 * laten flikkeren. Die twee getallen zijn letterlijk dezelfde als in
 * `mobile-dock.tsx`; ze zijn hier niet opnieuw bedacht.
 *
 * ── HOE DE GROENE ACHTERGROND BEWEEGT ───────────────────────────────
 *
 * Eén element dat van vak naar vak schuift, niet vijf die om beurten
 * van kleur wisselen. Het rekent met HETZELFDE raster als de links, en
 * dat is subtieler dan het lijkt: een `absolute` kind meet zijn
 * procenten over de PADDINGBOX van zijn voorouder, een flexkind
 * verdeelt de CONTENTBOX. Die twee schelen precies de padding van de
 * balk. Zodra de balk `p-1.5` kreeg verdeelden de links `breedte − 12`
 * over zes en de capsule `breedte` over zes: twee rasters die in het
 * midden samenvallen en naar de randen toe uit elkaar lopen. In het
 * concept waar deze pil vandaan komt is dat twee keer gemeten, met
 * afwijkingen van −4 tot +4px.
 *
 * Daarom trekt de rekensom hieronder de padding er eerst af. Er staat
 * een test op die het midden van elk icoon tegen het midden van zijn
 * capsule meet, op elke stand en op vier breedtes.
 *
 * ── HOE DE KLEUR VAN HET ICOON WISSELT ──────────────────────────────
 *
 * Dit is het detail waar dit soort menu's op stukloopt.
 *
 * Laat je de icoonkleur meelopen met een gewone transition, dan is het
 * icoon 240ms lang een TUSSENKLEUR: onderweg van `muted` naar wit, op
 * een ondergrond die zelf ook halverwege is. Rond 1,5:1 — onleesbaar,
 * precies tijdens de beweging waar iemand naar kijkt.
 *
 * Wat er staat is saaier en beter: de kleur SPRINGT. Het actieve icoon
 * krijgt `transition-delay` gelijk aan de schuifduur en wordt dus wit
 * op het moment dat het groen eronder aankomt; het icoon dat afgaat
 * heeft geen vertraging en wordt meteen weer inkt. Nooit een
 * tussenkleur, nooit een icoon op de verkeerde ondergrond.
 *
 * ── DE MAAT VAN HET ICOON ───────────────────────────────────────────
 *
 * 26px, en dat is niet de maat waarmee dit begon. Op 20px keek de
 * eigenaar naar de volle stand op zijn telefoon en zei: "de uitgerekte
 * versie ziet er zwak uit, waarschijnlijk door de negatieve ruimte
 * tussen de iconen."
 *
 * Dat was te rekenen. Op 390px is een vak 59px breed; een icoon van 20
 * vult daar 34 % van. In de RUSTSTAND is het vak 46px en vult hetzelfde
 * icoon 43 % — en dat was de dichtheid die wél goed las. De volle stand
 * was niet te breed, het icoon was te klein voor zijn vak.
 *
 * Op 26px vult het icoon 44 % van het volle vak: dezelfde dichtheid als
 * de ruststand die klopte. In rust wordt het 57 %, wat krap is maar
 * binnen de capsule van 44px nog 9px aan elke kant laat.
 *
 * ── ALLE MATEN IN PX, GEEN ENKELE IN REM ────────────────────────────
 *
 * `h-11`, `size-5`, `p-1.5` en `max-w-sm` zijn allemaal rem. Ze stonden
 * hier eerst, overgenomen uit het concept, en de eigen test ving het:
 * bij "grotere tekst" op 125% werd elk vak 55 hoog in plaats van 44, en
 * groeide de balk mee tot buiten de maat waarop hij is uitgerekend.
 *
 * Dat is precies de fout die CLAUDE.md ontwerpregel 6 beschrijft, en het
 * is letterlijk dezelfde fout die de knoppen van het menuwiel van het
 * podium joeg — één `size-11` maakte ze 55 × 55.
 *
 * Tekst groeit, chroom niet. De labels (25 sep 2026) zijn chroom en
 * staan dus ook in px, met een vaste regelhoogte: hier groeit niets. Zet er nooit een rem-maat in terug.
 *
 * ── WAAROM `left` EN NIET `transform` ───────────────────────────────
 *
 * `transform` is de eigenschap die je hoort te animeren. Hier niet: een
 * contrastcontrole bepaalt de ondergrond van een element uit de
 * geometrie, en op een getransformeerde dock las axe het groen
 * consequent onder het verkeerde vak. Het gaat om één klein element in
 * een `fixed` balk; de layoutkosten zijn verwaarloosbaar en
 * auditeerbaarheid weegt hier zwaarder dan een principe over
 * compositielagen.
 */

/**
 * De inzet van de groene capsule binnen de balk, in pixels — en dat is
 * precies de padding van de balk zelf (`p-1.5`). Zo vult de capsule het
 * vak van het actieve item en niet iets van net een andere maat.
 */
const INSET = 6

/**
 * Hoeveel de capsule aan WEERSZIJDEN binnen zijn vak blijft.
 *
 * Zonder de ondergrens gaat het in de smalle stand mis. In rust is een
 * vak 46px breed; daar 6px aan elke kant vanaf is 34, en de rij is 44
 * hoog. Dan is de capsule HOGER dan breed — een staand ei.
 *
 * Vandaar `max(..., 2.75rem)`: nooit smaller dan hij hoog is.
 *
 *   vol (384px):  vak 62 → capsule 50 × 44   (liggend, zoals bedoeld)
 *   rust (288px): vak 46 → capsule 44 × 44   (rond, door de ondergrens)
 *
 * `44px` en niet `2.75rem`, en dat geldt voor elke maat in dit bestand:
 * zie de paragraaf hieronder.
 */
const KRIMP = 6

/**
 * Vijf vakken. Vijf bestemmingen, en niets anders.
 *
 * Hier stond `+ 1`: de pijl omhoog reed mee als zesde vak, overgenomen
 * uit het concept. De eigenaar wees dat af, en terecht — het open menu
 * is een MENU. De pijl hoort bij de ingeklapte stand, samen met Home en
 * Zoeken, want dat zijn de drie dingen die je tijdens het lezen nodig
 * hebt.
 */
const VAKKEN = DOCK_ORDER.length

/**
 * De pilvorm van de volle balk: 384 breed, 44 + 2 × 6 + 2 × 1 rand = 58 hoog.
 *
 * Een lichte plaat, geen glas (eigenaar, 1 okt 2026, bij de dock van de
 * ING-app: "Make it more similar to this, use montserrat font and use the
 * colors similarly, instead of darkgreen now, keep the comet"). Dekkend
 * `--dock-grond` (wit op Licht, verhoogd antraciet op Donker) met een
 * zachte schaduw: wat eronder schuift, haalt de iconen en labels niet
 * meer onder hun contrast, dus het glas hoeft hier niets meer te meten.
 */
const PIL = [
  // Geen breedte hier: de balk zet `w-full` (hij staat in de flow), de
  // leesstand ontleent zijn breedte aan `inset-x` (hij is absolute).
  // Een gedeelde `w-full` maakte de leesstand op een iPhone van 390
  // schermbreed in plaats van scherm-min-marges, en hij liep rechts weg.
  "mx-auto flex max-w-[384px] p-[6px]",
  "rounded-full border border-line/10",
  "bg-[color:var(--dock-grond)]",
  "shadow-[var(--shadow-dock)]",
].join(" ")

export function DockNav() {
  const t = useT()
  const pathname = usePathname()
  const active = activeSection(pathname)
  const index = active ? DOCK_ORDER.indexOf(active) : -1
  const hasActive = index >= 0

  // Eén bron voor beide balken — zie `src/lib/scroll-rest.ts`. Twee
  // eigen luisteraars zouden op verschillende momenten kunnen omslaan,
  // en dan vertrekt de ene balk terwijl de andere blijft staan.
  const rust = useInRust()
  const hidden = useKeyboardRetreat()

  const slot = `((100% - ${INSET * 2}px) / ${VAKKEN})`

  return (
    <nav
      aria-label={t({ en: "Main menu", nl: "Hoofdmenu" })}
      // Twee oppervlakken dragen hetzelfde label: deze pil en de balk op
      // desktop. Dat mag — er is er altijd precies één zichtbaar, de
      // ander staat op `display:none` en zit dus niet in de
      // toegankelijkheidsboom. Voor een test is dat onderscheid er
      // alleen niet, vandaar dit attribuut.
      data-nav="dock"
      className={cn(
        "fixed inset-x-0 bottom-0 z-[61] md:hidden",
        "px-[12px] pb-[max(12px,calc(env(safe-area-inset-bottom)+4px))]",
        "transition-transform duration-[var(--dur-dock)] ease-[var(--ease-out-expo)]",
        "motion-reduce:transition-none",
        // Wijkt voor het schermtoetsenbord. `translate-y` en niet
        // `display:none`, zodat een element dat focus heeft nooit uit de
        // boom verdwijnt terwijl het die focus vasthoudt.
        hidden && "translate-y-[130%]"
      )}
    >
      <div
        data-dock-row
        // `inert` en niet alleen onzichtbaar. Een balk op `opacity-0`
        // blijft met Tab bereikbaar, en dan tabt iemand door een menu
        // dat hij niet ziet. De ingeklapte laag hieronder draagt
        // hetzelfde, precies omgekeerd.
        inert={rust || undefined}
        className={cn(
          // 320 en niet 384. Met zes vakken was 384 goed; met vijf wordt
          // elk vak 74px breed en vult een icoon van 26 daar nog maar
          // 35 % van — precies de leegte waar de eigenaar over viel. Op
          // 320 is een vak 61,6 en vult het icoon 42 %, de dichtheid die
          // hij goedkeurde.
          //
          // Het scheelt bovendien dat de balk niet meer van rand tot
          // rand loopt maar als een pil in het scherm ligt, met lucht
          // aan weerszijden. Dat is ook wat de voorbeelden doen die de
          // eigenaar aanwees.
          PIL,
          "relative w-full items-stretch",
          // Sinds 1 okt 2026 een lichte plaat in plaats van glas: zie
          // `PIL` hierboven.
          "transition-[opacity,transform] duration-[var(--dur-dock)] ease-[var(--ease-out-expo)]",
          "motion-reduce:transition-none",
          // In rust maakt deze inhoud plaats voor de leesstand, in
          // DEZELFDE pil. Eerst kromp de balk (384 → 288, afgewezen), toen
          // werd het drie losse cirkels; sinds 23 sep blijft de pil even
          // groot en wisselt alleen wat erin staat.
          rust
            ? "pointer-events-none translate-y-2 opacity-0"
            : "translate-y-0 opacity-100"
        )}
      >
        {/* De emberkomeet: een dunne boog die de rand rondgaat. Puur
            decoratief, dus buiten de toegankelijkheidsboom en niet
            aanklikbaar. Dezelfde radius als de dock — staat hij er los
            van, dan loopt de boog op de hoeken naast de rand. */}
        <Komeet />

        {/* De zachte pil achter het actieve vak (eigenaar, 1 okt 2026:
            zoals ING, niet meer het bosgroen). Eén element dat schuift. Hij staat
            vóór de links in de DOM en zonder z-index, dus de iconen
            liggen erbovenop. */}
        <span
          aria-hidden
          data-dock="capsule"
          className={cn(
            "pointer-events-none absolute rounded-full bg-[color:var(--dock-actief)]",
            "transition-[left,opacity] duration-[var(--dur-dock)] ease-[var(--ease-out-expo)]",
            "motion-reduce:transition-none"
          )}
          style={
            {
              top: INSET,
              bottom: INSET,
              // Eén rekensom voor alle standen. Dat de balk smaller
              // wordt hoeft hier niets te betekenen: `--vak` is een
              // percentage, dus alles krimpt vanzelf mee. Elke eerdere
              // scheefstand kwam voort uit een tweede, afwijkende
              // rekensom voor de smalle stand — die is er niet.
              "--vak": `calc(${slot})`,
              "--capsule": `max(calc(var(--vak) - ${KRIMP * 2}px), 44px)`,
              // Gecentreerd IN zijn vak, niet vullend: de helft van wat
              // er overblijft aan weerszijden. Het midden van de capsule
              // is daarmee per definitie het midden van het vak.
              left: `calc(${INSET}px + ${Math.max(index, 0)} * var(--vak) + (var(--vak) - var(--capsule)) / 2)`,
              width: "var(--capsule)",
              opacity: hasActive ? 1 : 0,
            } as React.CSSProperties
          }
        />

        {DOCK_ORDER.map((id) => (
          <DockItem key={id} id={id} active={id === active} />
        ))}

      </div>

      {/* ── DE LEESSTAND: ÉÉN PIL MET VIJF KNOPPEN ─────────────────
          (Sinds 25 sep 2026 één pil met komeet; de geschiedenis
          hieronder spreekt nog van cirkels.)

          Geen kleinere balk maar een ANDER stel knoppen: drie losse
          cirkels, elk zo hoog als de balk, op de middens van vak 1, 3 en 5.
          Wie leest heeft geen navigatie nodig; hij heeft de weg
          naar huis nodig, een manier om te zoeken, en de weg terug naar
          boven.

          Zoeken stond tot nu toe alleen op de desktop (⌘K). Dit is het
          eerste zoekoppervlak dat de telefoon heeft.

          BEIDE LAGEN STAAN ALTIJD IN DE DOM, en de verborgene is
          `inert`. Dat is niet netheid maar noodzaak: de lagen wisselen
          op scrollen, en een knop die uit de boom verdwijnt terwijl hij
          focus heeft, laat een toetsenbordgebruiker nergens staan. Met
          `inert` is hij onbereikbaar én kan hij de focus niet vasthouden
          — en `onFocus` hieronder brengt de balken sowieso terug.

          Ze liggen over elkaar in dezelfde `relative` schil, zodat de
          hoogte niet verspringt als ze wisselen. Een balk die van
          hoogte verandert verplaatst alles eronder, en dat is precies
          wat het menuwiel de das om heeft gedaan.

          ── DEZELFDE MIDDENS ALS DE VAKKEN ──────────────────────────

          Eigenaar, 24 sep 2026, bij twee schermafdrukken: "Icons dont
          align on vertical axis." De cirkels stonden met
          `justify-between` tegen de randen van de pil, de vakken
          daarbinnen op een raster van vijf ná rand en padding. Het
          midden viel samen, de buitenste twee niet: op 390px stond Home
          13px links van het huisje in de balk en de pijl 13px rechts
          van Contact, en bij het wisselen sprongen de iconen opzij.

          Vijf cirkels sinds 25 sep 2026 (eigenaar: WhatsApp en Delen
          erbij): Home, Zoeken, WhatsApp, Delen, omhoog — één per
          kolom, elk precies onder zijn vak van de volle balk.

          Daarvoor rekende de leesstand met HETZELFDE raster: vijf gelijke
          kolommen (`minmax(0,1fr)`, dus een cirkel kan een kolom niet
          oprekken) binnen dezelfde inzet van rand + padding. Home,
          Zoeken en de pijl staan in kolom 1, 3 en 5 — precies onder
          Home, Projecten en Contact. Op 320px is een kolom 56,4 breed
          en de cirkel 58; de negatieve marge hieronder laat hem aan
          weerszijden evenveel uitsteken, zodat zijn midden het midden
          van de kolom blijft. Geen `justify-self: center`: of dat bij
          overloop echt centreert of naar links valt ("safe") verschilt
          per browser. Een marge rekent overal hetzelfde. */}
      <div
        data-dock-compact
        inert={!rust || undefined}
        className={cn(
          "absolute inset-x-[12px] bottom-[max(12px,calc(env(safe-area-inset-bottom)+4px))]",
          // ÉÉN pil, dezelfde als de volle balk: zelfde grond, rand,
          // schaduw, breedte en hoogte (58), met dezelfde komeet.
          // Eigenaar, 25 sep 2026: "de vijf iconen in ingeklapte modus
          // maak dat ook maar een dock met een comet, dan is het gewoon
          // overal hetzelfde." Daarvoor waren het vijf losse cirkels van
          // 58 × 58 (23 sep: "gewoon 3 cirkels …").
          //
          // `PIL` draagt rand 1 + padding 6, precies als de rij: de
          // contentbox van deze grid valt dus op die van de vakken, en
          // de vijf kolommen op de vijf vakken.
          PIL,
          "grid h-[58px] grid-cols-[repeat(5,minmax(0,1fr))] items-center",
          "transition-[opacity,transform] duration-[var(--dur-dock)] ease-[var(--ease-out-expo)]",
          "motion-reduce:transition-none",
          rust
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0"
        )}
      >
        <Komeet />
        <CompactHome />
        <CompactZoek />
        <CompactWhatsApp />
        <CompactDelen />
        <NaarBoven />
      </div>
    </nav>
  )
}

/**
 * Een knop van de leesstand: 44 × 44, zoals een vak van de volle balk,
 * gecentreerd in zijn kolom. Geen eigen glas of rand meer — die draagt
 * de pil eromheen. Een kolom is op 320px nog 56,4 breed, dus 44 past
 * overal zonder uit te steken.
 */
const CIRKEL = [
  // Kolombreed (sinds de labels, 25 sep 2026): "WHATSAPP" was op 9px
  // 47px breed en past niet in 44. De hoogte blijft 44, het tikdoel
  // wordt alleen breder.
  "flex h-[44px] w-full min-w-0 flex-col items-center justify-center gap-[2px] rounded-full",
  "transition-transform duration-[var(--dur-tap)] ease-[var(--ease-out-expo)]",
  "active:scale-90 motion-reduce:transition-none",
].join(" ")

/**
 * De cirkels wekken de balk alleen bij TOETSENBORDfocus.
 *
 * Een tik focust de knop ook, en wekken ruilt de laag: tussen mousedown
 * en click verdwijnt de cirkel onder de vinger, en de click landt op
 * niets. Zo opende het zoekvergrootglas op de telefoon nooit. Wie met
 * Tab binnenkomt, krijgt de volle balk nog steeds.
 */
function wekBijToetsenbord(e: React.FocusEvent<HTMLElement>) {
  if (e.currentTarget.matches(":focus-visible")) wekBalken()
}

/**
 * Het zichtbare label onder een icoon — en meteen de toegankelijke naam.
 *
 * Eigenaar, 25 sep 2026: "Wellicht een minimaal klein label onder het
 * icoon om aan te geven wat het doet? Kunnen we dat op een mooie
 * subtiele manier doen?" Ontwerpregel 1 zei het al.
 *
 * Montserrat, gewoon gezet zoals in de ING-app (eigenaar, 1 okt 2026:
 * "use montserrat font"; daarvoor Geist Mono 8px in hoofdletters). De maat
 * loopt met de schermbreedte van 10px op 320 naar 12px vanaf 414, in vw en
 * niet in rem: het label is chroom, en chroom groeit niet mee met 125 %
 * tekst. Regelhoogte vast 13px: icoon 24 + 2 + 13 = 39 past in het vak
 * van 44, dus de balk blijft 58.
 * Geen `aria-label` op de knop: deze tekst ÍS de naam, dus niets wordt
 * dubbel voorgelezen.
 *
 * De kleur is `--dock-label` (antraciet op Licht), op de dekkende
 * dockgrond ruim boven 4,5:1. Het actieve vak zet zijn label op muted,
 * zoals ING het actieve woord iets terugneemt; het oranje icoon zegt
 * waar je bent. Geen horizontale padding: "Projecten" is op 10px ~52
 * breed en een vak op 320px 56,4.
 */
const LABEL_KLEUR = "text-[color:var(--dock-label)]"

function DockLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      data-dock-label
      className={cn(
        "block max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[clamp(10px,2.9vw,12px)] leading-[13px] font-medium tracking-normal",
        className
      )}
    >
      {children}
    </span>
  )
}

function CompactHome() {
  const t = useT()
  // Pas als de winkel live is (WINKEL_LIVE, src/lib/data/winkel.ts) neemt
  // Winkel dit eerste vak over — zelfde maat, label en wekregel. Via
  // useFlag: de standaard is WINKEL_LIVE; alleen de geverifieerde
  // eigenaar kan hem in de DEV-laag voor zijn eigen browser omzetten.
  const winkel = useFlag("winkel")
  if (winkel) {
    return (
      <LocaleLink
        href="/winkel"
        onFocus={wekBijToetsenbord}
        className={cn(CIRKEL, "col-start-1 text-foreground")}
      >
        <ShoppingBagIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden className="size-[24px] shrink-0" />
        <DockLabel className={LABEL_KLEUR}>{t({ nl: "Winkel", en: "Shop" })}</DockLabel>
      </LocaleLink>
    )
  }
  return (
    <LocaleLink
      href={dockHref("home")}
      onFocus={wekBijToetsenbord}
      className={cn(CIRKEL, "col-start-1 text-foreground")}
    >
      <DockIcon id="home" className="size-[24px] shrink-0" />
      <DockLabel className={LABEL_KLEUR}>{t(dockLabel("home"))}</DockLabel>
    </LocaleLink>
  )
}

/**
 * Zoeken, en dit is nieuw.
 *
 * Het zoekpaneel bestond al, maar er was op de telefoon geen enkele weg
 * naartoe: de trigger zat in de desktopbalk achter ⌘K, en het wiel had
 * er geen plek voor. Een zoekfunctie die alleen met een toetsenbord te
 * openen is, bestaat voor een telefoon niet.
 */
function CompactZoek() {
  const t = useT()
  const { open } = useSearch()
  return (
    <button
      type="button"
      onFocus={wekBijToetsenbord}
      onClick={open}
      className={cn(CIRKEL, "col-start-2 text-foreground")}
    >
      <SearchIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden className="size-[24px] shrink-0" />
      <DockLabel className={LABEL_KLEUR}>{t({ en: "Search", nl: "Zoeken" })}</DockLabel>
    </button>
  )
}

/**
 * WhatsApp (eigenaar, 25 sep 2026). Het nummer komt ALLEEN uit
 * `business.ts`. Een eigen lijnicoon in de streek van de rest, geen
 * logo in merkkleur: de rij blijft één familie en één kleur.
 */
function CompactWhatsApp() {
  return (
    <a
      href={BUSINESS.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      onFocus={wekBijToetsenbord}
      className={cn(CIRKEL, "col-start-3 text-foreground")}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        width={ICON_SIZE}
        height={ICON_SIZE}
        fill="none"
        stroke="currentColor"
        strokeWidth={ICON_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-[24px] shrink-0"
      >
        {/* Een ronde ballon met het staartje linksonder, en de hoorn
            erin — de vorm van WhatsApp, getekend als lijn. */}
        {/* Op 84 % geschaald rond het midden: de ballon vulde het vak tot
            de rand en oogde groter dan de rest (eigenaar, 25 sep 2026:
            "Whatsapp icoon lijkt uit de maat"). De lijn wordt terug-
            gerekend, zodat hij even dik blijft als bij de andere iconen. */}
        <g transform="translate(1.92 1.92) scale(0.84)" strokeWidth={ICON_STROKE / 0.84}>
          <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" />
          <path d="M9 8.6c.2-.5.6-.6.9-.6h.4l.8 1.8-.6.8c.5 1 1.3 1.8 2.3 2.3l.8-.6 1.8.8v.4c0 .3-.1.7-.6.9-.7.3-1.8.2-3.3-.8a8.6 8.6 0 0 1-2.2-2.2C8.8 10.4 8.7 9.3 9 8.6z" />
        </g>
      </svg>
      <DockLabel className={LABEL_KLEUR}>WhatsApp</DockLabel>
    </a>
  )
}

/**
 * Delen. Eigenaar, 25 sep 2026: "In app view is dat namelijk niet via
 * browser aanwezig." Als geïnstalleerde app heeft de site geen
 * browserbalk en dus geen deelknop; deze cirkel is die knop.
 *
 * Het icoon is een korte pijl die uit een lijn omhoog komt, met ruimte
 * ertussen — bewust anders dan de lange pijl van terug naar boven.
 * Zonder `navigator.share` (desktop, Firefox) gaat de link naar het
 * klembord, met een korte melding in een `aria-live`-gebied.
 */
function CompactDelen() {
  const t = useT()
  const [gekopieerd, setGekopieerd] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  async function deel() {
    const url = location.href
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url })
      } catch (err) {
        if ((err as DOMException)?.name !== "AbortError") console.error(err)
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setGekopieerd(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setGekopieerd(false), 2500)
    } catch {
      // Geen klembord (onveilige context): niets te melden.
    }
  }

  return (
    <div className="relative col-start-4 flex min-w-0">
      <button
        type="button"
        onFocus={wekBijToetsenbord}
        onClick={deel}
        className={cn(CIRKEL, "text-foreground")}
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          width={ICON_SIZE}
          height={ICON_SIZE}
          fill="none"
          stroke="currentColor"
          strokeWidth={ICON_STROKE}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[24px] shrink-0"
        >
          <path d="M12 14.5V4M12 4L7.5 8.5M12 4l4.5 4.5M5 19.5h14" />
        </svg>
        <DockLabel className={LABEL_KLEUR}>{t({ en: "Share", nl: "Delen" })}</DockLabel>
      </button>
      <span
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap",
          gekopieerd &&
            "rounded-full border border-line/15 bg-surface px-[12px] py-[6px] text-[12px] leading-[16px] text-foreground shadow-[var(--shadow-dock)]"
        )}
      >
        {gekopieerd ? t({ en: "Link copied", nl: "Link gekopieerd" }) : ""}
      </span>
    </div>
  )
}

function DockItem({
  id,
  active,
}: {
  id: (typeof DOCK_ORDER)[number]
  active: boolean
}) {
  const t = useT()

  return (
    <LocaleLink
      href={dockHref(id)}
      // Een zichtbaar label, en dat is meteen de naam (eigenaar, 25 sep
      // 2026 — zie `DockLabel`). Geen `aria-label` ernaast.
      aria-current={active ? "page" : undefined}
      // Toetsenbordfocus brengt de balken terug. Zonder dit kan iemand
      // die tabt in een laag belanden die net `inert` is geworden.
      onFocus={wekBalken}
      className={cn(
        // 44px hoog: het tikdoel, en meteen de hoogte van de rij.
        "relative z-10 flex h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-[2px]",
        "rounded-full",
        // Geen hover-afhankelijkheid: dit is een aanraakoppervlak.
        // `active:` geeft de tik antwoord vóór de navigatie.
        "transition-transform duration-[var(--dur-tap)] ease-[var(--ease-out-expo)]",
        "active:scale-90 motion-reduce:transition-none",
        // De kleur springt, hij loopt niet over — zie de uitleg
        // bovenaan. `duration-0` op allebei, en alleen het actieve
        // wacht tot de pil er is. Zoals ING: zwarte iconen, het actieve
        // icoon oranje (`--ember-text`, ≥ 3:1 op de pil in elk palet).
        "transition-colors",
        active
          ? "text-[color:var(--ember-text)] delay-[var(--dur-dock)] duration-0"
          : "text-foreground delay-0 duration-0"
      )}
    >
      <DockIcon id={id} className="size-[24px] shrink-0" />
      <DockLabel className={active ? "text-foreground" : LABEL_KLEUR}>
        {t(dockLabel(id))}
      </DockLabel>
    </LocaleLink>
  )
}

/**
 * Terug naar boven, als zesde vak.
 *
 * ── EEN KNOP IN EEN NAVIGATIELANDMARK ───────────────────────────────
 *
 * Hij staat binnen de `<nav>`, en dat is een smet: een schermlezer
 * noemt hem binnen "Hoofdmenu" terwijl hij nergens heen navigeert. Het
 * concept waar deze pil vandaan komt noemt dat zelf "de prijs van één
 * balk".
 *
 * Die prijs wordt hier bewust betaald, want het alternatief kost meer.
 * De knop eruit halen betekent hem als tweede, absoluut gepositioneerd
 * element bovenop het zesde vak leggen — en dan staan er twee rasters
 * over elkaar die op vier breedtes moeten blijven kloppen. Dat is
 * precies de klasse fout waar de capsule hierboven twee keer op is
 * stukgelopen.
 *
 * Wat de smet klein houdt: hij heeft een eigen naam die precies zegt
 * wat hij doet, hij is een BUTTON en geen link, hij licht nooit groen
 * op, en hij verandert de plaats van de vijf niet — hij staat erachter.
 *
 * ── EEN ORANJE PIJL DIE KNIPPERT ────────────────────────────────────
 *
 * De pijl staat ALTIJD op ember-strong en knippert niet zelf. Dat is
 * geen smaak: een pijl die permanent kleur draagt is een
 * betekenisdragend grafisch element en moet op élk moment 3:1 halen,
 * ook halverwege een animatie. Wegfaden zakt daardoorheen en pure ember
 * haalt op licht papier maar 2,77:1 — dat is de hele reden dat
 * `--gronn-ember-strong` bestaat.
 *
 * Wat knippert is een emberhalo eróchter. Die draagt geen informatie,
 * dus hij mag pure ember zijn (ontwerpregel 3) en zijn contrast is
 * nergens dragend. Het moment is de maat van de komeet: één knippering
 * per ronde, precies als de boog hier langskomt.
 */
function NaarBoven() {
  const t = useT()
  const reduced = useReducedMotion()

  const toTop = () => {
    // Lenis bezit het scrollen op deze site; `window.scrollTo` zou
    // ernaast werken en de twee zouden om de scrollpositie vechten.
    const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
    if (lenis && !reduced) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })

    // De focus mee naar boven, anders staat een toetsenbordgebruiker na
    // de sprong nog onderaan de pagina te tabben. `preventScroll` omdat
    // de focus anders de zachte scroll meteen overschrijft.
    document.getElementById("main")?.focus({ preventScroll: true })
  }

  return (
    <button
      type="button"
      // Twee oppervlakken dragen deze naam: dit vak en de losse knop op
      // desktop. Er is er altijd precies één bereikbaar; voor een test
      // is dat onderscheid er niet, vandaar dit merkje.
      data-naar-boven="cirkel"
      onFocus={wekBalken}
      onClick={toTop}
      className={cn(
        CIRKEL,
        "col-start-5",
        // ALTIJD oranje, en via `--ember-text` — de enige van de drie
        // die in élk palet klopt.
        //
        // Dit is de enige gekleurde vorm in de rij en hij zegt iets, dus
        // hij valt onder de 3:1 van WCAG 1.4.11. Alle drie de
        // kandidaten zijn boven twee paletten en twee ondergronden
        // gemeten, en twee vielen om:
        //
        //   ember-strong  boven de grasfoto, Blauwe Uur   1,90:1  ✗
        //   pure ember    op gewone grond, Gouden Uur     2,96:1  ✗
        //   --ember-text  alle vier de gevallen           ≥ 3,3   ✓
        //
        // Het concept zet hier ember-strong neer en heeft daar gelijk,
        // want daar ligt de pijl altijd op licht papier. Deze site heeft
        // tien paletten, waarvan de helft donker, én glas dat de
        // ondergrond van de foto eronder overneemt. `--ember-text`
        // bestaat precies daarvoor: #bd3e00 op lichte grond, pure ember
        // op donkere.
        "rounded-full text-[color:var(--ember-text)]",
        "transition-transform duration-[var(--dur-tap)] ease-[var(--ease-out-expo)]",
        "active:scale-90 motion-reduce:transition-none"
      )}
    >
      {/* Dit omhulsel is er omdat de halo anders het VAK omvat in plaats
          van het icoon: een `absolute` kind meet zich aan zijn dichtste
          voorouder met een positie, en dat was de knop — bijna 60px
          breed. Hier is de voorouder het icoon zelf, en is de halo dus
          een halo. */}
      <span className="relative flex size-[24px] shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="ember-halo pointer-events-none absolute -inset-2 rounded-full border border-gronn-ember bg-gronn-ember/10"
        />
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="relative size-[24px] shrink-0"
        >
          <path d="M12 19.5V5M12 5l-6 6M12 5l6 6" />
        </svg>
      </span>
      {/* Het label is muted zoals de rest: de pijl is het ene oranje
          accent, het woord eronder hoeft dat niet te herhalen. */}
      <DockLabel className={LABEL_KLEUR}>{t({ en: "Top", nl: "Omhoog" })}</DockLabel>
    </button>
  )
}

/**
 * Wijkt het menu voor het schermtoetsenbord?
 *
 * Twee voorwaarden, en ze moeten allebei waar zijn:
 *
 *  1. Er staat focus in een invoerveld. Een kleiner venster alleen
 *     bewijst niets — de adresbalk die inklapt tijdens scrollen doet
 *     precies hetzelfde met de viewport.
 *  2. De visuele viewport is merkbaar korter dan het venster. Zonder
 *     deze tweede voorwaarde zou het menu ook wijken voor een gefocust
 *     veld op een desktop met een bluetooth-toetsenbord.
 *
 * En de regel die boven allebei staat: verberg nooit iets dat op dat
 * moment zélf de focus heeft. Het menu bevat alleen links en één knop,
 * dus als de focus in het menu zit is er geen toetsenbord en wijkt er
 * niets.
 */
function useKeyboardRetreat(): boolean {
  const [hidden, setHidden] = useState(false)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const check = () => {
      const el = document.activeElement
      const typing =
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable)

      // 140px is ruim onder elk schermtoetsenbord en ruim boven het
      // verschil dat een inklappende adresbalk maakt.
      const shrunk = window.innerHeight - vv.height > 140
      setHidden(typing && shrunk)
    }

    const schedule = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(check)
    }

    check()
    vv.addEventListener("resize", schedule)
    document.addEventListener("focusin", schedule)
    document.addEventListener("focusout", schedule)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
      vv.removeEventListener("resize", schedule)
      document.removeEventListener("focusin", schedule)
      document.removeEventListener("focusout", schedule)
    }
  }, [])

  return hidden
}

/**
 * De ruimte die de dock inneemt, gereserveerd onderaan de pagina.
 *
 * Zonder dit ligt het menu over de laatste regel van de voettekst.
 * Dezelfde rekensom als de padding hierboven, opzettelijk ernaast
 * gehouden zodat de twee samen veranderen: rij 44 + padding 2×6 =
 * 56px, plus 28 voor de onderrand van de nav.
 *
 * Ook hier px en geen rem. Zou deze ruimte meegroeien met de tekst
 * terwijl de dock dat niet doet, dan stond er bij 125% een gat van 21px
 * onder de voettekst waar niets in staat.
 */
export function DockClearance() {
  return (
    <div
      aria-hidden
      className="h-[calc(56px+28px+env(safe-area-inset-bottom))] md:hidden"
    />
  )
}
