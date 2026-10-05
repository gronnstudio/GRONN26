"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { Logo } from "@/components/logo"
import { OPENINGSZIN, zinVoor } from "./zinnen"
import "./overgang.css"

// WF-055: de opening van bartoszkolenda.com (LayoutIntro) als intro van de
// site, en hun paginawissel (LayoutTransition): de blokken schuiven als een
// trap omhoog over de pagina met de zin, de pagina wisselt, en de laag
// schuift weg naar boven terwijl de nieuwe pagina opkomt. Tijden en easings
// letterlijk uit public/wireframes/opening-kolenda.html.
//
// Uitwegen: geen JS, prefers-reduced-motion of html.stil = geen doek. De
// navigatie hangt nooit aan de animatie: elke stap heeft een vangnet.

const MAX_WACHTEN = 6000 // ms op de nieuwe route; daarna onthullen we toch
const MAX_TOTAAL = 10000 // ms voor een hele wissel; daarna gaat het doek weg

const stil = () =>
  document.documentElement.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches

const normaal = (pad: string) => (pad.length > 1 ? pad.replace(/\/+$/, "") : pad)

/** Het interne doel van een klik, of null als de browser het zelf moet doen. */
function doelVan(e: MouseEvent): URL | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null
  const a = (e.target as Element | null)?.closest?.("a")
  if (!a || !a.hasAttribute("href") || a.hasAttribute("download")) return null
  const target = a.getAttribute("target")
  if (target && target !== "_self") return null
  let url: URL
  try {
    url = new URL(a.href, location.href)
  } catch {
    return null
  }
  if (url.origin !== location.origin) return null // ook mailto:, tel:
  if (url.pathname.startsWith("/wireframes") || url.pathname.startsWith("/api")) return null
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return null // bestanden (pdf, svg, …)
  if (normaal(url.pathname) === normaal(location.pathname) && url.search === location.search) return null // zelfde pagina, ook #anker
  return url
}

