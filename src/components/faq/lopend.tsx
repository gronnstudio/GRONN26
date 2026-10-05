import { Fragment } from "react"
import { BUSINESS } from "@/lib/business"

// Lopende tekst uit de vragenlijst: bedragen in Geist Mono (zoals het
// wireframe), telefoon en e-mail als link. De tekst zelf blijft letterlijk.
const DELEN = new RegExp(
  `(€\\s?\\d[\\d.]*(?:–€\\s?\\d[\\d.]*)?|${BUSINESS.phone.replace(/[+]/g, "\\+")}|${BUSINESS.email.replace(/[.]/g, "\\.")})`,
  "g"
)

export function Lopend({ tekst }: { tekst: string }) {
  return (
    <>
      {tekst.split(DELEN).map((deel, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{deel}</Fragment>
        if (deel === BUSINESS.phone)
          return (
            <a key={i} href={BUSINESS.phoneHref} className="underline underline-offset-2">
              {deel}
            </a>
          )
        if (deel === BUSINESS.email)
          return (
            <a key={i} href={BUSINESS.emailHref} className="underline underline-offset-2">
              {deel}
            </a>
          )
        return (
          <span key={i} className="font-mono text-[.92em] whitespace-nowrap">
            {deel}
          </span>
        )
      })}
    </>
  )
}
