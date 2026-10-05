import Link from "next/link"
import { BUSINESS } from "@/lib/business"

// Het slot van een pagina (wf.css .einde): groot "Kennismaken" en de gegevens.
export function Einde() {
  return (
    <section aria-label="Kennismaken" className="mt-[clamp(96px,12vw,180px)] border-t border-lijn pt-[clamp(48px,6vw,80px)]">
      <Link href="/kennismaken" className="syne text-[clamp(44px,9vw,130px)] leading-[.95] tracking-[-.045em] no-underline">
        Kennismaken
      </Link>
      <p className="lbl mt-6 mb-0 text-gedempt">
        <a href={BUSINESS.emailHref} className="no-underline">{BUSINESS.email}</a> ·{" "}
        <a href={BUSINESS.phoneHref} className="no-underline">{BUSINESS.phone}</a>
      </p>
    </section>
  )
}
