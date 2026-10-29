import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LanguageMemory, LanguageProvider } from "@/components/language-provider"
import { Header } from "@/components/layout/header"
import { DockClearance, DockNav } from "@/components/layout/dock-nav"
import { TopBar } from "@/components/layout/hoek-paneel"
import { KopRuimte } from "@/components/layout/kop-ruimte"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { SearchProvider } from "@/components/search/command-palette"
import { Shortcuts } from "@/components/shortcuts"
import { EditorProvider } from "@/editor/editor-context"
import { getContent } from "@/lib/content"
import { VIJVER_ALS_PROJECT } from "@/lib/data/vijverrenovatie"
import { TERRAS_ALS_PROJECT } from "@/lib/data/terras-geulle"
import { DevPaneel } from "@/components/dev/dev-paneel"
import { Aanwijzer, AppMelding, ContactBubbel, HemelBubbel, NaarBovenKnop, OfflineMelding, Leesdraad, RandPijlen, ZoekTip } from "@/components/gronn/elementen"
import { Voet } from "@/components/gronn/voet"
import { Openingsdoek } from "@/components/gronn/openingsdoek"
import { isLocale, localeParams } from "@/lib/locale"

// The public site. Everything below here knows its locale from the URL,
// so copy can be resolved on the server instead of after hydration, and
// Dutch finally has its own indexable addresses.
export function generateStaticParams() {
  return localeParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  // Canonical and hreflang are NOT set here. Layout metadata is inherited
  // by every page beneath it, and a layout cannot know the current path —
  // the previous version declared every page's alternate to be the
  // homepage, which is exactly the non-reciprocal cluster Google drops.
  // Each page calls pageMetadata() from @/lib/seo instead.
  return {
    openGraph: { locale: locale === "nl" ? "nl_NL" : "en_US" },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  // De menu's van de vorige site (desktopbalk met megamenu, tabletmenu,
  // telefoondock en de twee hoekknoppen) op de nieuwe V5-pagina's.
  // Hun inhoud: alleen wat de V5-site heeft — de diensten, en als projecten
  // echt werk (de vijverrenovatie en het terras in Geulle). Geen journaal,
  // geen plaatshouders. De vijver blijft het uitgelichte project.
  const { services } = await getContent()
  const projects = [VIJVER_ALS_PROJECT, TERRAS_ALS_PROJECT]
  const menuContent = { services, projects, articles: [] }

  return (
    <LanguageProvider locale={locale}>
      {/* The document shell lives in the root layout, which sits above
          this segment and so cannot read the locale. Setting the
          attribute from here runs during HTML parsing — before paint and
          before any assistive technology reads the page. Moving <html>
          into per-area root layouts would make it fully server-rendered;
          tracked in docs/concepts.md. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(locale)}`,
        }}
      />
      {/* De taalkeuze: zet een verloren cookie terug uit localStorage
          en houdt de twee gelijk. Zie language-provider.tsx. */}
      <LanguageMemory />
      {/* Eén keer per sessie, vóór de rest in de HTML: zie openingsdoek.tsx. */}
      <Openingsdoek />
      {/* V5 (sep 2026): de publieke site van scratch. Alleen de fonts,
          de kleurtokens en de Uren-schakelaar zijn gebleven. */}
      <EditorProvider>
        <SearchProvider corpus={menuContent}>
          <Shortcuts />
          <div className="flex min-h-svh flex-col">
            <a
              href="#main"
              className="sr-only z-[100] rounded-md bg-gronn-green px-4 py-2 text-sm text-gronn-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
            >
              {locale === "nl" ? "Direct naar inhoud" : "Skip to content"}
            </a>
            <Header content={menuContent} featured={VIJVER_ALS_PROJECT} services={services} />
            {/* De balk is fixed (80px), de hoekknoppen op de telefoon ook.
                Op home valt deze ruimte weg: de foto loopt onder het menu door. */}
            <KopRuimte />
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <Voet locale={locale} />
            <DockClearance />
            <DockNav />
            <NaarBovenKnop />
            {/* Leesvoortgang bovenaan en de eenmalige ⌘K-tip (eigenaar, 28 sep 2026, uit zijn CodePen). */}
            <Leesdraad />
            <ZoekTip />
            <ContactBubbel />
            <HemelBubbel />
            <TopBar />
            {/* "Ook als app te installeren" — telefoon, browser, na scrollen. */}
            <AppMelding />
            {/* Alleen in de app-weergave (vastgezet op het beginscherm):
                daar is geen browser om te verversen. In een gewone tab
                rendert hij niets. */}
            <PullToRefresh />
            {/* De aanwijzer (zaadje + ring) — alleen met een muis, nooit op
                touch of bij minder beweging. */}
            <Aanwijzer />
            {/* Palet-opties: pijlen voor terug en verder (keuze, standaard uit) en de
                melding bij geen verbinding. */}
            <RandPijlen />
            <OfflineMelding />
            {/* DEV-laag: rendert niets tenzij de server de eigenaar bevestigt. */}
            <DevPaneel />
          </div>
        </SearchProvider>
      </EditorProvider>
    </LanguageProvider>
  )
}
