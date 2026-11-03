"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useTheme } from "next-themes"
import { CheckIcon, PaletteIcon, XIcon } from "lucide-react"

import { LanguageToggle } from "@/components/language-toggle"
import { LocaleLink } from "@/components/locale-link"
import { Logo } from "@/components/logo"
import { useT } from "@/components/language-provider"
import { useThemeMode } from "@/components/theme-mode-provider"
import { ICON_SIZE, ICON_STROKE } from "@/components/layout/section-icons"
import { ToegankelijkIcoon } from "@/components/layout/header-controls"
import { Komeet } from "@/components/layout/komeet"
import { wekBalken } from "@/lib/scroll-rest"
import { useHydrated } from "@/lib/use-hydrated"
import {
  DEFAULT_SET,
  resolveAutoTheme,
  type ThemeOption,
} from "@/lib/themes"
import {
  useContrastPref,
  useMotionPref,
  useResumePref,
  useShortcutsPref,
  usePijlenPref,
  useTextScale,
  useUnderlinePref,
  type TextScale,
} from "@/lib/use-a11y-prefs"
import { cn } from "@/lib/utils"

/**
 * De twee knoppen bovenin: Weergave en Kleur.
 *
 * ── HERKOMST ────────────────────────────────────────────────────────
 *
 * Overgenomen uit V2C, het conceptproject, en met opzet 1-op-1: de
 * regelvorm, de vinkjes, de staaltjes, het schuifje, "alles
 * terugzetten", de slotalinea, en de uitleg waarom er bij een toestel
 * dat zelf om rust vraagt géén gewone schakelaar staat. Dat zijn geen
 * versieringen — elk ervan is daar een keer bevochten.
 *
 * Wat hier ANDERS is dan in V2C, en waarom:
 *
 *  - **Ze staan samen rechts, niet in twee hoeken.** V2C heeft op de
 *    telefoon geen kopbalk; deze site wel, met het GRØNN-logo
 *    linksboven. Een knop op `left-3` landt daar bovenop. Gemeten, en
 *    het logo was onleesbaar.
 *  - **Het paneel hangt aan de RAND van het scherm, niet aan zijn
 *    knop.** Twee knoppen naast elkaar betekent dat de linker zijn
 *    paneel 52px verder naar links begint; op 320px liep dat het beeld
 *    uit. Aan de rand hangen maakt die rekensom overbodig.
 *  - **Tien paletten in twee sets in plaats van twee**, en beweging met
 *    drie standen in plaats van aan/uit. Dat is wat deze site heeft.
 *
 * ── GLAS, MAAR GEMETEN ──────────────────────────────────────────────
 *
 * V2C maakt deze knoppen DEKKEND, met een goed argument: ze zweven over
 * de pagina en dus ook over een foto, en met een half doorzichtig vlak
 * is de achtergrond van het icoon wat er toevallig onder ligt — daar
 * gemeten op 4,42:1, net onder de norm, en op een andere foto weer een
 * ander getal.
 *
 * Hier staan ze tóch in glas, op verzoek van de eigenaar: dezelfde
 * vervormingsblur als de dock eronder, "zoals Instagram dat heeft". Het
 * bezwaar van V2C vervalt daarmee niet — het wordt gemeten in plaats
 * van vermeden. `tests/e2e/dock-contrast.spec.ts` decodeert een
 * schermafdruk boven het zwaarste beeld van de site en eist 3:1; zakt
 * het eronder, dan gaat de tint in `@utility nav-glass` omhoog.
 *
 * Het PANEEL is een uitzondering en giet zwaarder in: daar staat tekst,
 * en een instelling die je moet kunnen lezen is geen chroom.
 */

// ── DE SCHIL ────────────────────────────────────────────────────────

