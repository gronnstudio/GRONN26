"use client"


import { LocaleLink as Link } from "@/components/locale-link"
import { Photo } from "@/components/photo"
import { useT } from "@/components/language-provider"
import { priceHint } from "@/lib/data/pricing"
import { inSeasonNow } from "@/lib/data/seasons"
import type { Service } from "@/lib/data/services"
import { priceLabel } from "@/lib/format"
import type { MenuGroup, MenuRow } from "@/lib/nav"
import { serviceImage } from "@/lib/placeholder"

// The services panel. Eleven services in two families used to sit behind
// one word in the bar; this puts both families, their one-line reason for
// existing, and what they cost on screen without a click.
//
// Shaped as a floating card hanging from the bar rather than a full-bleed
// strip (owner reference: GitHub's platform menu). The card reads as an
// object you opened; a strip reads as part of the page. Its leading mark
// is the service's own survey index rather than an icon — the brand's
// line-work language already has a mark for this, and eleven bespoke
// icons is the "clipart" CLAUDE.md rejected.
//
// It is a DISCLOSURE, not a dialog: no focus trap, Tab walks through the
// panel and then out of the bar (closing it on the way), Escape closes and
// hands focus back to the trigger. Hover opens it on a mouse, but hover is
// never the only way in — the trigger is a real button.


function PriceHint({ slug }: { slug: string }) {
  const t = useT()
  const hint = priceHint(slug)
  if (!hint) return null
  return (
    <span className="shrink-0 font-mono text-[13px] tabular-nums text-muted transition-colors group-hover/item:text-[color:var(--ember-text)]">
      {hint.monthly
        ? `${priceLabel(hint.from)}${t({ en: "/mo", nl: "/mnd" })}`
        : `${t({ en: "from", nl: "vanaf" })} ${priceLabel(hint.from)}`}
    </span>
  )
}

function ServiceItem({ row }: { row: MenuRow }) {
  const t = useT()
  return (
    <Link
      href={row.href}
      className="group/item flex gap-3.5 rounded-md py-2.5"
    >
      {/* The ember arrow, same as every other link row in the menus. It
          replaced the survey index here at the owner's direction: the
          index says WHICH service, which the title already says, while
          the arrow says the row responds to a click — which nothing else
          in the row does. The index still leads each service on its own
          page and in the services list, where it is a reference rather
          than an affordance.

          The seven principles in the Studio panel keep their numbers on
          purpose: they are not links, and an arrow there would promise a
          click that does not exist. */}
      <span
        aria-hidden
        className="mt-[3px] shrink-0 text-gronn-ember transition-transform duration-300 group-hover/item:translate-x-0.5"
      >
        →
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-4">
          <span className="font-heading text-[15px] font-semibold tracking-tight text-foreground underline-draw transition-colors group-hover/item:text-gronn-ember">
            {t(row.label)}
          </span>
          {row.service && <PriceHint slug={row.service} />}
        </span>
        {row.note && (
          <span className="mt-1 block text-[13px] leading-relaxed text-muted">
            {t(row.note)}
          </span>
        )}
      </span>
    </Link>
  )
}

export function ServicesPanel({
  groups,
  services,
}: {
  /** De drie niveaus, uit `menuFor("services")` — dezelfde bron als de
   *  telefoonpil en de tabletkaart. */
  groups: MenuGroup[]
  /** Nog wel nodig voor de uitgelichte kaart: `inSeasonNow` leest de
   *  seizoensvensters van de dienst, niet een menuregel. */
  services: Service[]
}) {
  const t = useT()
  // Which service leads the panel, on the visitor's own clock — the same
  // choice the theme system makes. Safe to read `Date` during render
  // because the panel only ever mounts after someone opens it, long past
  // hydration.
  //
  // This used to be a hand-written month map, and it was wrong in the way
  // hand-written month maps go wrong: through August it pointed at the
  // subscription while the leaf-net season was days from opening. It now
  // reads the same windows the owner's dashboard does, so the card and
  // the panel can never disagree about what time of year it is.
  const featured = inSeasonNow(new Date(), services) ?? services[0]

  return (
    /* Vier sporen, niet drie.
    
       Dit grid was `[1fr_1fr_0.85fr]`: twee families plus de uitgelichte
       kaart. Er zijn nu DRIE instapniveaus, dus met hetzelfde grid viel
       het derde niveau op een tweede rij onder de kaart — de ladder
       (ontwerp → aanleg → onderhoud) las dan niet meer als een ladder.
    
       De drie niveaus krijgen gelijke sporen omdat je ze naast elkaar
       hoort te kunnen leggen; dat is waar ze voor zijn. De kaart houdt
       haar eigen smallere rail rechts, achter de scheidingslijn. De
       tussenruimte gaat van 12 naar 8 om de breedte terug te kopen die
       het vierde spoor kost. */
    <div className="grid gap-x-10 gap-y-8 p-7 sm:p-9 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_0.85fr] lg:gap-x-8">
      {groups.map((group, gi) => {
        if (group.rows.length === 0) return null
        return (
          <div key={group.label ? t(group.label) : gi}>
            {/* A family name heads a list, so it takes the heading face
                and a size above its items — see ColLabel in bar-panels
                for the full reasoning. */}
            {group.label && (
              <p className="font-heading text-xl font-semibold tracking-tight text-muted">
                {t(group.label)}
              </p>
            )}
            {group.intro && (
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                {t(group.intro)}
              </p>
            )}
            <ul className="mt-5 -ml-1">
              {group.rows.map((row) => (
                <li key={row.href}>
                  <ServiceItem row={row} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {featured && (
        <div className="md:col-span-2 md:border-t md:border-line/10 md:pt-8 lg:col-span-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          {/* Syne Bold zoals de andere kolomkoppen (ColLabel), maar in de
              oranje teksttint: dit is het ene accent van het paneel.
              Eigenaar, 23 sep 2026: de mono-kapitalen zagen er "gek" uit
              naast de Syne-koppen. */}
          <p className="font-heading text-xl font-bold tracking-tight text-[color:var(--ember-text)]">
            {t({ en: "In season now", nl: "Nu actueel" })}
          </p>
          <Link
            href={`/services/${featured.slug}`}
            className="group/feat mt-4 flex items-start overflow-hidden rounded-lg border border-line/10 transition-colors hover:border-gronn-ember/50 lg:block"
          >
            <div className="relative aspect-square w-32 shrink-0 overflow-hidden sm:w-40 lg:aspect-[16/10] lg:w-full">
              <Photo
                src={serviceImage(featured)}
                alt=""
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover"
              />
              <div aria-hidden className="photo-glass absolute inset-0" />
            </div>
            <div className="p-4">
              <p className="font-heading text-base font-semibold leading-snug transition-colors group-hover/feat:text-gronn-ember">
                {t(featured.title)}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
                {t(featured.summary)}
              </p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
