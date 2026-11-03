import Link from "next/link"
import { Adres, BosVlak, BREEDTE, ContactKaart, ContactKanalen, Label, LeesTekst, Visitekaartje, WhatsAppNick } from "@/components/gronn/elementen"
import { PORTRET } from "@/components/gronn/plekken"
import { ContactFormulier } from "@/components/gronn/contact-formulier"
import { CONTACT_UITNODIGING, KENNISMAKING_VRIJBLIJVEND } from "@/components/gronn/teksten"
import { BUSINESS } from "@/lib/business"
import { getContent } from "@/lib/content"
import { levelOf } from "@/lib/data/services"
import { pick, type L } from "@/lib/i18n"
import { localePath, toLocale } from "@/lib/locale"
import { qrSvg, VCARD_URL } from "@/lib/qr"
import { localeMetadata } from "@/lib/seo"

export const generateMetadata = localeMetadata("/contact", {
  title: {
    en: `Contact about your garden or pond in ${BUSINESS.address.province}`,
    nl: `Contact over je tuin of vijver in ${BUSINESS.address.province}`,
  },
  description: {
    en: `Tell Nick, gardener in ${BUSINESS.address.city} (${BUSINESS.address.province}), about your garden or pond. ${KENNISMAKING_VRIJBLIJVEND.en}`,
    nl: `Vertel Nick, hovenier in ${BUSINESS.address.city} (${BUSINESS.address.province}), over je tuin of vijver. ${KENNISMAKING_VRIJBLIJVEND.nl}`,
  },
})

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const l = toLocale((await params).locale)
  const t = (v: L) => pick(v, l)
  const { services } = await getContent()
  const qr = await qrSvg()
  const dienstSoort = Object.fromEntries(services.map((s) => [s.slug, levelOf(s)]))
  return (
    <div className={`${BREEDTE} grid gap-12 pt-12 pb-24 sm:pt-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16`}>
      <div>
        <Label>{t({ nl: "Contact", en: "Contact" })}</Label>
        <h1 className="mt-5 tekst-h1">
          {t({ nl: "Laten we je tuin bekijken.", en: "Let's look at your garden." })}
        </h1>
        <LeesTekst className="mt-6 max-w-[34rem] text-lg leading-relaxed text-foreground/80">{t(CONTACT_UITNODIGING)}</LeesTekst>
        <BosVlak className="mt-10">
          <Label toon="bos">{t({ nl: "Liever direct?", en: "Rather direct?" })}</Label>
          {/* Nick met zijn WhatsApp ernaast (eigenaar, 2 okt 2026, naar
              Langenegger Naturgärten); daarom staat WhatsApp niet nog eens
              in de lijst eronder. */}
          <WhatsAppNick locale={l} portret={PORTRET} toon="bos" className="mt-5" />
          <div className="mt-6">
            <ContactKanalen kanalen={["email", "telefoon", "instagram"]} toon="bos" groot />
          </div>
          <Adres className="mt-6 text-white/75" />
          <div className="mt-8">
            <Visitekaartje locale={l} qr={qr} qrData={VCARD_URL} />
          </div>
          <div className="mt-6 text-gronn-white">
            <ContactKaart locale={l} />
          </div>
        </BosVlak>
        {/* De deur naar je eigen dossier. Op de telefoon is dit twee
            tikken (dock → Contact → hier), niet de voettekst — zie
            mobile-reach.spec.ts. /dashboard beslist zelf of je klant of
            de studio bent. */}
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-[16px] border border-line/10 bg-surface p-6">
          <p className="text-[15px]">{t({ nl: "Al klant? Je tuin en je aanvragen staan in je dossier.", en: "Already a client? Your garden and requests are in your file." })}</p>
          <Link href="/dashboard" className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line/25 px-5 font-semibold hover:border-[var(--gronn-ember)]">
            {t({ nl: "Naar je dossier", en: "To your file" })} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
      <div className="rounded-[16px] border border-line/10 bg-surface p-5 sm:p-10">
        {/* Eén regel naar /faq: wie eerst wil weten wat het kost of waar
            ik werk, hoeft daarvoor geen formulier in te vullen. */}
        <p className="mb-6 text-[15px] text-foreground/80">
          {t({ nl: "Eerst een vraag?", en: "A question first?" })}{" "}
          <Link href={localePath(l, "/faq")} className="inline-flex min-h-[24px] items-center font-semibold text-[var(--ember-text)] underline underline-offset-4">
            {t({ nl: "Kijk bij de veelgestelde vragen", en: "See the frequently asked questions" })}
          </Link>
        </p>
        <ContactFormulier dienstSoort={dienstSoort} />
      </div>
    </div>
  )
}