function HoekPaneel({
  label,
  titel,
  merk,
  children,
}: {
  /**
   * De NAAM van de knop. Niet zichtbaar, wel voorgelezen.
   *
   * Alleen een icoon is een keuze van de eigenaar — "enkel iconen boven
   * idem", dezelfde keuze als in de dock eronder. Die is niet gratis en
   * dat hoort hier te staan: voor een eerste bezoeker is een icoon
   * raadselachtiger dan een woord, en dat botst met ontwerpregel 1.
   *
   * Wat blijft: de knop heet nog steeds zo voor een schermlezer, en
   * zodra het paneel opengaat staat het woord er wél, als kop.
   */
  label: string
  titel: string
  merk: React.ReactNode
  children: React.ReactNode
}) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const knop = useRef<HTMLButtonElement>(null)
  const paneel = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return

    const opToets = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      // De focus terug naar de knop. Zonder dit staat een
      // toetsenbordgebruiker na het sluiten ergens bovenaan de pagina.
      knop.current?.focus()
    }

    // `pointerdown` en niet `click`: anders sluit het paneel pas nadat
    // je klik al ergens anders is aangekomen — en dan heb je met die
    // klik iets geraakt dat je niet bedoelde.
    const opAanwijzen = (e: PointerEvent) => {
      const doel = e.target as Node
      if (!paneel.current?.contains(doel) && !knop.current?.contains(doel)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", opToets)
    document.addEventListener("pointerdown", opAanwijzen)
    return () => {
      document.removeEventListener("keydown", opToets)
      document.removeEventListener("pointerdown", opAanwijzen)
    }
  }, [open])

  return (
    <>
      <button
        ref={knop}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        className={cn(
          // 44 × 44 in BEIDE richtingen, in px. Zonder het woord ernaast
          // is de breedte niet meer vanzelf groot genoeg, en dan is het
          // tikdoel stilletjes gekrompen tot de breedte van een icoon.
          "flex size-[44px] shrink-0 items-center justify-center rounded-full",
          // Zelfde glas als de dock eronder — zie `@utility nav-glass`.
          "border border-line/25 text-accent",
          "bg-surface supports-[backdrop-filter]:bg-transparent",
          "supports-[backdrop-filter]:nav-glass",
          "shadow-[var(--shadow-dock)]",
          "transition-colors duration-[var(--dur-tap)]",
          "hover:border-gronn-ember-strong active:border-gronn-ember-strong",
          open && "border-gronn-ember-strong"
        )}
      >
        {merk}
      </button>

      {open && (
        <div
          ref={paneel}
          id={id}
          data-hoek-paneel
          role="group"
          aria-label={titel}
          className={cn(
            // Aan de RECHTERRAND van de schil, niet aan de knop — zie de
            // toelichting bovenaan.
            // Onder de balk, uitgelijnd op zijn rechterrand. Aan de KNOP
            // hangen zou het paneel 52px verder naar links laten
            // beginnen en op 320px het beeld uit laten lopen.
            //
            // Bijna schermbreed (eigenaar, 25 sep 2026): 12px van beide
            // schermranden, dezelfde marge als de balk zelf. De balk is
            // hooguit 384 breed en gecentreerd; (100% − 100vw) / 2 is
            // dus hoe ver de schermrand buiten de balk ligt. Absolute en
            // niet fixed: de balk heeft een backdrop-filter en is
            // daarmee toch al het omvattende blok.
            "absolute top-[calc(100%+8px)] rounded-2xl p-2",
            "left-[calc((100%-100vw)/2+12px)] right-[calc((100%-100vw)/2+12px)]",
            // Nooit onder de dock: bovenbalk (12 + 56 + 8) en dock
            // (58 + 16 + wat lucht) eraf, in px.
            "max-h-[calc(100dvh-168px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain",
            "border border-line/25 shadow-[var(--shadow-dock)]",
            // Het paneel draagt tekst, dus DEKKEND: geen glas. Het was
            // 88 % verf met een blur eroverheen, maar het paneel hangt in
            // de bovenbalk en die heeft zelf al een backdrop-filter. Een
            // tweede filter binnen de eerste ziet alleen de balk, niet de
            // pagina — op de iPhone schemerde de tekst eronder er dus
            // gewoon doorheen (eigenaar, 23 sep 2026: "Panelen slecht
            // leesbaar op mobiel"). `hoekknoppen.spec.ts` eist alfa 1.
            "bg-surface"
          )}
        >
          <div className="flex items-center justify-between gap-2 px-2 py-1">
            <p className="min-w-0 flex-1 font-mono text-[11px] uppercase leading-tight tracking-[0.12em] text-muted">
              {titel}
            </p>
            <button
              type="button"
              aria-label={t({ en: "Close", nl: "Sluiten" })}
              onClick={() => {
                setOpen(false)
                knop.current?.focus()
              }}
              className="-mr-1 flex size-[36px] shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-gronn-ember-strong"
            >
              <XIcon size={16} strokeWidth={ICON_STROKE} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </>
  )
}

/**
 * Eén regel in een paneel.
 *
 * Twee soorten, en het verschil is niet cosmetisch:
 *
 *  - `soort="keuze"` — één uit een rijtje, zoals de tekstgroottes. Dat
 *    is een knop met `aria-pressed`, en het vinkje staat er alleen bij
 *    de gekozen regel. Dat de andere "uit" staan hoeft er niet bij: er
 *    staat er altijd precies één aan.
 *  - `soort="schakelaar"` — los aan of uit. Die krijgt `role="switch"`,
 *    en een zichtbaar schuifje dat in BEIDE standen te zien is. Een
 *    regel waar niets naast staat als hij uit staat, ziet eruit als een
 *    regel die niets doet — en dan moet je erop drukken om te ontdekken
 *    dat het een knop was.
 */
function PaneelRij({
  merk,
  naam,
  hint,
  gekozen,
  onKies,
  soort = "keuze",
}: {
  merk?: React.ReactNode
  naam: string
  hint?: string
  gekozen: boolean
  onKies: () => void
  soort?: "keuze" | "schakelaar"
}) {
  const schakelaar = soort === "schakelaar"
  return (
    <button
      type="button"
      onClick={onKies}
      role={schakelaar ? "switch" : undefined}
      aria-checked={schakelaar ? gekozen : undefined}
      aria-pressed={schakelaar ? undefined : gekozen}
      className={cn(
        "flex min-h-[44px] w-full items-center gap-3 rounded-xl px-2 py-1 text-left",
        "transition-colors hover:bg-gronn-green/10",
        gekozen && !schakelaar && "bg-gronn-green/10"
      )}
    >
      {merk}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-foreground">{naam}</span>
        {hint && (
          <span className="block truncate text-xs text-muted">{hint}</span>
        )}
      </span>
      {schakelaar ? (
        <Schuifje aan={gekozen} />
      ) : gekozen ? (
        <CheckIcon
          size={16}
          strokeWidth={ICON_STROKE}
          aria-hidden
          className="shrink-0 text-accent"
        />
      ) : null}
    </button>
  )
}

/**
 * Het schuifje.
 *
 * De uit-stand leunt op `--muted` en niet op `--line`: dit is geen
 * decoratie maar het enige dat de stand van de schakelaar draagt, en
 * WCAG 1.4.11 vraagt daar 3:1 voor. `--line` is in dit project een
 * haarlijn die overal met een doorzichtigheidsfactor wordt gebruikt en
 * haalt dat niet; `--muted` is de kleur voor bijtekst en staat in alle
 * tien de paletten onder `check-contrast.mjs`.
 */
function Schuifje({ aan }: { aan: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-[24px] w-[44px] shrink-0 items-center rounded-full border p-[2px]",
        "transition-colors duration-[var(--dur-tap)]",
        "motion-reduce:transition-none",
        aan ? "border-gronn-green bg-gronn-green" : "border-muted bg-background"
      )}
    >
      <span
        className={cn(
          "size-[16px] rounded-full",
          "transition-transform duration-[var(--dur-tap)] ease-[var(--ease-out-expo)]",
          "motion-reduce:transition-none",
          aan ? "translate-x-[20px] bg-gronn-white" : "translate-x-0 bg-muted"
        )}
      />
    </span>
  )
}

