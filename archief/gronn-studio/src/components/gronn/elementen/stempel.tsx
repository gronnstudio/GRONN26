import type { CSSProperties } from "react"

// Inline en niet in globals.css: een `url()` daar gaat door de CSS-lader.
const MASKER: CSSProperties = {
  maskImage: "url(/brandmark.png)",
  maskSize: "contain",
  maskRepeat: "no-repeat",
  maskPosition: "center",
  WebkitMaskImage: "url(/brandmark.png)",
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
}

/**
 * De stempel van de oude site (`src/components/stamp.tsx`), in V5: een
 * ring "GRØNN Studio · Rooted in Nature ·" die langzaam draait, met het
 * merkteken P in het midden. Een merkteken zoals een logo, dus in beide
 * talen Engels, en `aria-hidden`: hij zegt niets wat de pagina niet al zegt.
 *
 * De P is `/brandmark.png` — het echte merkteken, met een oranje verloop.
 * De Brand Guide 2026 wil het logo in één vlakke kleur en verbiedt
 * natekenen, dus de PNG is hier alleen een MASKER (`mask-image`): zijn
 * vorm, gevuld met vlak `--ember-text` (eigenaar, 23 sep 2026: "donker
 * oranje"). #A14312 op gebroken wit 5,44:1, #E27B3C op antraciet 5,53:1.
 *
 * De ring ligt op een schijf in `--background`, zodat hij over de rand
 * van een foto kan vallen zonder dat letters of P op het beeld staan.
 * Draaien doet `.stempel-draai` (28 s per rondje, globals.css); bij
 * minder beweging — systeem of `data-motion="reduced"` — staat hij stil.
 * Alle maten in px; `className` plaatst hem (bijv. `absolute …`).
 */
export function Stempel({
  maat = 112,
  id = "stempel-ring",
  className = "",
}: {
  /** Doorsnede in px. */
  maat?: number
  /** Uniek per pagina: het pad waar de ringtekst over loopt. */
  id?: string
  className?: string
}) {
  // De P in de verhouding van de PNG (212 × 292), op ~⅓ van de schijf.
  const hoogte = Math.round(maat * 0.32)
  const breedte = Math.round((hoogte * 212) / 292)
  return (
    <div data-element="Stempel" aria-hidden data-stempel="" className={className} style={{ width: maat, height: maat }}>
      <div className="relative size-full rounded-full bg-background text-muted">
        <svg viewBox="0 0 100 100" className="stempel-draai block size-full">
          <defs>
            <path id={id} d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
          </defs>
          {/* Maat en spatiëring van de oude stempel: zo sluit de tekst de
              ring van r=40 (~251 eenheden). De slotspatie is een harde
              (U+00A0): SVG haalt een gewone spatie aan het eind weg. */}
          <text className="fill-current font-mono text-[8px] uppercase tracking-[0.35em]">
            <textPath href={`#${id}`}>{"GRØNN Studio · Rooted in Nature · "}</textPath>
          </text>
        </svg>
        <span
          data-stempel-merk=""
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--ember-text)]"
          style={{ width: breedte, height: hoogte, ...MASKER }}
        />
      </div>
    </div>
  )
}
