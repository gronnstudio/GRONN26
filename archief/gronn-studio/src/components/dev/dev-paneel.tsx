"use client"

import { useEffect, useState } from "react"

import { stuurDev, useDevLaag, zetDevLaag } from "@/lib/dev-laag"
import { FLAGS, type FlagNaam, useFlag, useFlagOverride, zetFlag } from "@/lib/flags"

/**
 * Het zwevende DEV-paneel. Rendert NIETS tenzij de laag aan staat én de
 * server de eigenaar-sessie bevestigde (`geverifieerd`). Alles hier
 * verandert alleen wat deze browser toont: geen schrijfacties, niets voor
 * bezoekers. Gewone DOM + CSS, geen extra afhankelijkheden, maten in px.
 */

// Bij het bouwen ingevuld (next.config.ts `env`); leeg buiten Vercel.
const BUILD_SHA = process.env.NEXT_PUBLIC_BUILD_SHA ?? ""
const BUILD_TIJD = (process.env.NEXT_PUBLIC_BUILD_TIJD ?? "").replace("T", " ").slice(0, 16) + (process.env.NEXT_PUBLIC_BUILD_TIJD ? " UTC" : "")

const DOEL = "a[href],button,input,select,textarea,summary,[role=button],[role=switch],[role=tab],[tabindex]:not([tabindex='-1'])"

// ---------- contrast ----------
type RGBA = [number, number, number, number]
function kleur(s: string): RGBA | null {
  const m = s.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const d = m[1].split(/[\s,/]+/).filter(Boolean).map(Number)
  return [d[0], d[1], d[2], d[3] ?? 1]
}
function lum([r, g, b]: RGBA) {
  const f = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
function meng(boven: RGBA, onder: RGBA): RGBA {
  const a = boven[3]
  return [boven[0] * a + onder[0] * (1 - a), boven[1] * a + onder[1] * (1 - a), boven[2] * a + onder[2] * (1 - a), 1]
}
function grond(el: Element | null): RGBA {
  const lagen: RGBA[] = []
  for (let e = el; e; e = e.parentElement) {
    const c = kleur(getComputedStyle(e).backgroundColor)
    if (c && c[3] > 0) {
      lagen.push(c)
      if (c[3] >= 1) break
    }
  }
  let r: RGBA = kleur(getComputedStyle(document.body).backgroundColor) ?? [255, 255, 255, 1]
  for (let i = lagen.length - 1; i >= 0; i--) r = meng(lagen[i], r)
  return r
}
function contrast(el: Element) {
  const cs = getComputedStyle(el)
  const bg = grond(el)
  const fg0 = kleur(cs.color)
  if (!fg0) return null
  const fg = meng(fg0, bg)
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x)
  return { ratio: (a + 0.05) / (b + 0.05), px: parseFloat(cs.fontSize) }
}

function Schakel({ label, aan, zet, data }: { label: string; aan: boolean; zet: (v: boolean) => void; data: string }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-[12px]">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        data-dev={data}
        checked={aan}
        onChange={(e) => zet(e.target.checked)}
        className="size-[20px] accent-[var(--ember-text)]"
      />
    </label>
  )
}

function FlagRegel({ naam }: { naam: FlagNaam }) {
  const effectief = useFlag(naam)
  const override = useFlagOverride(naam)
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-[8px]">
      <span>
        {FLAGS[naam].omschrijving} <span className="font-mono text-[11px] text-muted">({naam})</span>
      </span>
      <span className="flex items-center gap-[4px]">
        <input
          type="checkbox"
          role="switch"
          aria-label={FLAGS[naam].omschrijving}
          data-dev-flag={naam}
          checked={effectief}
          onChange={(e) => zetFlag(naam, e.target.checked)}
          className="size-[20px] accent-[var(--ember-text)]"
        />
        {override !== null && (
          <button type="button" onClick={() => zetFlag(naam, null)} className="min-h-[44px] px-[6px] font-mono text-[11px] text-muted underline">
            reset
          </button>
        )}
      </span>
    </div>
  )
}

