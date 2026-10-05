"use client"

import { useEffect } from "react"

// De beweging van de voorpagina, nagebouwd uit de scripts van WF-058, WF-059
// en WF-057. Zonder JS, met prefers-reduced-motion of met html.stil staat
// alles stil en is alles zichtbaar: de server rendert de eindstand, en deze
// component zet alleen iets in gang als beweging mag.
export function Beweging() {
  useEffect(() => {
    const html = document.documentElement
    const wortel = document.querySelector<HTMLElement>("[data-voorpagina]")
    if (!wortel) return
    const mq = matchMedia("(prefers-reduced-motion: reduce)")
    const stil = () => mq.matches || html.classList.contains("stil")
    const breed = () => innerWidth >= 768
    wortel.classList.add("vp-fx")

    // ── WF-058 ────────────────────────────────────────────────────────
    const foto = wortel.querySelector<HTMLElement>("[data-held-foto]")
    const labels = [...wortel.querySelectorAll<HTMLElement>("[data-verticaal]")]
    const woorden = [...wortel.querySelectorAll<HTMLElement>("[data-onthul] .vp-wd")]
    const spoor = wortel.querySelector<HTMLElement>("[data-spoor]")
    const stukken = [...wortel.querySelectorAll<HTMLElement>("[data-v]")]

    function frame() {
      const y = scrollY
      const vh = innerHeight
      const s = stil()
      // foto groeit van 0,7 naar 1 over ~1,29 schermhoogte (gemeten: 1160px bij 900 hoog)
      foto?.style.setProperty("--s", String(s || !breed() ? 0.7 : Math.min(1, 0.7 + (0.3 * y) / (vh * 1.29))))
      labels.forEach((l) => l.classList.toggle("vp-weg", y > 80))
      // woorden boven 70 % van het scherm lichten op, de rest staat op 0,1
      for (const w of woorden) w.style.opacity = s || w.getBoundingClientRect().top < vh * 0.7 ? "" : "0.1"
      // reuzenwoord schuift 0,5px naar rechts per gescrolde px, eindeloos
      if (spoor) {
        const set = (spoor.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0
        spoor.style.transform = s || !set ? "" : `translate3d(${((y * 0.5) % set) - set}px,0,0)`
      }
      // parallax: snelheid 0,5 en 3 uit de demo -> 0,0325 en 0,195 van de afstand tot het midden
      for (const el of stukken) {
        const v = Number(el.dataset.v)
        const ouder = el.offsetParent as HTMLElement | null
        if (s || !v || !breed() || !ouder) {
          el.style.transform = ""
          continue
        }
        const midden = ouder.getBoundingClientRect().top + el.offsetTop + el.offsetHeight / 2
        el.style.transform = `translate3d(0,${((midden - vh / 2) * v * 0.065).toFixed(1)}px,0)`
      }
    }
    let wacht = 0
    const plan = () => {
      if (!wacht) wacht = requestAnimationFrame(() => ((wacht = 0), frame()))
    }
    addEventListener("scroll", plan, { passive: true })
    addEventListener("resize", plan)
    const mo = new MutationObserver(plan)
    mo.observe(html, { attributes: true, attributeFilter: ["class"] })
    frame()

    // ── WF-059 / WF-057: opkomen zodra iets in beeld komt ──────────────
    const zie = [...wortel.querySelectorAll<HTMLElement>("[data-zie]")]
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("aan")
            io.unobserve(e.target)
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    )
    zie.forEach((el) => io.observe(el))
    // wat al boven het scherm ligt (herladen halverwege) meteen tonen
    const al = setTimeout(() => zie.forEach((el) => el.getBoundingClientRect().top < innerHeight && el.classList.add("aan")), 50)

    // ── WF-057: een beeld van 360 × 480 loopt met de muis mee ───────────
    const opruimen: (() => void)[] = []
    const vak = wortel.querySelector<HTMLElement>("[data-diensten]")
    const zwerf = wortel.querySelector<HTMLElement>("[data-zwerf]")
    if (vak && zwerf && matchMedia("(hover: hover) and (pointer: fine)").matches) {
      let mx = 0, my = 0, x = 0, yy = 0, loopt = false
      const volg = () => {
        x += (mx - x) * 0.18
        yy += (my - yy) * 0.18
        zwerf.style.transform = `translate3d(${(x - 180).toFixed(1)}px,${(yy - 240).toFixed(1)}px,0)`
        if (zwerf.classList.contains("zichtbaar") || Math.abs(mx - x) > 0.5) requestAnimationFrame(volg)
        else loopt = false
      }
      const beelden = [...zwerf.querySelectorAll<HTMLElement>("[data-beeld]")]
      vak.querySelectorAll<HTMLElement>("[data-naam]").forEach((a) => {
        const in_ = (e: MouseEvent) => {
          if (stil()) return
          beelden.forEach((b) => b.classList.toggle("aan", b.dataset.beeld === a.dataset.naam))
          if (!zwerf.classList.contains("zichtbaar")) {
            x = mx = e.clientX
            yy = my = e.clientY
          }
          zwerf.classList.add("zichtbaar")
          vak.classList.add("actief")
          if (!loopt) {
            loopt = true
            requestAnimationFrame(volg)
          }
        }
        const uit = () => {
          zwerf.classList.remove("zichtbaar")
          vak.classList.remove("actief")
        }
        a.addEventListener("mouseenter", in_)
        a.addEventListener("mouseleave", uit)
        opruimen.push(() => {
          a.removeEventListener("mouseenter", in_)
          a.removeEventListener("mouseleave", uit)
        })
      })
      const muis = (e: MouseEvent) => {
        mx = e.clientX
        my = e.clientY
      }
      addEventListener("mousemove", muis, { passive: true })
      opruimen.push(() => removeEventListener("mousemove", muis))
    }

    return () => {
      removeEventListener("scroll", plan)
      removeEventListener("resize", plan)
      mo.disconnect()
      io.disconnect()
      clearTimeout(al)
      cancelAnimationFrame(wacht)
      opruimen.forEach((f) => f())
      wortel.classList.remove("vp-fx")
    }
  }, [])
  return null
}