/** Een kopje boven een groep regels. */
function PaneelKop({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 px-2 pb-1 font-mono text-[11px] uppercase leading-tight tracking-[0.12em] text-muted">
      {children}
    </p>
  )
}

/**
 * Het staaltje: de grond met de accentkleur erin.
 *
 * Vaste kleuren uit `themes.ts` en niet de tokens, want een palet dat
 * niet actief is heeft hier geen waarden om uit te lezen. Die
 * verdubbeling staat daar al zo toegelicht; `tests/e2e/hoekknoppen.spec.ts`
 * legt haar tegen de echte tokenblokken, zodat ze niet kan wegdrijven.
 */
function Staal({ optie }: { optie: ThemeOption | null }) {
  return (
    <span
      aria-hidden
      data-staal={optie?.name ?? "auto"}
      className="flex size-[20px] shrink-0 items-center justify-center rounded-full border border-muted"
      style={optie ? { backgroundColor: optie.bg } : undefined}
    >
      {optie ? (
        <span
          className="size-[8px] rounded-full"
          style={{ backgroundColor: optie.dot }}
        />
      ) : (
        // Automatisch: half licht, half donker — de klok beslist.
        <span className="size-full rounded-full bg-gradient-to-br from-gronn-light to-gronn-black" />
      )}
    </span>
  )
}

