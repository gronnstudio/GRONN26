"use client"

import { motion } from "framer-motion"

import { CtaLink } from "@/components/cta-link"
import { useT } from "@/components/language-provider"
import { LocaleLink } from "@/components/locale-link"
import { SectionLabel } from "@/components/section-label"
import { EASE_REVEAL } from "@/lib/motion"
import { useReducedMotion } from "@/lib/use-reduced-motion"

// Roadmap B6 — the 404 as a lost field marker. Instead of a giant ghosted
// numeral, the page hands the visitor a survey sheet: a fragment of
// contoured terrain, a traverse walked in from the edge, and an ember
// station mark where the route stops. The message is entirely in the
// prose; the drawing is a titled image beside it, so nothing is lost with
// images or motion off.
//
// Locale note: this component is rendered by `app/not-found.tsx`, which
// Next renders inside the ROOT layout only — never inside
// `app/[locale]/layout.tsx` (nested layouts are skipped for unmatched
// URLs). `Providers` in the root layout still mounts a LanguageProvider,
// so `useT()` and `LocaleLink` work here; they simply resolve against the
// default locale. See not-found.tsx for the full note.

// One slope profile, stepped down the sheet — six contours read as terrain
// without a single decorative flourish.
const CONTOURS = [0, 24, 48, 72, 96, 120]
const contour = (dy: number) =>
  `M6 ${52 + dy} C62 ${30 + dy} 104 ${52 + dy} 158 ${36 + dy} S268 ${6 + dy} 354 ${22 + dy}`

// A traverse is a chain of straight legs between stations, which is why
// this is a polyline and not a curve. The final station is the marker.
const STATIONS: [number, number][] = [
  [26, 196],
  [92, 174],
  [150, 134],
  [204, 108],
  [250, 84],
]
const TRAVERSE = STATIONS.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ")
const [MX, MY] = STATIONS[STATIONS.length - 1]

