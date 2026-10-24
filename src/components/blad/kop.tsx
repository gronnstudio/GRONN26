"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { Instellingen } from "@/components/weergave"
import { OPEN_ZOEK } from "@/components/zoek"
import { T } from "@/components/taal"
import { useTaal } from "@/components/taal-klant"
import { BLADEN, bladVan } from "./bladen"

// De kop van het tuinplan: links het woordmerk, in het midden het blad waar
// je bent (zoals de hoek van een tekening), rechts Index. Index opent een
// gewoon <dialog> met alle bladen, zoeken en Weergave. Geen dock meer.
export function Kop() {
  const pad = usePathname()
  const taal = useTaal()
  const venster = useRef<HTMLDialogElement>(null)
  const nu = bladVan(pad)

  // een ander blad: de index gaat dicht
  useEffect(() => {
    venster.current?.close()
  }, [pad])

  return (
    <header className="bk">
      <Link href="/" className="bk-merk" aria-label={taal === "en" ? "GRØNN Studio, to the site plan" : "GRØNN Studio, naar de plattegrond"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair-antraciet.svg" alt="" className="bk-logo dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/woordmerk-primair.svg" alt="" className="bk-logo hidden dark:block" />
      </Link>
      <p className="bk-blad" aria-hidden={!nu}>
        {nu ? (
          <>
            <span>{nu.nr}</span> <T t={nu.titel} />
          </>
        ) : null}
      </p>
      <button type="button" className="bk-index" aria-haspopup="dialog" onClick={() => venster.current?.showModal()}>
        Index <span aria-hidden>{BLADEN.length.toString().padStart(2, "0")}</span>
      </button>

      <dialog ref={venster} className="bk-venster" aria-label="Index" onClick={(e) => e.target === venster.current && venster.current?.close()}>
        <div className="bk-venster-binnen">
          <div className="bk-venster-kop">
            <p className="lbl m-0"><T t={{ nl: "Index van bladen", en: "Sheet index" }} /></p>
            <button type="button" className="bk-sluit" onClick={() => venster.current?.close()}>
              <T t={{ nl: "Sluiten", en: "Close" }} /> ×
            </button>
          </div>
          <nav aria-label={taal === "en" ? "Main menu" : "Hoofdmenu"}>
            <ol className="bk-lijst">
              {BLADEN.map((b) => (
                <li key={b.nr}>
                  <Link href={b.href} aria-current={nu?.nr === b.nr ? "page" : undefined}>
                    <span className="bk-nr">{b.nr}</span>
                    <span className="bk-titel"><T t={b.titel} /></span>
                    <span aria-hidden className="bk-pijl">→</span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
          <button
            type="button"
            className="bk-zoek"
            onClick={() => {
              venster.current?.close()
              dispatchEvent(new Event(OPEN_ZOEK))
            }}
          >
            <T t={{ nl: "Zoek op de site", en: "Search the site" }} /> <span aria-hidden>⌘K</span>
          </button>
          <div className="bk-weergave">
            <p className="lbl m-0 mb-4"><T t={{ nl: "Weergave", en: "Display" }} /></p>
            <Instellingen />
          </div>
        </div>
      </dialog>
    </header>
  )
}