// ── DE TWEE KNOPPEN ─────────────────────────────────────────────────

/**
 * De bovenbalk: het merk links, de twee instellingen rechts.
 *
 * ── HIJ SPIEGELT DE DOCK ────────────────────────────────────────────
 *
 * Zelfde vorm, zelfde glas, zelfde hoogte, zelfde maximumbreedte. Dat
 * is de hele opzet: twee balken die als een paar lezen, allebei
 * zwevend, allebei weg zodra je gaat lezen.
 *
 * ── WAT ER GEBEURT BIJ HET LEZEN ────────────────────────────────────
 *
 * Niets: hij blijft staan, even groot, net als de pil onderin die
 * tijdens het lezen alleen van inhoud wisselt (eigenaar, 23 sep 2026:
 * "de bovenste balk wil ik hetzelfde effect als de onderste balk").
 * Eerder verdween hij tijdens het lezen naar boven; daarmee waren de
 * instellingen weg tot je omhoog veegde. Nu blijven merk en instellingen
 * altijd één tik ver.
 */
export function TopBar() {
  return (
    <div
      data-nav="topbar"
      className="fixed inset-x-0 top-0 z-[62] px-[12px] pt-[max(12px,env(safe-area-inset-top))] md:hidden"
    >
      <div
        data-topbar-row
        className={cn(
          // Dezelfde vorm, hetzelfde glas en dezelfde hoogte als de dock
          // onderin: 44 hoog plus 6 padding. De twee horen als een paar
          // te lezen, en dat kan alleen als ze dezelfde maten dragen.
          // `relative`: de panelen hangen hieraan, zodat ze met de
          // rechterrand van de balk uitlijnen en niet met de schermrand.
          "relative mx-auto flex h-[56px] w-full max-w-[384px] items-center justify-between gap-2 p-[6px]",
          "rounded-full border border-line/15",
          "bg-surface/95 supports-[backdrop-filter]:bg-transparent",
          "supports-[backdrop-filter]:nav-glass",
          "shadow-[var(--shadow-dock)]"
        )}
      >
        {/* Dezelfde komeet als de dock onderin (eigenaar, 25 sep 2026:
            "dan is het gewoon overal hetzelfde"). Eén bron: `Komeet`. */}
        <Komeet />

        {/* Het merk, en tegelijk de weg naar huis. Hij staat hier en
            niet meer in `header.tsx`: die tekent op de telefoon alleen
            een zwevend logo, en twee logo's over elkaar is geen
            ontwerp. */}
        <LocaleLink
          href="/"
          aria-label="GRØNN — Home"
          data-woordmerk=""
          onFocus={wekBalken}
          className="flex h-[44px] shrink-0 items-center rounded-full pl-3 pr-2"
        >
          <Logo primair className="h-[26px] w-auto" />
        </LocaleLink>

        <div className="flex shrink-0 items-center gap-1">
          <WeergaveKnop />
          <KleurKnop />
        </div>
      </div>
    </div>
  )
}