export function Overgang() {
  const router = useRouter()
  const pad = usePathname()
  const doek = useRef<HTMLDivElement>(null)
  const zin = useRef<HTMLParagraphElement>(null)
  const aankomst = useRef<(() => void) | null>(null)
  const routerRef = useRef(router)

  useEffect(() => {
    routerRef.current = router
  }, [router])

  // De nieuwe route is er: laat de wachtende wissel verder gaan.
  useEffect(() => {
    aankomst.current?.()
  }, [pad])

  useEffect(() => {
    const el = doek.current
    const p = zin.current
    if (!el || !p) return
    gsap.registerPlugin(SplitText)
    const $ = (q: string) => el.querySelector(q) as HTMLElement
    const html = document.documentElement
    const main = () => document.querySelector("main")

    let split: SplitText | null = null
    let bezig = false
    const tijdlijnen: gsap.core.Animation[] = []
    const timers: number[] = []
    const opruimen = () => {
      tijdlijnen.splice(0).forEach((t) => t.kill())
      timers.splice(0).forEach((t) => clearTimeout(t))
    }

    /** Zet de zin en snijd hem in regels met een masker (CommonAnimateText). */
    const zetZin = (tekst: string) => {
      split?.revert()
      p.innerHTML = tekst
      split = SplitText.create(p, { type: "lines", mask: "lines" })
      gsap.set(split.lines, { y: "75%", opacity: 0 })
      return split.lines
    }

    /** De pagina komt op (bij 75 % van het wegschuiven, zoals de hero op kolenda). */
    const paginaOp = () => {
      const m = main()
      if (m) gsap.fromTo(m, { opacity: 0, y: 40 }, { opacity: 1, y: 0, clearProps: "opacity,transform" })
    }

    /** Alles terug naar rust, wat er ook gebeurd is. */
    const rust = () => {
      opruimen()
      split?.revert()
      split = null
      p.innerHTML = ""
      gsap.set([$(".og-blokken"), ...el.querySelectorAll(".og-blokken span")], { clearProps: "transform,visibility" })
      gsap.set([$(".og-grond"), $(".og-merk"), $(".og-laad"), $(".og-verloop")], { clearProps: "all" })
      const m = main()
      if (m) gsap.set(m, { clearProps: "opacity,transform" })
      el.removeAttribute("data-actief")
      html.classList.remove("intro", "intro-los")
      bezig = false
    }

    // ── Intro: één keer per bezoek (html.intro komt van INTRO_VOORVERF) ──
    if (html.classList.contains("intro")) {
      const w = window as unknown as { __gronnIntro?: number }
      clearTimeout(w.__gronnIntro)
      if (stil()) {
        html.classList.remove("intro")
      } else {
        try {
          bezig = true
          timers.push(window.setTimeout(rust, MAX_TOTAAL))
          if (!location.hash) scrollTo(0, 0)
          const regels = zetZin(OPENINGSZIN)
          tijdlijnen.push(gsap.to(regels, { y: "0%", opacity: 1, ease: "power2.out", stagger: 0.1 }))
          const zinWeg = gsap.timeline({ paused: true }).to(regels, { y: "-75%", opacity: 0 })
          let op = true
          const m = main()
          if (m) gsap.set(m, { opacity: 0 })
          const weg = gsap.timeline({
            paused: true,
            onUpdate: () => {
              if (weg.progress() > 0.75 && op) {
                op = false
                html.classList.add("intro-los") // scrollen mag weer; het doek blijft tot het einde
                paginaOp()
              }
            },
            onComplete: rust,
          })
          weg
            .addLabel("start")
            .to($(".og-blokken"), { y: 0, ease: "power2.inOut", visibility: "visible" }, "start")
            .to($(".og-b1"), { y: 0, ease: "power2.inOut", duration: 1 }, "start")
            .to($(".og-b2"), { y: 0, ease: "power2.inOut", duration: 1.1 }, "start")
            .to($(".og-b3"), { y: 0, ease: "power2.inOut", duration: 1.2 }, "start")
            .addLabel("fifth")
            .to($(".og-blokken"), { y: "-100%", ease: "power3.inOut", duration: 1 }, "fifth")
            .to($(".og-grond"), { opacity: 0, ease: "power2.inOut", duration: 0.8 }, "fifth")
            .call(() => void zinWeg.play(), [], "fifth+=0.1")
            .to($(".og-merk"), { opacity: 0, ease: "power2.inOut", duration: 0.5 }, "fifth")
            .to($(".og-laad"), { opacity: 0, duration: 0.3 }, "fifth")
          const begin = gsap
            .timeline()
            .addLabel("start")
            .to($(".og-verloop"), { opacity: 1, ease: "power2.inOut" }, "start")
            .to($(".og-merk"), { opacity: 1, ease: "power2.inOut", duration: 0.8 }, "start")
            .to($(".og-laad"), { width: "25%", duration: 0.5, ease: "power2.out" }, "start")
            .to($(".og-laad"), { width: "70%", duration: 0.8, ease: "power3.inOut", onComplete: () => void weg.play() })
            .to($(".og-laad"), { width: "100%", duration: 1, ease: "power4.out" })
          tijdlijnen.push(zinWeg, weg, begin)
        } catch {
          rust()
        }
      }
    }

    // ── Paginawissel ──
    // Precies de intro, alleen met de naam van de bestemming als zin (eigenaar,
    // 5 okt 2026: "de overgang tussen subpagina's is zelfde als intro animatie
    // maar de tekst verschilt enkel"). Het enige extra: de grond vaagt eerst op
    // over de huidige pagina, want bij de intro is er nog geen pagina.
    const wissel = (url: URL) => {
      bezig = true
      const href = url.pathname + url.search + url.hash
      const vertrek = location.pathname
      let weg = false // is router.push al gedaan?
      const ga = () => {
        if (weg) return
        weg = true
        try {
          routerRef.current.push(href, { scroll: false })
        } catch {
          location.assign(href)
        }
      }
      // Vangnetten: de pagina gaat altijd door, het doek gaat altijd weg.
      timers.push(window.setTimeout(ga, 4000))
      timers.push(window.setTimeout(rust, MAX_TOTAAL))
      try {
        routerRef.current.prefetch(href)
      } catch {}

      /** Nieuwe pagina staat klaar onder het doek: bovenaan zetten en focus geven. */
      const klaarzetten = () => {
        if (!url.hash) scrollTo(0, 0)
        else document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView()
        const m = main()
        if (m) gsap.set(m, { opacity: 0 })
        const kop = (m?.querySelector("h1") as HTMLElement | null) ?? m
        if (kop) {
          if (!kop.hasAttribute("tabindex")) kop.setAttribute("tabindex", "-1")
          kop.focus({ preventScroll: true })
        }
      }

      try {
        el.setAttribute("data-actief", "")
        const regels = zetZin(zinVoor(normaal(url.pathname)))
        const zinWeg = gsap.timeline({ paused: true }).to(regels, { y: "-75%", opacity: 0 })
        let op = true
        const wegTl = gsap.timeline({
          paused: true,
          onUpdate: () => {
            if (wegTl.progress() > 0.75 && op) {
              op = false
              paginaOp()
            }
          },
          onComplete: rust,
        })
        wegTl
          .addLabel("start")
          .call(ga, [], "start")
          .to($(".og-blokken"), { y: 0, ease: "power2.inOut", visibility: "visible" }, "start")
          .to($(".og-b1"), { y: 0, ease: "power2.inOut", duration: 1 }, "start")
          .to($(".og-b2"), { y: 0, ease: "power2.inOut", duration: 1.1 }, "start")
          .to($(".og-b3"), { y: 0, ease: "power2.inOut", duration: 1.2 }, "start")
          .addLabel("fifth")
          // Wacht hier op de nieuwe route (usePathname), nooit langer dan MAX_WACHTEN.
          .addPause("fifth", () => {
            let klaar = false
            const verder = () => {
              if (klaar) return
              klaar = true
              aankomst.current = null
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  klaarzetten()
                  wegTl.resume()
                }),
              )
            }
            if (location.pathname !== vertrek) verder()
            else {
              aankomst.current = () => {
                if (location.pathname !== vertrek) verder()
              }
              timers.push(window.setTimeout(verder, MAX_WACHTEN))
            }
          })
          .to($(".og-blokken"), { y: "-100%", ease: "power3.inOut", duration: 1 }, "fifth")
          .to($(".og-grond"), { opacity: 0, ease: "power2.inOut", duration: 0.8 }, "fifth")
          .call(() => void zinWeg.play(), [], "fifth+=0.1")
          .to($(".og-merk"), { opacity: 0, ease: "power2.inOut", duration: 0.5 }, "fifth")
          .to($(".og-laad"), { opacity: 0, duration: 0.3 }, "fifth")
        const begin = gsap
          .timeline()
          .addLabel("dek")
          .fromTo($(".og-grond"), { opacity: 0 }, { opacity: 1, ease: "power2.inOut", duration: 0.4 }, "dek")
          .addLabel("start")
          .to(regels, { y: "0%", opacity: 1, ease: "power2.out", stagger: 0.1 }, "start")
          .to($(".og-verloop"), { opacity: 1, ease: "power2.inOut" }, "start")
          .to($(".og-merk"), { opacity: 1, ease: "power2.inOut", duration: 0.8 }, "start")
          .to($(".og-laad"), { width: "25%", duration: 0.5, ease: "power2.out" }, "start")
          .to($(".og-laad"), { width: "70%", duration: 0.8, ease: "power3.inOut", onComplete: () => void wegTl.play() })
          .to($(".og-laad"), { width: "100%", duration: 1, ease: "power4.out" })
        tijdlijnen.push(zinWeg, wegTl, begin)
      } catch {
        rust()
        ga()
      }
    }

    const klik = (e: MouseEvent) => {
      const url = doelVan(e)
      if (!url || stil()) return
      // Wij nemen de klik over; next/link slaat een afgehandelde klik over.
      e.preventDefault()
      if (bezig) return
      wissel(url)
    }
    window.addEventListener("click", klik, true)
    return () => {
      // Geen rust(): html.intro blijft staan, zodat een tweede mount (React
      // StrictMode in dev) de intro gewoon opnieuw start.
      window.removeEventListener("click", klik, true)
      opruimen()
      split?.revert()
    }
  }, [])

  return (
    <div ref={doek} className="og" aria-hidden="true">
      <div className="og-laad" />
      <div className="og-grond">
        <div className="og-verloop" />
      </div>
      <div className="og-blokken">
        <span className="og-b1" />
        <span className="og-b2" />
        <span className="og-b3" />
      </div>
      <div className="og-zin">
        <p ref={zin} />
      </div>
      <div className="og-merk donker">
        <Logo className="h-[28px] w-auto" />
      </div>
    </div>
  )
}
