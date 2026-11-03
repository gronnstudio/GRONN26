"use client"

import { LocaleLink as Link } from "@/components/locale-link"
import { ServiceSubtitle } from "@/components/layout/service-subtitle"
import { useT } from "@/components/language-provider"
import type { MenuGroup } from "@/lib/nav"
import { cn } from "@/lib/utils"

// De rijen waaruit elk menu bestaat, op één plek.
//
// WAAROM DIT BESTAND ER IS. `LinkRow` en `ColLabel` stonden in
// `bar-panels.tsx` en de tabletkaart importeerde ze daaruit. Dat werkte
// zolang er twee afnemers waren. Nu tekent ook `MenuGroups` hieronder
// dezelfde rijen, en die wordt op zijn beurt dóór `bar-panels.tsx`
// gebruikt — een import terug naar dat bestand zou een cirkel zijn.
//
// Dus: de primitieven naar beneden, de samenstellers naar boven. De drie
// oppervlakken (pil, kaart, balk) verschillen in VORM en niet in inhoud,
// en dit is de laag waar dat verschil ophoudt.

/**
 * De kop boven een lijst menu-items.
 *
 * Dit was een 11px gedempte mono-annotatie — KLEINER en lichter dan de
 * items eronder, dus de hiërarchie liep achterstevoren en een bezoeker
 * kon de groepsnaam niet van zijn inhoud onderscheiden. Een kop boven een
 * lijst is een kop: Syne, 20px, een duidelijke stap boven de 16px items
 * en twee boven hun 12px noten.
 *
 * GEDEMPT, niet foreground. Een groepskop is een label, geen bestemming —
 * op volle foreground droeg hij precies het gewicht van de links eronder
 * en zei niets welke regels op een klik reageren. Grootte draagt de
 * hiërarchie; kleur draagt de affordance.
 *
 * Mono blijft voor waar het werkelijk voor is: status en veldannotaties
 * die ÉÉN ding labelen ("Nu actueel", "Uitgelicht project"), niet het
 * hoofd van een lijst.
 */
export function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-heading text-xl font-semibold tracking-tight text-muted">
      {children}
    </p>
  )
}

/** Eén aanklikbare regel in een menu. */
export function LinkRow({
  href,
  label,
  note,
  subtitle,
  trailing,
  compact,
}: {
  href: string
  label: string
  note?: string
  /**
   * Een gerenderde toelichting onder het label, waar `note` een kale
   * string neemt.
   *
   * De tabletkaart gebruikt hem voor `<ServiceSubtitle>`, die de
   * vanafprijs in de tagline vouwt in plaats van hem in een `trailing`
   * kolom te hangen. Maar zes van de elf diensten hebben een prijs, dus
   * die kolom droeg één bedrag tegen vijf blanco's — de "prijslijst
   * erachter" waar de eigenaar op een telefoon bezwaar tegen maakte, en
   * deze kaart ÍS wat een telefoon toont zodra hij gedraaid wordt.
   */
  subtitle?: React.ReactNode
  /** Een vanafprijs, of wat er verder aan het eind van de regel hoort. */
  trailing?: React.ReactNode
  /** Dichtere regels voor de tabletkaart, die veel meer tegelijk toont. */
  compact?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/item flex items-baseline gap-2.5 rounded-md",
        compact ? "py-1.5" : "py-2.5"
      )}
    >
      {/* De pijl is de affordance. Koppen en links stonden in dezelfde
          letter op bijna hetzelfde formaat, en niets zei welke regels op
          een klik zouden reageren. */}
      <span
        aria-hidden
        className="shrink-0 translate-y-[-1px] text-[color:var(--ember-text)] transition-transform duration-300 group-hover/item:translate-x-0.5"
      >
        →
      </span>
      <span className="min-w-0">
        {/* Syne, de kopletter — een menu-item ÍS een kop. In Montserrat
            medium stond hij op bijna hetzelfde gewicht als zijn eigen
            noot eronder, dus de twee lazen als één grijs blok en de
            hiërarchie was onzichtbaar. Alleen SemiBold wordt geleverd,
            dus font-semibold is de echte snede; font-bold zou hem
            synthetiseren. */}
        <span
          className={cn(
            "font-heading font-semibold tracking-tight text-foreground underline-draw transition-colors group-hover/item:text-gronn-ember",
            compact ? "text-[15px]" : "text-base"
          )}
        >
          {label}
        </span>
        {note && (
          <span className="mt-1 block text-[13px] leading-relaxed text-muted">
            {note}
          </span>
        )}
        {subtitle}
      </span>
      {trailing && <span className="ml-auto shrink-0">{trailing}</span>}
    </Link>
  )
}

