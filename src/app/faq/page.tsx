import type { Metadata } from "next"
import Link from "next/link"
import { faqSchema, faqVragen } from "@/components/faq/vragen"
import { VraagRegel } from "@/components/faq/vraag-regel"
import { BUSINESS } from "@/lib/business"

export const metadata: Metadata = {
  title: "Veelgestelde vragen",
  description: "Wat een vijver of tuin bij mij kost, waar ik werk, hoe lang het duurt en hoe je begint.",
  alternates: { canonical: "/faq" },
}

// WF-032: alle vragen als openklapbare regels; de eerste staat open.
export default function FaqPagina() {
  const lijst = faqVragen()
  return (
    <div className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(lijst)).replace(/</g, "\\u003c") }}
      />
      <section className="grid grid-cols-1 gap-y-4 pt-[clamp(56px,9vw,140px)] md:grid-cols-[3fr_9fr] md:gap-x-8 md:gap-y-0">
        <p className="lbl m-0 text-gedempt">Vragen · {lijst.length}</p>
        <div>
          <h1 className="syne m-0 text-[clamp(48px,7.5vw,104px)] leading-none tracking-[-.04em]">Veelgestelde vragen</h1>
          <p className="mt-2 mb-0 max-w-[38ch] text-[clamp(18px,1.7vw,24px)] leading-normal text-gedempt md:mt-7">
            Wat het kost, waar ik werk, hoe lang het duurt en hoe je begint.
          </p>
        </div>
      </section>

      <div className="mt-[clamp(56px,7vw,96px)]">
        {lijst.map((v, i) => (
          <VraagRegel key={v.id} vraag={v} nummer={i + 1} open={i === 0} />
        ))}
      </div>

      <p className="lbl mt-4 max-w-[60ch] text-gedempt">Alle prijzen inclusief btw</p>

      <section aria-label="Kennismaken" className="mt-[clamp(96px,12vw,180px)] border-t border-lijn pt-[clamp(48px,6vw,80px)]">
        <Link href="/kennismaken" className="syne text-[clamp(44px,9vw,130px)] leading-[.95] tracking-[-.045em] no-underline">
          Kennismaken
        </Link>
        <p className="lbl mt-6 mb-0 text-gedempt">
          <a href={BUSINESS.emailHref}>{BUSINESS.email}</a> · <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
        </p>
      </section>
    </div>
  )
}
