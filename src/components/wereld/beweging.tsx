"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

// De beweging die elke pagina deelt. Eén keer gemount in de layout, opnieuw
// opgezet bij elke paginawissel. Zet html.w-fx alleen als beweging mag;
// zonder JS, met prefers-reduced-motion of html.stil staat alles stil.
//   [data-groei]  foto groeit van 0,7 naar 1 over ~1,3 schermhoogte
//   [data-zij]    verticale labels, weg na 80px scrollen
//   [data-onthul] woorden (.w-wd) lichten op boven 70 % van het scherm
//   [data-zie]    komt zacht op zodra het in beeld komt (--i = volgorde)
//   [data-v]      parallax, snelheid v (0,5 of 3 zoals op de voorpagina)
export function WereldBeweging() {
  const pad = usePathname()
  useEffect(() => {
    const html = document.documentElement
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    const stil = () => mq.matches || html.classList.contains("stil")
    const breed = () => innerWidth >= 768
    if (!stil()) html.classList.add("w-fx")

    const main = document.querySelector("main")
    if (!main) return
    const groei = [...main.querySelectorAll<HTMLElement>("[data-groei]")]
    const zij = [...main.querySelectorAll<HTMLElement>("[data-zij]")]
    const woorden = [...main.querySelectorAll<HTMLElement>("[data-onthul] .w-wd")]
    const stukken = [...main.querySelectorAll<HTMLElement>("[data-v]")]

    function frame() {
      const y = scrollY, vh = innerHeight, s = stil()
      for (const g of groei) {
        const top = g.getBoundingClientRect().top + y
        const p = Math.max(0, y - (top - vh * 0.85))
        g.style.setProperty("--s", String(s ? 1 : Math.min(1, 0.7 + (0.3 * p) / (vh * 1.29))))
      }
      zij.forEach((l) => l.classList.toggle("weg", y > 80))
      for (const w of woorden) w.style.opacity = s || w.getBoundingClientRect().top < vh * 0.7 ? "" : "0.12"
      for (const el of stukken) {
        const v = Number(el.dataset.v)
        if (s || !v) { el.style.transform = ""; continue }
        const r = el.getBoundingClientRect()
        el.style.transform = `translate3d(0,${((r.top + r.height / 2 - vh / 2) * v * (breed() ? 0.065 : 0.04)).toFixed(1)}px,0)`
      }
    }
    let wacht = 0
    const plan = () => { if (!wacht) wacht = requestAnimationFrame(() => ((wacht = 0), frame())) }
    addEventListener("scroll", plan, { passive: true })
    addEventListener("resize", plan)
    const mo = new MutationObserver(() => { html.classList.toggle("w-fx", !stil()); plan() })
    mo.observe(html, { attributes: true, attributeFilter: ["class"] })
    frame()

    const zie = [...main.querySelectorAll<HTMLElement>("[data-zie]")]
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("aan"); io.unobserve(e.target) } }),
      { rootMargin: "0px 0px -8% 0px" },
    )
    zie.forEach((el) => io.observe(el))
    const al = setTimeout(() => zie.forEach((el) => el.getBoundingClientRect().top < innerHeight && el.classList.add("aan")), 60)

    return () => {
      removeEventListener("scroll", plan)
      removeEventListener("resize", plan)
      mo.disconnect(); io.disconnect(); clearTimeout(al); cancelAnimationFrame(wacht)
    }
  }, [pad])
  return null
}
