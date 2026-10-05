import type { Metadata } from "next"
import { KopieerHandtekening } from "@/components/handtekening/kopieer"
import { HANDTEKENING_HTML } from "@/lib/handtekening"

// gronn.studio/handtekening: Nicks e-mailhandtekening, om te kopiëren en in
// Gmail te plakken (overgenomen uit de oude site). Een gereedschap, geen pagina
// om gevonden te worden: noindex, niet in de sitemap, nergens gelinkt, zonder
// menu en voet (zie [data-links] in globals.css).
export const metadata: Metadata = {
  title: { absolute: "E-mailhandtekening · GRØNN Studio" },
  alternates: { canonical: "/handtekening" },
  robots: { index: false, follow: false },
}

export default function Handtekening() {
  return (
    <div data-links className="mx-auto flex min-h-svh max-w-[720px] flex-col gap-8 px-6 py-16 text-inkt">
      <div className="flex flex-col gap-3">
        <p className="lbl m-0 text-oranje-tekst">GRØNN · e-mail</p>
        <h1 className="syne m-0 text-[clamp(32px,4vw,44px)] tracking-[-.02em]">E-mailhandtekening</h1>
        <p className="m-0 text-[16px] leading-[1.6] text-gedempt">
          Kopieer de handtekening met de knop, of selecteer hem hieronder en kopieer hem zelf. Plak hem in Gmail bij
          Instellingen → Alle instellingen bekijken → Algemeen → Handtekening, en klik onderaan op Wijzigingen
          opslaan.
        </p>
      </div>
      {/* Altijd op wit, zoals een mail eruitziet, ook als de site op Donker staat. */}
      <div className="rounded-2xl border border-lijn bg-white p-8 [&_img]:rounded-none!">
        <div data-handtekening dangerouslySetInnerHTML={{ __html: HANDTEKENING_HTML }} />
      </div>
      <KopieerHandtekening html={HANDTEKENING_HTML} />
    </div>
  )
}
