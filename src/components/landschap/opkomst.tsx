"use client"

import { useEffect } from "react"

// Rustige tekstopkomst (brief §06): hooguit 16px en circa 400ms, één keer per
// bezoek. De inhoud staat er zonder JavaScript, bij minder beweging en na het
// eerste bezoek gewoon; pas als deze code draait verbergt hij wat nog onder de
// vouw ligt. Een fout hier laat de pagina dus nooit leeg.
export function Opkomst() {
  useEffect(() => {
    const html = document.documentElement
    if (html.classList.contains("stil") || matchMedia("(prefers-reduced-motion: reduce)").matches) return
    try {
      if (sessionStorage.getItem("ls-opkomst")) return
      sessionStorage.setItem("ls-opkomst", "1")
    } catch {}
    const els = [...document.querySelectorAll<HTMLElement>(".ls-op")].filter((el) => el.getBoundingClientRect().top > innerHeight)
    if (!els.length || !("IntersectionObserver" in window)) return
    els.forEach((el) => el.classList.add("ls-wacht"))
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.remove("ls-wacht")
          io.unobserve(e.target)
        }),
      { rootMargin: "0px 0px -8% 0px" },
    )
    els.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      els.forEach((el) => el.classList.remove("ls-wacht"))
    }
  }, [])
  return null
}
