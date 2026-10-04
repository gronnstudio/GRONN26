import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { ViewTransition } from "react"

import "@/styles/globals.css"

import { BottomNavigation } from "@/components/BottomNavigation"
import { SiteFooter } from "@/components/SiteFooter"
import { SiteHeader } from "@/components/SiteHeader"
import { BUSINESS } from "@/data/business"
import { MERKBASIS } from "@/data/site"
import { PREPAINT } from "@/lib/weergave"

// Drie families, alle drie lokaal: niets wordt bij een bezoeker of bij
// de build opgehaald. Syne en Montserrat zijn Nicks eigen bestanden uit
// gronn-studio (gesubset); Geist Mono komt uit het geist-pakket (OFL).
const montserrat = localFont({
  src: "../styles/fonts/Montserrat-latin.woff2",
  variable: "--font-montserrat",
  weight: "400 600",
  display: "swap",
})
const syne = localFont({
  src: "../styles/fonts/Syne-SemiBold-latin.woff2",
  variable: "--font-syne",
  weight: "600",
  display: "swap",
})
const geistMono = localFont({
  src: "../styles/fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.url),
  title: {
    default: "GRØNN Studio · Vijvers en tuinen in Stein en omgeving",
    template: "%s — GRØNN Studio",
  },
  description: MERKBASIS,
  openGraph: { type: "website", siteName: BUSINESS.name, locale: "nl_NL" },
  // Tot de domeinwissel: deze build hoort niet in zoekmachines.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efeeea" },
    { media: "(prefers-color-scheme: dark)", color: "#202020" },
  ],
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning className={`${montserrat.variable} ${syne.variable} ${geistMono.variable}`}>
      <head>
        {/* Vóór de eerste paint: kleur en beweging uit de keuze van de bezoeker. */}
        <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
      </head>
      <body>
        <a
          href="#inhoud"
          className="tekst-label sr-only z-50 bg-gronn-oranje px-[16px] py-[10px] text-gronn-antraciet focus:not-sr-only focus:fixed focus:left-[16px] focus:top-[16px]"
        >
          Direct naar de inhoud
        </a>
        <SiteHeader />
        <ViewTransition>
          <main id="inhoud" tabIndex={-1} className="outline-none">
            {children}
          </main>
        </ViewTransition>
        <SiteFooter />
        <BottomNavigation />
      </body>
    </html>
  )
}
