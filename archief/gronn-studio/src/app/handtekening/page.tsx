import type { Metadata } from "next"

import { KopieerHandtekening } from "@/components/gronn/kopieer-handtekening"
import { HANDTEKENING_HTML } from "@/lib/handtekening"

// gronn.studio/handtekening: Nicks e-mailhandtekening, om te kopiëren en
// in Gmail te plakken. Een gereedschap, geen pagina om gevonden te
// worden: noindex, nofollow, niet in de sitemap en nergens gelinkt.
export const metadata: Metadata = {
  title: { absolute: "E-mailhandtekening · GRØNN Studio" },
  alternates: { canonical: "/handtekening" },
  robots: { index: false, follow: false },
}

export default function Handtekening() {
  return (
    <main className="mx-auto flex min-h-svh max-w-[720px] flex-col gap-[32px] px-[24px] py-[64px] text-foreground">
      <div className="flex flex-col gap-[12px]">
        <p className="tekst-annotatie text-[var(--ember-text)]">GRØNN · e-mail</p>
        <h1 className="tekst-h2">E-mailhandtekening</h1>
        <p className="tekst-body text-muted">
          Kopieer de handtekening met de knop, of selecteer hem hieronder en kopieer hem zelf. Plak hem in Gmail bij
          Instellingen → Alle instellingen bekijken → Algemeen → Handtekening, en klik onderaan op Wijzigingen
          opslaan.
        </p>
      </div>

      {/* Altijd op wit, zoals een mail eruitziet, ook als de site op Donker staat. */}
      <div className="rounded-[16px] border border-line/15 bg-white p-[32px]">
        <div data-handtekening dangerouslySetInnerHTML={{ __html: HANDTEKENING_HTML }} />
      </div>

      <KopieerHandtekening html={HANDTEKENING_HTML} />
    </main>
  )
}
