// De route van het water in de vijverrenovatie, getekend uit de tekst en
// uit niets anders: B → pomp → driekamerfilter (met bypass) → twee
// regelbare takken → vijver A en de waterval; waterval → beekloop → B;
// A → afvoer/overloop → B. Geen maten, geen debieten: die staan niet in
// de projecttekst en worden hier dus ook niet getekend.
//
// De stroom beweegt als stippellijn (CSS `.g-stroom`), staat stil onder
// reduced motion, en de hele route staat daaronder nog eens als lijst,
// zodat hij op een smalle telefoon en voor een schermlezer leesbaar is.

const STAPPEN = [
  "Vijver B is het vertrekpunt van het opgepompte water.",
  "De pomp brengt het water naar het driekamerfilter; een bypass kan het water langs het filter leiden.",
  "Na de filtratie wordt het verdeeld over twee regelbare takken: naar vijver A en naar de waterval.",
  "De waterval loopt via de beekloop terug naar vijver B.",
  "Vijver A voert via de afvoer- en overloopverbinding terug naar vijver B.",
]

/**
 * De route rechtop, voor de telefoon: vijver B bovenaan, dan pomp, filter
 * (met bypass opzij) en de splitsing; tak 1 links naar vijver A, tak 2
 * rechts naar de waterval; de twee terugwegen lopen langs de buitenranden
 * omhoog naar B. Dezelfde inhoud als de liggende tekening, niets erbij.
 * Tekst op ware grootte bij ±300px breed: 13 en 11 in viewBox-eenheden.
 */
function StaandSchema({ id, altijd = false }: { id: string; altijd?: boolean }) {
  const leidingen = [
    // B → pomp → filter → splitsing
    "M170 90 L170 134",
    "M170 186 L170 230",
    "M170 290 L170 330",
    // splitsing → tak 1 → vijver A
    "M170 330 L85 330 L85 412",
    // splitsing → tak 2 → waterval
    "M170 330 L255 330 L255 400",
    // waterval → beekloop → rechterrand omhoog → B
    "M255 460 C 255 512, 322 512, 322 460 L322 60 L240 60",
    // A → afvoer/overloop → linkerrand omhoog → B
    "M23 440 L18 440 L18 60 L100 60",
  ]
  return (
    <svg
      viewBox="0 0 340 560"
      className={`h-auto w-full font-mono ${altijd ? "mx-auto max-w-[380px]" : "sm:hidden"}`}
      role="img"
      aria-labelledby={`${id}-st ${id}-sd`}
      data-schema="staand"
    >
      <title id={`${id}-st`}>De waterroute tussen vijver B en vijver A</title>
      <desc id={`${id}-sd`}>{STAPPEN.join(" ")}</desc>

      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {leidingen.map((d) => (
          <g key={d}>
            <path d={d} className="stroke-line" strokeWidth={6} />
            <path d={d} className="g-stroom stroke-[var(--gronn-ember)]" strokeWidth={2} />
          </g>
        ))}
        {/* bypass rond het filter, gestippeld, rechts ervan */}
        <path d="M170 210 L272 210 L272 310 L170 310" className="stroke-muted" strokeWidth={1.5} strokeDasharray="3 5" />
      </g>

      {/* Vijvers */}
      <g className="fill-surface stroke-foreground" strokeWidth={1.5}>
        <ellipse cx="170" cy="60" rx="70" ry="30" />
        <ellipse cx="85" cy="440" rx="62" ry="28" />
      </g>
      {/* Pomp, pijl omlaag */}
      <g className="stroke-foreground" strokeWidth={1.5} fill="none">
        <circle cx="170" cy="160" r="26" className="fill-background" />
        <path d="M170 146 L170 174 M160 164 L170 174 L180 164" />
      </g>
      {/* Driekamerfilter */}
      <g className="stroke-foreground" strokeWidth={1.5}>
        <rect x="115" y="230" width="110" height="60" rx="4" className="fill-background" />
        <path d="M115 250 L225 250 M115 270 L225 270" />
      </g>
      {/* Splitsing en regelkranen */}
      <circle cx="170" cy="330" r="5" className="fill-[var(--gronn-ember)]" />
      <g className="stroke-foreground" strokeWidth={1.5}>
        <path d="M77 364 L93 380 M93 364 L77 380" />
        <path d="M247 358 L263 374 M263 358 L247 374" />
      </g>
      {/* Waterval */}
      <g className="stroke-foreground" strokeWidth={1.5} fill="none">
        <path d="M225 400 L285 400 L285 460 L225 460 Z" className="fill-background" />
        <path d="M237 410 C 241 428, 235 438, 241 452 M253 410 C 257 428, 251 438, 257 452 M269 410 C 273 428, 267 438, 273 452" className="stroke-[var(--gronn-ember)]" />
      </g>

      <g className="fill-foreground text-[13px]" style={{ letterSpacing: "0.04em" }}>
        <text x="170" y="64" textAnchor="middle">VIJVER B</text>
        <text x="85" y="444" textAnchor="middle">VIJVER A</text>
        <text x="136" y="164" textAnchor="end">POMP</text>
        <text x="106" y="256" textAnchor="end">FILTER</text>
        <text x="106" y="274" textAnchor="end">3 KAMERS</text>
        <text x="218" y="435" textAnchor="end">WATERVAL</text>
      </g>
      <g className="fill-muted text-[11px]" style={{ letterSpacing: "0.04em" }}>
        <text x="224" y="202" textAnchor="middle">BYPASS</text>
        <text x="100" y="322">TAK 1</text>
        <text x="240" y="322" textAnchor="end">TAK 2</text>
        <text x="22" y="28">OVERLOOP A → B</text>
        <text x="318" y="28" textAnchor="end">BEEKLOOP → B</text>
        <text x="170" y="545" textAnchor="middle">× = REGELBARE KRAAN</text>
      </g>
    </svg>
  )
}

