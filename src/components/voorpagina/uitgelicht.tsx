import { ViewTransition } from "react"
import Link from "next/link"
import { Foto } from "@/components/foto"
import { T } from "@/components/taal"
import { VIJVER } from "@/lib/data/vijverrenovatie"
import { F02_2, F10 } from "./beelden"

// Echt werk hoog op de voorpagina (11 okt 2026; tot dan stond er bewust geen
// werk, 4 okt): de vijverrenovatie als ervoor en nu. "Nu" is dezelfde foto
// als bovenaan de projectpagina, zodat hij daarheen kan groeien (data-morph).

export function Uitgelicht() {
  return (
    <section className="vp-project" aria-labelledby="h-project">
      <p className="lbl m-0">
        <T t={{ nl: `Werk · GR / 001 · ${VIJVER.categorie}`, en: `Work · GR / 001 · ${VIJVER.en.categorie}` }} />
      </p>
      <h2 id="h-project" className="syne">
        <T t={{ nl: VIJVER.titel, en: VIJVER.en.titel }} />
      </h2>
      <Link href="/werk/vijverrenovatie" data-morph className="vp-voorna" aria-labelledby="h-project">
        <figure>
          <Foto foto={F02_2} sizes="(min-width: 768px) 45vw, 50vw" className="vp-voorna-foto" />
          <figcaption className="lbl"><T t={{ nl: "Ervoor", en: "Before" }} /></figcaption>
        </figure>
        <figure>
          <ViewTransition name="project-vijverrenovatie" share="morph" default="none">
            <Foto foto={F10} sizes="(min-width: 768px) 45vw, 50vw" className="vp-voorna-foto" />
          </ViewTransition>
          <figcaption className="lbl"><T t={{ nl: "Nu", en: "Now" }} /></figcaption>
        </figure>
      </Link>
      <Link href="/werk/vijverrenovatie" data-morph className="lnk vp-meer">
        <T t={{ nl: "Bekijk het project →", en: "See the project →" }} />
      </Link>
    </section>
  )
}
