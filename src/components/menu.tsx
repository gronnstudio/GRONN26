"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Komeet } from "./komeet"
import { Weergave } from "./weergave"
import { T } from "./taal"
import { useTaal } from "./taal-klant"

// Het menu (eigenaar, 10 okt 2026, als schets):
//   bovenaan en bij omhoog scrollen: midden onderaan een donkere pil met vijf
//   ronde iconen, Vijvers, Tuinen, Projecten, Over en FAQ, zonder woorden (het
//   woord blijft voor schermlezers en als tooltip); op de telefoon even breed
//   als de rij hieronder, vanaf 1024px met het woordmerk voorop;
//   ⭕   ⭕⭕⭕⭕⭕   ⭕  bij omlaag scrollen: de pil krimpt (op de telefoon) en
//   links Weergave en rechts Omhoog verschijnen, rond en oranje.
// De pil is bijna dicht antraciet, op elke grond even donker; de huidige
// pagina is een licht rondje. De iconen bewegen om de beurt even (golf,
// groei, spit, knik, plop; globals.css). Linksonder staat vanaf 1024px Kennismaken ↗.
const MENU = [
  { href: "/vijvers", label: { nl: "Vijvers", en: "Ponds" }, beweging: "golf", icoon: "M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" },
  { href: "/tuinen", label: { nl: "Tuinen", en: "Gardens" }, beweging: "groei", icoon: "M11 20V9M11 13c-4 0-6-2-6-6 4 0 6 2 6 6zM11 10c0-4 2-6 6-6 0 4-2 6-6 6z" },
  { href: "/werk", label: { nl: "Projecten", en: "Projects" }, beweging: "spit", icoon: "M8 2.5h6M11 2.5v9M7 11.5h8v4a4 4 0 0 1-8 0z" },
  { href: "/over", label: { nl: "Over", en: "About" }, beweging: "knik", icoon: "M11 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM4 19c1-4 4-5.5 7-5.5s6 1.5 7 5.5" },
  { href: "/faq", label: { nl: "FAQ", en: "FAQ" }, beweging: "plop", icoon: "M5 4h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3.5V16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9.2 8.4a1.8 1.8 0 1 1 2.6 1.6c-.5.2-.8.6-.8 1.1v.3M11 13.2v.1" },
]

const RUST = "text-gebroken-wit hover:bg-gebroken-wit hover:text-antraciet aria-[current=page]:bg-gebroken-wit aria-[current=page]:text-antraciet"

export function Menu() {
  const pad = usePathname()
  const taal = useTaal()
  // boven = de pil staat er: bovenaan de pagina, en zodra je een stukje
  // omhoog scrollt (zoals Instagram; eigenaar, 10 okt 2026)
  const [boven, setBoven] = useState(true)

  useEffect(() => {
    let vorige = 0
    const meet = () => {
      const y = scrollY
      if (y < 48) setBoven(true)
      else if (y - vorige > 6) setBoven(false)
      else if (vorige - y > 6) setBoven(true)
      else return
      vorige = y
    }
    const t = setTimeout(meet, 0) // ook als de pagina al gescrold opent
    addEventListener("scroll", meet, { passive: true })
    return () => { clearTimeout(t); removeEventListener("scroll", meet) }
  }, [pad])

  const stil = () => document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches
  // wat bij de stand hoort is zichtbaar; de rest krimpt weg en is onbereikbaar
  const toon = (aan: boolean) => `transition-[opacity,scale] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${
    aan ? "scale-100 opacity-100" : "pointer-events-none scale-0 opacity-0"
  }`
  const rond = "grid size-[var(--knop)] cursor-pointer place-items-center rounded-full bg-oranje text-antraciet shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] focus-visible:outline-2 focus-visible:outline-offset-2"

  return (
    <>
      <nav aria-label={taal === "en" ? "Main menu" : "Hoofdmenu"} data-menu className={`fixed bottom-5 z-[101] transition-[left,right] duration-500 ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none lg:right-auto lg:left-1/2 lg:bottom-10 lg:-translate-x-1/2 ${
        boven ? "inset-x-[var(--goot)]" : "inset-x-[calc(50%-110px)]"
      }`}>
        <ul className="relative m-0 flex list-none items-center justify-between gap-[3px] rounded-full bg-[rgba(38,38,37,.6)] p-[4px] shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] ring-1 ring-gebroken-wit/15 backdrop-blur-xl backdrop-saturate-150">
          <Komeet as="li" />
          <li className="hidden lg:flex">
            {/* het woordmerk, altijd het primaire logo, zonder vlak (eigenaar, 5 okt 2026); op de telefoon staat hij linksboven (kop.tsx) */}
            <Link href="/" aria-label={taal === "en" ? "GRØNN Studio, to the home page" : "GRØNN Studio, naar de voorpagina"} className="flex h-10 items-center rounded-full px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/woordmerk-primair.svg" alt="" className="h-[13px] w-auto" />
            </Link>
          </li>
          {MENU.map((m) => {
            const actief = pad === m.href || pad.startsWith(m.href + "/")
            return (
              <li key={m.href} className="flex justify-center max-lg:flex-1">
                <Link href={m.href} title={m.label[taal]} aria-current={actief ? "page" : undefined} data-beweging={m.beweging} className={`menu-icoon grid size-10 place-items-center rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gebroken-wit ${RUST}`}>
                  <svg viewBox="0 0 22 22" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d={m.icoon} />
                  </svg>
                  <span className="sr-only"><T t={m.label} /></span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div data-menu inert={boven} className={`fixed right-[var(--goot)] bottom-5 z-[101] lg:right-[var(--rand)] lg:bottom-10 ${toon(!boven)}`}>
        <button
          type="button"
          onClick={() => scrollTo({ top: 0, behavior: stil() ? "auto" : "smooth" })}
          aria-label={taal === "en" ? "Back to top" : "Terug naar boven"}
          className={rond}
        >
          <svg aria-hidden viewBox="0 0 40 40" className="ring-voortgang"><circle cx="20" cy="20" r="19" pathLength="1" /></svg>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
            <path d="M8 14.5v-12M2.5 8 8 2.5 13.5 8" fill="none" stroke="currentColor" strokeWidth="1.9" />
          </svg>
        </button>
      </div>

      {/* links: Kennismaken (vanaf 1024px) en, tijdens het lezen, Weergave */}
      <div data-menu className="pointer-events-none fixed bottom-5 left-[var(--goot)] z-[101] flex items-center gap-2 lg:bottom-10 lg:left-[var(--rand)] [&>*]:pointer-events-auto">
        <Link
          href="/kennismaken"
          className="group knop gap-9 bg-oranje text-antraciet max-lg:hidden shadow-[0_10px_40px_-12px_rgba(0,0,0,.45)] focus-visible:outline-2 focus-visible:outline-offset-3"
        >
          <span className="block h-4 overflow-hidden leading-4">
            <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
            <span aria-hidden className="block transition-transform duration-[450ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-full group-focus-visible:-translate-y-full"><T t={{ nl: "Kennismaken", en: "Get in touch" }} /></span>
          </span>
          <svg viewBox="0 0 11 14" width="11" height="14" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
            <path d="M0 12.0593L7.504 4.60687L1.00002 4.51248V2.5H11V12.5624H9L8.93581 6.04761L1.4318 13.5L0 12.0593Z" fill="currentColor" />
          </svg>
        </Link>
        <div inert={boven} className={toon(!boven)}>
          <Weergave knopKlasse={rond} />
        </div>
      </div>
    </>
  )
}
