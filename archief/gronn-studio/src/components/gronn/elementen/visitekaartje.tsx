"use client"

import { useId, useState } from "react"

import { BUSINESS } from "@/lib/business"
import { pick, type Locale } from "@/lib/i18n"
import { useReducedMotion } from "@/lib/use-reduced-motion"

import { Logo } from "./logo"

// Naam en rol zoals de site ze al zegt (schema.ts `nickSchema`, Over
// mij) — business.ts kent alleen de onderneming.
const NAAM = `${BUSINESS.owner.given} ${BUSINESS.owner.family}`
const ROL = { nl: "Hovenier en ecologisch ontwerper", en: "Gardener and ecological designer" }
const WEB = "gronn.studio"

/**
 * Het visitekaartje: creditcardmaat (85,6 × 54), tik of Enter/Spatie
 * draait het om naar de QR die de vCard opslaat. Onder verminderde
 * beweging wisselen de zijden zonder rotatie. `qr` is de SVG-string uit
 * `src/lib/qr.ts`, gebouwd op de server.
 */
export function Visitekaartje({ locale, qr, qrData }: { locale: Locale; qr: string; qrData: string }) {
  const [om, setOm] = useState(false)
  const rustig = useReducedMotion()
  const voorId = useId()
  const achterId = useId()
  const t = (v: { nl: string; en: string }) => pick(v, locale)

  const vlak = "absolute inset-0 overflow-hidden rounded-[16px] [backface-visibility:hidden]"
  const toonVoor = !om
  return (
    <button data-element="Visitekaartje"
      type="button"
      onClick={() => setOm((v) => !v)}
      aria-pressed={om}
      aria-label={t({ nl: "Draai het kaartje om", en: "Turn the card over" })}
      aria-describedby={om ? achterId : voorId}
      data-visitekaartje
      data-kant={om ? "achter" : "voor"}
      className="block w-full max-w-[360px] cursor-pointer rounded-[16px] text-left [perspective:1200px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gronn-ember)]"
    >
      <div
        data-kaart-binnen
        className={`relative aspect-[85.6/54] w-full [transform-style:preserve-3d] ${
          rustig ? "" : "transition-transform duration-[600ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
        }`}
        style={rustig ? undefined : { transform: om ? "rotateY(180deg)" : "none" }}
      >
        {/* Voorkant: echte tekst. */}
        <div
          id={voorId}
          data-zijde="voor"
          aria-hidden={!toonVoor}
          className={`${vlak} flex flex-col justify-between border border-[#202020]/15 bg-gronn-white p-[20px] text-gronn-black dark:border-white/15 dark:bg-gronn-black dark:text-gronn-white ${
            rustig && !toonVoor ? "invisible" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-[12px]">
            <Logo hoogte={18} alt="GRØNN Studio" />
            <span aria-hidden className="mt-[6px] block size-[6px] rounded-full bg-[var(--gronn-ember)]" />
          </div>
          <div>
            <p className="text-[17px] font-semibold leading-tight">{NAAM}</p>
            <p className="mt-[2px] text-[13px] opacity-80">{t(ROL)}</p>
            <div aria-hidden className="my-[10px] h-px w-full bg-current opacity-20" />
            <p className="font-mono text-[11.5px] leading-[1.6] tracking-[0.02em]">
              <span className="block">{BUSINESS.phone}</span>
              <span className="block">{BUSINESS.email}</span>
              <span className="block">{WEB}</span>
            </p>
          </div>
        </div>

        {/* Achterkant: de QR, altijd licht (scanners willen een lichte stille zone). */}
        <div
          id={achterId}
          data-zijde="achter"
          aria-hidden={toonVoor}
          className={`${vlak} flex items-center justify-center gap-[16px] border border-[#202020]/15 bg-gronn-white p-[16px] text-gronn-black ${
            rustig ? (toonVoor ? "invisible" : "") : "[transform:rotateY(180deg)]"
          }`}
        >
          <div
            role="img"
            aria-label={t({ nl: "QR-code: scan om Nick op te slaan in je contacten", en: "QR code: scan to save Nick to your contacts" })}
            data-qr={qrData}
            className="aspect-square h-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qr }}
          />
          <p className="max-w-[10ch] font-mono text-[11.5px] uppercase leading-[1.5] tracking-[0.06em]">
            {t({ nl: "Scan om me op te slaan", en: "Scan to save me" })}
          </p>
        </div>
      </div>
    </button>
  )
}