/**
 * De weergave — linksboven in V2C, hier de eerste van de twee.
 *
 * ── WAT HIER NIET ZIT, EN WAAROM ────────────────────────────────────
 *
 * Geen voorleesknop, geen "dyslexielettertype", geen grote cursor, geen
 * schakelaar die belooft de site toegankelijk te MAKEN. Dat soort
 * overlays doet precies één ding goed: het lijkt alsof er iets gedaan
 * is. Ze repareren geen enkele onderliggende fout, ze botsen met de
 * schermlezer en de vergroting die iemand al in zijn eigen toestel
 * heeft staan, en ze leveren geen conformiteit op.
 *
 * Wat hier wel staat zijn instellingen die de site ECHT anders maken en
 * die niemands eigen hulpmiddel in de weg zitten. Het eigenlijke werk
 * zit niet in dit paneel maar in de pagina eronder.
 */
function WeergaveKnop() {
  const t = useT()
  const [schaal, zetSchaal] = useTextScale()
  const [contrast, zetContrast] = useContrastPref()
  const [beweging, zetBeweging] = useMotionPref()
  const [onderstreept, zetOnderstreept] = useUnderlinePref()
  const [sneltoetsen, zetSneltoetsen] = useShortcutsPref()
  const [pijlen, zetPijlen] = usePijlenPref()
  const [verder, zetVerder] = useResumePref()
  const toestelRustig = useToestelRustig()

  const maten: { id: TextScale; naam: string; hint: string }[] = [
    {
      id: "normal",
      naam: t({ en: "Normal", nl: "Normaal" }),
      hint: t({ en: "the standard", nl: "standaard" }),
    },
    {
      id: "large",
      naam: t({ en: "Large", nl: "Groot" }),
      hint: t({ en: "12.5% larger", nl: "12,5 % groter" }),
    },
    {
      id: "larger",
      naam: t({ en: "Larger", nl: "Groter" }),
      hint: t({ en: "25% larger", nl: "25 % groter" }),
    },
  ]

  const aangepast =
    schaal !== "normal" ||
    contrast !== "system" ||
    beweging !== "system" ||
    onderstreept ||
    !sneltoetsen ||
    pijlen ||
    verder

  const herstel = () => {
    zetSchaal("normal")
    zetContrast("system")
    zetBeweging("system")
    zetOnderstreept(false)
    zetSneltoetsen(true)
    zetPijlen(false)
    zetVerder(false)
  }

  return (
    <HoekPaneel
      label={t({
        en: "Display and accessibility",
        nl: "Weergave en toegankelijkheid",
      })}
      titel={t({
        en: "Display and accessibility",
        nl: "Weergave en toegankelijkheid",
      })}
      // Het toegankelijkheidspoppetje, zoals op de desktopbalk en op de
      // meeste sites. Eigenaar, 23 sep 2026: "Ipv T bovenin, maak het
      // poppetje van toegankelijkheid zoals op sites wordt gebruikt" —
      // een T las niet als "hier zit tekstgrootte en beweging".
      merk={<ToegankelijkIcoon size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
    >
      <PaneelKop>{t({ en: "Text size", nl: "Tekstgrootte" })}</PaneelKop>
      {maten.map((m) => (
        <PaneelRij
          key={m.id}
          naam={m.naam}
          hint={m.hint}
          gekozen={schaal === m.id}
          onKies={() => zetSchaal(m.id)}
        />
      ))}

      <PaneelKop>{t({ en: "Reading", nl: "Lezen" })}</PaneelKop>

      <PaneelRij
        soort="schakelaar"
        naam={t({ en: "Extra contrast", nl: "Extra contrast" })}
        hint={t({
          en: "stronger lines and secondary text",
          nl: "sterkere lijnen en bijtekst",
        })}
        gekozen={contrast === "more"}
        onKies={() => zetContrast(contrast === "more" ? "system" : "more")}
      />

      {toestelRustig && beweging === "system" ? (
        // GEEN gewone schakelaar hier. Het toestel vraagt al om minder
        // beweging, dus een knop "minder beweging" zou niets zichtbaars
        // doen — en een knop die niets doet is erger dan geen knop. Er
        // staat wat er aan de hand is, en daarnaast de weg terug, want
        // op deze site mag de bezoeker het toestel in BEIDE richtingen
        // overrulen (zie use-a11y-prefs.ts).
        <>
          <p className="rounded-xl bg-gronn-green/10 px-3 py-2.5 text-xs text-foreground">
            <span className="block text-sm">
              {t({
                en: "Reduced motion is on",
                nl: "Minder beweging staat aan",
              })}
            </span>
            <span className="mt-0.5 block text-muted">
              {t({
                en: "Your device asks for this itself. The site follows.",
                nl: "Je toestel vraagt hier zelf om. De site volgt dat.",
              })}
            </span>
          </p>
          <PaneelRij
            soort="schakelaar"
            naam={t({ en: "Show motion anyway", nl: "Toch beweging tonen" })}
            hint={t({
              en: "overrules your device, here only",
              nl: "overrulet je toestel, alleen hier",
            })}
            gekozen={false}
            onKies={() => zetBeweging("full")}
          />
        </>
      ) : (
        <PaneelRij
          soort="schakelaar"
          naam={t({ en: "Reduced motion", nl: "Minder beweging" })}
          hint={t({ en: "animations stand still", nl: "animaties staan stil" })}
          gekozen={beweging === "reduced"}
          onKies={() =>
            zetBeweging(beweging === "reduced" ? "system" : "reduced")
          }
        />
      )}

      <PaneelRij
        soort="schakelaar"
        naam={t({ en: "Underline links", nl: "Links onderstrepen" })}
        hint={t({
          en: "a line under every link in the text",
          nl: "een streep onder elke link in de tekst",
        })}
        gekozen={onderstreept}
        onKies={() => zetOnderstreept(!onderstreept)}
      />

      {/* WCAG 2.1.4: een sneltoets van één teken moet uit te zetten
          zijn. Dit is die uitweg, en daarom staat hij hier en niet
          alleen in een documentje. */}
      <PaneelRij
        soort="schakelaar"
        naam={t({ en: "Single-key shortcuts", nl: "Sneltoetsen" })}
        hint={t({
          en: "/ for search, ? for the list",
          nl: "/ voor zoeken, ? voor de lijst",
        })}
        gekozen={sneltoetsen}
        onKies={() => zetSneltoetsen(!sneltoetsen)}
      />

      {/* Twee gemakken, allebei standaard uit (eigenaar, 25 sep 2026).
          Het gedrag staat in de elementen RandPijlen en VerderLezen. */}
      <PaneelKop>{t({ en: "Getting around", nl: "Navigeren" })}</PaneelKop>
      <PaneelRij
        soort="schakelaar"
        naam={t({ en: "Arrows for back and forward", nl: "Pijlen voor terug en verder" })}
        hint={t({
          en: "halfway down the screen edge",
          nl: "halverwege de schermrand",
        })}
        gekozen={pijlen}
        onKies={() => zetPijlen(!pijlen)}
      />
      <PaneelRij
        soort="schakelaar"
        naam={t({ en: "Continue where you left off", nl: "Verder lezen waar je was" })}
        hint={t({
          en: "remembers the chapter, on this device only",
          nl: "onthoudt het hoofdstuk, alleen op dit toestel",
        })}
        gekozen={verder}
        onKies={() => zetVerder(!verder)}
      />

      {aangepast && (
        <button
          type="button"
          onClick={herstel}
          className="mt-2 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-line/25 px-3 text-sm text-foreground transition-colors hover:border-gronn-ember-strong hover:text-gronn-ember-strong"
        >
          {t({ en: "Reset everything", nl: "Alles terugzetten" })}
        </button>
      )}

      <p className="mt-3 border-t border-line/15 px-2 pt-3 text-xs leading-relaxed text-muted">
        {t({
          en: "This site is built to work with your own settings too: zoom, a screen reader, or the keyboard alone. If something does not work, we would like to hear it.",
          nl: "Deze site is gebouwd om ook te werken met je eigen instellingen: zoomen, een schermlezer, of alleen het toetsenbord. Lukt er iets niet, dan horen we dat graag.",
        })}
      </p>
    </HoekPaneel>
  )
}

/**
 * De kleur.
 *
 * ── WAT "AUTOMATISCH" BETEKENT ──────────────────────────────────────
 *
 * Dat de site de klok van de bezoeker volgt: Gouden Uur overdag, Blauwe
 * Uur na zevenen. Dat is de stand zonder keuze, en het is er ook een
 * die je terug kunt kiezen. Zonder die weg terug is een palet dat je
 * één keer aantikte een beslissing voor altijd.
 *
 * ── DE VALKUIL DIE DIT SOORT SCHAKELAARS SLOOPT ─────────────────────
 *
 * De keuze moet op `<html>` staan vóórdat er iets geverfd wordt, anders
 * ziet een bezoeker bij élke paginalading eerst een flits van het
 * verkeerde palet. Dat gebeurt in het pre-paint-script in `layout.tsx`.
 * Deze component leest de keuze daarna alleen nog terug om de vinkjes
 * goed te zetten — hij mag hem NIET opnieuw toepassen.
 */
function KleurKnop() {
  const t = useT()
  const { theme } = useTheme()
  const { mode, enableAuto, chooseTheme } = useThemeMode()
  const mounted = useHydrated()

  const auto = mode === "auto"
  // Op auto beslist de klok; anders is het wat er is toegepast.
  const actief = auto ? resolveAutoTheme() : theme

  return (
    <HoekPaneel
      label={t({ en: "Colour and language", nl: "Kleur en taal" })}
      titel={t({ en: "Colour and language", nl: "Kleur en taal" })}
      // Het palet-icoon en niet het staaltje van het actieve thema. Een
      // staaltje verandert van kleur, en een knop die er op elke pagina
      // anders uitziet is geen knop die je herkent. Het icoon zegt
      // bovendien wat er achter zit; de kleur zegt alleen wat er nu aan
      // staat, en dat zie je al aan de hele pagina.
      merk={<PaletteIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden />}
    >
      <PaneelKop>{t({ en: "Light and dark", nl: "Licht en donker" })}</PaneelKop>

      <PaneelRij
        merk={<Staal optie={null} />}
        naam={t({ en: "Automatic", nl: "Automatisch" })}
        hint={t({ en: "follows the clock", nl: "volgt de klok" })}
        gekozen={mounted && auto}
        onKies={enableAuto}
      />
      {DEFAULT_SET.options.map((optie) => (
        <PaneelRij
          key={optie.name}
          merk={<Staal optie={optie} />}
          naam={t(optie.label)}
          gekozen={mounted && !auto && actief === optie.name}
          onKies={() => chooseTheme(optie.name)}
        />
      ))}


      {/* De taal is geen voorkeur maar een ROUTE: hij navigeert naar
          dezelfde pagina in de andere taal. Daarom geen regel met een
          vinkje maar de bestaande schakelaar, die dat pad al uitrekent
          en de `UNLOCALIZED`-uitzonderingen kent. Met vlaggen, dezelfde
          ronde als op desktop (eigenaar, 23 sep 2026: "op mobiel twee
          vlaggen als op desktop met een toggle"). */}
      <PaneelKop>{t({ en: "Language", nl: "Taal" })}</PaneelKop>
      <div className="px-[8px] pb-[4px] pt-[4px]">
        <LanguageToggle flags />
      </div>
    </HoekPaneel>
  )
}

/**
 * Vraagt het TOESTEL zelf om minder beweging?
 *
 * Los van de knop hierboven, en dat is het punt: je moet kunnen
 * uitleggen waarom de beweging al beperkt is voordat iemand iets heeft
 * aangeraakt. `useReducedMotion()` uit `use-reduced-motion.ts`
 * beantwoordt een andere vraag — die telt de keuze van de bezoeker mee.
 */
function useToestelRustig(): boolean {
  const [rustig, setRustig] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const lees = () => setRustig(mq.matches)
    lees()
    mq.addEventListener("change", lees)
    return () => mq.removeEventListener("change", lees)
  }, [])

  return rustig
}