export function DevPaneel() {
  const { geverifieerd } = useDevLaag()
  const [open, zetOpen] = useState(true)
  const [maten, zetMaten] = useState(false)
  const [raster, zetRaster] = useState(false)
  const [meet, zetMeet] = useState(false)
  const [lezing, zetLezing] = useState<string | null>(null)
  const [offline, zetOffline] = useState(false)

  // Tikdoelen omlijnen: rood < 44px, groen ≥ 44px.
  useEffect(() => {
    if (!geverifieerd || !maten) return
    const markeer = () => {
      document.querySelectorAll<HTMLElement>(DOEL).forEach((el) => {
        if (el.closest("[data-dev-paneel]")) return
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height) return
        el.dataset.devMaat = r.width >= 44 && r.height >= 44 ? "goed" : "klein"
      })
    }
    markeer()
    const t = window.setInterval(markeer, 1000)
    return () => {
      window.clearInterval(t)
      document.querySelectorAll<HTMLElement>("[data-dev-maat]").forEach((el) => delete el.dataset.devMaat)
    }
  }, [geverifieerd, maten])

  // Contrast onder de aanwijzer (of onder een tik).
  useEffect(() => {
    if (!geverifieerd || !meet) return
    const lees = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || el.closest("[data-dev-paneel]")) return
      const c = contrast(el)
      if (!c) return
      const groot = c.px >= 24
      const eis = groot ? 3 : 4.5
      zetLezing(`${c.ratio.toFixed(2)}:1 · ${Math.round(c.px)}px · ${c.ratio >= eis ? "AA" : "onder AA"} · <${el.tagName.toLowerCase()}>`)
    }
    window.addEventListener("pointermove", lees, { passive: true })
    window.addEventListener("pointerdown", lees, { passive: true })
    return () => {
      window.removeEventListener("pointermove", lees)
      window.removeEventListener("pointerdown", lees)
      zetLezing(null)
    }
  }, [geverifieerd, meet])

  if (!geverifieerd) return null

  return (
    <>
      {maten && (
        <style>{`[data-dev-maat=klein]{outline:2px solid #d0342c!important;outline-offset:-1px}[data-dev-maat=goed]{outline:2px solid #2e8b57!important;outline-offset:-1px}`}</style>
      )}
      {raster && (
        <div aria-hidden data-dev-raster className="pointer-events-none fixed inset-0 z-[70]">
          <div className="mx-auto h-full max-w-[1280px] border-x border-[#d0342c]/60 px-[24px] md:px-[64px]">
            <div className="h-full border-x border-dashed border-[#2e6bd0]/60 bg-[#2e6bd0]/[0.04]" />
          </div>
        </div>
      )}
      <aside
        data-dev-paneel
        aria-label="DEV"
        className="fixed left-[16px] z-[62] w-[280px] max-w-[calc(100vw-32px)] rounded-[16px] border border-line/15 bg-surface text-[14px] leading-[20px] text-foreground shadow-[var(--shadow-dock)] bottom-[calc(90px+env(safe-area-inset-bottom))] md:bottom-[16px]"
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => zetOpen((o) => !o)}
          className="flex min-h-[44px] w-full items-center justify-between px-[16px] font-mono text-[12px] tracking-[0.08em] uppercase"
        >
          <span>DEV</span>
          <span aria-hidden>{open ? "–" : "+"}</span>
        </button>
        {open && (
          <div className="max-h-[60vh] overflow-y-auto border-t border-line/15 px-[16px] pb-[12px]">
            <p className="mt-[12px] font-mono text-[11px] uppercase text-muted">Flags</p>
            {(Object.keys(FLAGS) as FlagNaam[]).map((n) => (
              <FlagRegel key={n} naam={n} />
            ))}
            <p className="mt-[12px] font-mono text-[11px] uppercase text-muted">Maten en contrast</p>
            <Schakel label="Tikdoelen (44px)" aan={maten} zet={zetMaten} data="maten" />
            <Schakel label="Raster 1280 · 24/64" aan={raster} zet={zetRaster} data="raster" />
            <Schakel label="Contrast onder aanwijzer" aan={meet} zet={zetMeet} data="contrast" />
            {meet && (
              <p data-dev-lezing aria-live="polite" className="font-mono text-[12px]">
                {lezing ?? "Wijs of tik een tekst aan"}
              </p>
            )}
            <p className="mt-[12px] font-mono text-[11px] uppercase text-muted">Meldingen testen</p>
            <div className="flex flex-wrap gap-[8px] pt-[4px]">
              {[
                { l: "App-melding", f: () => stuurDev({ soort: "app-melding" }) },
                {
                  l: offline ? "Weer online" : "Offline",
                  f: () => {
                    stuurDev({ soort: "offline", aan: !offline })
                    zetOffline(!offline)
                  },
                },
                { l: "Verder lezen", f: () => stuurDev({ soort: "verder-lezen" }) },
              ].map((k) => (
                <button
                  key={k.l}
                  type="button"
                  onClick={k.f}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-current/30 px-[14px] text-[13px] font-semibold hover:border-current"
                >
                  {k.l}
                </button>
              ))}
            </div>
            <p data-dev-build className="mt-[12px] flex items-center gap-[6px] font-mono text-[11px] leading-[16px] text-muted">
              <span aria-hidden>⌖</span>
              <span>{BUILD_SHA || "lokaal"}</span>
              <span aria-hidden>·</span>
              <span>{BUILD_TIJD}</span>
            </p>
            <button
              type="button"
              onClick={() => zetDevLaag(false)}
              className="mt-[8px] min-h-[44px] font-mono text-[12px] text-muted underline"
            >
              DEV-laag uit
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