/**
 * De groepen van één sectiemenu, precies zoals `menuFor()` ze oplevert.
 *
 * WAT DIT REPAREERT. De telefoon las `menuFor()`; de tabletkaart las
 * `section.children` en de balk las voor Projecten en Journaal helemaal
 * niets — die twee panelen droegen een kop, een zin en één uitgelichte
 * kaart. Dus op een telefoon stonden er zes projecten onder Projecten en
 * op een desktop geen enkel. Drie navigaties die in de pas moesten
 * blijven; ze liepen al uit de pas.
 *
 * Hier houdt dat op. Wat er IN een menu staat komt uit `menuFor()`; hoe
 * het eruitziet blijft per breedte verschillen, want dát is het verschil
 * tussen een duim en een muis.
 *
 * Een dienst draagt zijn slug mee, dus die krijgt de vanafprijs in de
 * zin; de rest krijgt zijn eigen notitie. Dat onderscheid staat één keer
 * hier in plaats van drie keer in de oppervlakken.
 */
export function MenuGroups({
  groups,
  density = "panel",
  compact,
  className,
}: {
  groups: MenuGroup[]
  /**
   * Hoe zwaar een groepskop weegt — en of zijn inleiding meekomt.
   *
   * Dit is het ENIGE verschil dat per breedte mag blijven bestaan, en het
   * is een echt verschil. Een desktoppaneel heeft een eigen kaart met
   * ruimte voor de drie niveaus naast elkaar, dus daar mag de kop 20px
   * zijn en de inleiding erbij: die inleiding is wat "Een tweede paar
   * ogen" van een raadsel in een aanbod verandert.
   *
   * Op de tabletkaart staan alle vijf de secties ónder elkaar, en hun
   * eigen koppen zijn 18px. Een groepskop van 20px is daar dus GROTER dan
   * de sectie waar hij bij hoort — de hiërarchie achterstevoren, precies
   * wat `ColLabel` hierboven op de balk kwam repareren. En drie
   * inleidingen van vijf regels in een smalle kolom maakt van die kaart
   * een pagina, op een oppervlak dat een gedraaide telefoon 360px hoog
   * bekijkt.
   *
   * Dus: `card` krijgt de mono-veldannotatie die deze kaart altijd al
   * gebruikte, en laat de inleiding weg.
   */
  density?: "panel" | "card"
  compact?: boolean
  className?: string
}) {
  const t = useT()
  if (groups.length === 0) return null
  const card = density === "card"
  return (
    <div className={className}>
      {groups.map((group, i) => (
        <div key={group.label ? t(group.label) : i} className={i > 0 ? "mt-5" : undefined}>
          {group.label &&
            (card ? (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                {t(group.label)}
              </p>
            ) : (
              <ColLabel>{t(group.label)}</ColLabel>
            ))}
          {group.intro && !card && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
              {t(group.intro)}
            </p>
          )}
          <ul className={group.label || (group.intro && !card) ? "mt-2" : undefined}>
            {group.rows.map((row) => (
              <li key={row.href}>
                <LinkRow
                  compact={compact}
                  href={row.href}
                  label={t(row.label)}
                  subtitle={
                    row.service ? (
                      <ServiceSubtitle slug={row.service} tagline={row.note} />
                    ) : undefined
                  }
                  note={!row.service && row.note ? t(row.note) : undefined}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