export function LostMarker() {
  const t = useT()
  const reduced = useReducedMotion()

  // Line-work draws itself in on load; under reduced motion every path is
  // simply present, at full opacity, from the first frame.
  const draw = (delay: number, duration = 1.1) =>
    reduced
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { duration, delay, ease: EASE_REVEAL },
        }

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.6, delay, ease: EASE_REVEAL },
        }

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-20">
      <div>
        <SectionLabel index="404" className="hero-enter">
          {t({ en: "No route on this sheet", nl: "Geen route op dit blad" })}
        </SectionLabel>

        <h1
          className="hero-enter mt-8 font-heading text-3xl font-semibold leading-tight tracking-tight sm:text-5xl"
          style={{ animationDelay: "0.08s" }}
        >
          {t({
            en: "This path isn’t on the map.",
            nl: "Dit pad staat niet op de kaart.",
          })}
        </h1>

        <p
          className="hero-enter mt-6 max-w-md text-lg leading-relaxed text-foreground/75"
          style={{ animationDelay: "0.16s" }}
        >
          {t({
            en: "The link you followed points at ground that was never surveyed. Head back to known terrain and we’ll pick it up from there.",
            nl: "De link die je volgde wijst naar terrein dat nooit is ingemeten. Ga terug naar bekend terrein, dan pakken we het daar op.",
          })}
        </p>

        <div
          className="hero-enter mt-10 flex flex-wrap items-center gap-x-8 gap-y-5"
          style={{ animationDelay: "0.24s" }}
        >
          <CtaLink href="/">
            {t({ en: "Back to the landscape", nl: "Terug naar het landschap" })}
          </CtaLink>

          {/* There is no header or footer on this route, so the two most
              likely destinations are named outright rather than left to a
              back button. */}
          <p className="flex flex-wrap items-center gap-x-5 gap-y-6 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            <span>{t({ en: "Or start from", nl: "Of begin bij" })}</span>
            <LocaleLink
              href="/projects"
              className="tap-target underline-draw text-accent transition-colors hover:text-[color:var(--ember-text)]"
            >
              {t({ en: "Projects", nl: "Projecten" })}
            </LocaleLink>
            <LocaleLink
              href="/contact"
              className="tap-target underline-draw text-accent transition-colors hover:text-[color:var(--ember-text)]"
            >
              {t({ en: "Contact", nl: "Contact" })}
            </LocaleLink>
          </p>
        </div>
      </div>

      <figure className="w-full">
        <svg viewBox="0 0 360 240" role="img" className="w-full">
          <title>
            {t({
              en: "Survey sheet fragment: contour lines, a traverse walked in from the edge, and a station marker where the route ends",
              nl: "Fragment van een meetblad: hoogtelijnen, een meetlijn vanaf de rand, en een meetpunt waar de route eindigt",
            })}
          </title>

          {/* Sheet crop marks — the fragment is a cut-out of a larger
              drawing, not a framed picture. */}
          <g
            className="text-muted"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeOpacity={0.45}
            fill="none"
          >
            <path d="M6 18V6h12" />
            <path d="M342 6h12v12" />
            <path d="M6 222v12h12" />
            <path d="M342 234h12v-12" />
          </g>

          {/* Terrain: green carries the structure. */}
          <g className="text-accent" stroke="currentColor" fill="none">
            {CONTOURS.map((dy, i) => (
              <motion.path
                key={dy}
                d={contour(dy)}
                strokeWidth={1.25}
                strokeOpacity={0.5 - i * 0.05}
                {...draw(0.15 + i * 0.09)}
              />
            ))}
          </g>

          {/* The traverse walked in from the sheet edge. */}
          <g className="text-muted" stroke="currentColor" fill="none">
            <motion.path
              d={TRAVERSE}
              strokeWidth={1.25}
              strokeOpacity={0.85}
              strokeLinejoin="round"
              {...draw(0.75, 0.9)}
            />
          </g>
          <motion.g
            className="text-muted"
            stroke="currentColor"
            strokeWidth={1.25}
            fill="var(--background)"
            {...fade(1.05)}
          >
            {STATIONS.slice(0, -1).map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={2.5} />
            ))}
          </motion.g>

          {/* Station mark where the route stops — ember answers, as it does
              for every other marker on the site. */}
          <motion.g {...fade(1.35)}>
            {!reduced && (
              <motion.circle
                cx={MX}
                cy={MY}
                r={9}
                fill="none"
                stroke="var(--ember-text)"
                strokeWidth={1.25}
                animate={{ r: [9, 21], opacity: [0.5, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 1.6,
                }}
              />
            )}
            <g
              stroke="var(--ember-text)"
              strokeWidth={1.25}
              fill="none"
              strokeLinejoin="round"
            >
              {/* Triangulation station: triangle over a centre point. */}
              <path d={`M${MX} ${MY - 10}l8.5 15h-17z`} />
              {/* Crosshair, broken at the centre so the point stays clear. */}
              <path
                d={`M${MX - 20} ${MY}h9M${MX + 20} ${MY}h-9M${MX} ${MY - 20}v9M${MX} ${MY + 20}v-9`}
                strokeOpacity={0.7}
              />
            </g>
            {/* The station point itself: triangle centroid and crosshair
                intersection are the same coordinate. */}
            <circle cx={MX} cy={MY} r={1.75} fill="var(--ember-text)" />

            {/* Where the route would have continued, had it ever been
                surveyed. Static dashes: framer drives pathLength through
                stroke-dasharray, so the two cannot share a path. */}
            <path
              d={`M${MX + 8} ${MY - 6}L${MX + 52} ${MY - 22}`}
              stroke="var(--ember-text)"
              strokeWidth={1.25}
              strokeOpacity={0.45}
              strokeDasharray="2 7"
              fill="none"
            />
          </motion.g>

          {/* Field annotations. The label knocks out the contours behind it,
              the way it would on a real drawing. */}
          <motion.g
            className="font-mono"
            fontSize="9"
            style={{ letterSpacing: "0.14em" }}
            {...fade(1.5)}
          >
            <text x="18" y="24" fill="var(--muted)">
              SHEET 404
            </text>
            <rect x={MX - 50} y={MY + 21} width="100" height="14" fill="var(--background)" />
            <text x={MX} y={MY + 31} textAnchor="middle" fill="var(--ember-text)">
              {t({ en: "ROUTE ENDS", nl: "ROUTE EINDIGT" })}
            </text>
            <text x="114" y="224" fill="var(--muted)">
              25 M
            </text>
          </motion.g>

          {/* Scale bar */}
          <motion.g
            className="text-muted"
            stroke="currentColor"
            strokeWidth={1.25}
            strokeOpacity={0.6}
            fill="none"
            {...fade(1.5)}
          >
            <path d="M24 220h80M24 216v8M104 216v8" />
          </motion.g>
        </svg>

        {/* Pure notation, in the register a drawing uses in either
            language: the studio's own reference on the Dutch grid. */}
        <figcaption className="mt-5 font-mono text-[10px] uppercase leading-relaxed tracking-[0.22em] text-muted">
          50°58′07″N · 005°46′14″E · +47.8 M NAP · Stein, Limburg (NL)
        </figcaption>
      </figure>
    </div>
  )
}