export function WaterrouteSchema({ id = "waterroute-schema", compact = false }: { id?: string; compact?: boolean }) {
  return (
    <figure data-element="WaterrouteSchema" className="w-full" lang="nl">
      {/* Op de telefoon een STAANDE tekening van dezelfde route. De
          liggende versie scrolde daar opzij en was verkleind onleesbaar;
          de eigenaar (23 sep 2026): "also not functions on mobile, perhaps
          scale it differently". Vanaf sm staat de liggende versie er weer. */}
      {/* Compact (voorpagina, projectkaart): altijd staand, ook op
          desktop — in een halve kolom schaalt hij daar beter dan de
          liggende (eigenaar, 23 sep 2026). Alleen de projectpagina zelf
          toont vanaf sm de liggende tekening. */}
      <StaandSchema id={id} altijd={compact} />
      {!compact && <div
        className="hidden overflow-x-auto sm:block"
        tabIndex={0}
        role="region"
        aria-label="Schema van de waterroute, horizontaal te scrollen"
      >
        <svg
          viewBox="0 0 800 380"
          className={`h-auto w-full font-mono ${compact ? "min-w-[520px]" : "min-w-[640px]"}`}
          role="img"
          aria-labelledby={`${id}-t ${id}-d`}
        >
          <title id={`${id}-t`}>De waterroute tussen vijver B en vijver A</title>
          <desc id={`${id}-d`}>{STAPPEN.join(" ")}</desc>

          {/* Leidingen: vaste lijn in de lijnkleur, stroom erover in ember */}
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {[
              // B → pomp → filter → splitsing
              "M150 290 L250 290",
              "M320 290 L400 290",
              "M520 290 L590 290",
              // splitsing → vijver A (tak 1)
              "M590 290 L590 120 L620 120",
              // splitsing → waterval (tak 2)
              "M590 290 L700 290",
              // waterval → beekloop → B
              "M730 318 C 700 352, 640 330, 580 350 S 440 342, 360 356 S 180 350, 110 322",
              // A → overloop → B
              "M680 88 L680 40 L90 40 L90 256",
            ].map((d) => (
              <g key={d}>
                <path d={d} className="stroke-line" strokeWidth={6} />
                <path d={d} className="g-stroom stroke-[var(--gronn-ember)]" strokeWidth={2} />
              </g>
            ))}
            {/* bypass rond het filter, gestippeld */}
            <path
              d="M360 290 L360 236 L560 236 L560 290"
              className="stroke-muted"
              strokeWidth={1.5}
              strokeDasharray="3 5"
            />
          </g>

          {/* Vijvers */}
          <g className="fill-surface stroke-foreground" strokeWidth={1.5}>
            <ellipse cx="100" cy="290" rx="64" ry="34" />
            <ellipse cx="690" cy="120" rx="70" ry="34" />
          </g>
          {/* Pomp */}
          <g className="stroke-foreground" strokeWidth={1.5} fill="none">
            <circle cx="285" cy="290" r="30" className="fill-background" />
            <path d="M270 290 L300 290 M290 280 L300 290 L290 300" />
          </g>
          {/* Driekamerfilter */}
          <g className="stroke-foreground" strokeWidth={1.5}>
            <rect x="400" y="262" width="120" height="56" rx="4" className="fill-background" />
            <path d="M440 262 L440 318 M480 262 L480 318" />
          </g>
          {/* Splitsing met twee regelkranen */}
          <g className="fill-[var(--gronn-ember)]">
            <circle cx="590" cy="290" r="5" />
          </g>
          <g className="stroke-foreground fill-background" strokeWidth={1.5}>
            <path d="M582 196 L598 212 M598 196 L582 212" />
            <path d="M636 282 L652 298 M652 282 L636 298" />
          </g>
          {/* Waterval */}
          <g className="stroke-foreground" strokeWidth={1.5} fill="none">
            <path d="M700 262 L760 262 L760 318 L700 318 Z" className="fill-background" />
            <path d="M712 272 C 716 290, 710 300, 716 312 M728 272 C 732 290, 726 300, 732 312 M744 272 C 748 290, 742 300, 748 312" className="stroke-[var(--gronn-ember)]" />
          </g>

          {/* Labels */}
          <g className="fill-foreground text-[13px]" style={{ letterSpacing: "0.04em" }}>
            <text x="100" y="294" textAnchor="middle">VIJVER B</text>
            <text x="690" y="124" textAnchor="middle">VIJVER A</text>
            <text x="285" y="342" textAnchor="middle">POMP</text>
            <text x="460" y="342" textAnchor="middle">FILTER · 3 KAMERS</text>
            <text x="730" y="250" textAnchor="middle">WATERVAL</text>
          </g>
          <g className="fill-muted text-[11px]" style={{ letterSpacing: "0.04em" }}>
            <text x="460" y="228" textAnchor="middle">BYPASS</text>
            <text x="606" y="190">TAK 1 · REGELBAAR</text>
            <text x="612" y="276">TAK 2</text>
            <text x="380" y="374" textAnchor="middle">BEEKLOOP → TERUG NAAR B</text>
            <text x="385" y="30" textAnchor="middle">AFVOER / OVERLOOP → TERUG NAAR B</text>
          </g>
        </svg>
      </div>}
      <figcaption className={compact ? "sr-only" : "mt-6"}>
        <p className="tekst-annotatie text-muted uppercase">
          De route, in woorden
        </p>
        <ol className="mt-3 grid gap-2 text-sm text-foreground/85 sm:grid-cols-2">
          {STAPPEN.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="font-mono text-[var(--ember-text)]">{String(i + 1).padStart(2, "0")}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}
