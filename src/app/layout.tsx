import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { LayoutMeting } from "@/components/layout-meting"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { geistMono, montserrat, mono, plex, smal, syne } from "@/fonts"
import "@/components/ar/ar.css"
import { SiteKop } from "@/components/landschap/kop"
import { SiteVoet } from "@/components/landschap/voet"
import { AutoVegen } from "@/components/landschap/auto-vegen"
import { ArKop } from "@/components/ar/kop"
import "@/components/landschap/landschap.css"
import "@/components/handoff/handoff.css"
import { Kop } from "@/components/blad/kop"
import "@/components/blad/blad.css"
import { Zoek } from "@/components/zoek"
import { Sneltoetsen } from "@/components/sneltoetsen"
import { T } from "@/components/taal"
import { PullToRefresh } from "@/components/vernieuw"
import { zoekIndex } from "@/lib/zoek-index"
import "@/components/wereld/wereld.css"
import { Stempel } from "@/components/blad/stempel"
import { BUSINESS } from "@/lib/business"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://gronn.studio"),
  title: { default: `${BUSINESS.name} · Vijvers en tuinen in Stein en omgeving`, template: `%s · ${BUSINESS.name}` },
  description:
    "Ik maak en onderhoud vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
  // Elke pagina zijn eigen canonieke adres, en een deelbeeld voor WhatsApp en
  // sociale media als een pagina er zelf geen heeft (audit 5 okt 2026).
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: BUSINESS.name,
    images: [{ url: "/projecten/vijverrenovatie/F08-2.jpg", alt: "Nick Peters aan het werk bij de vijverrenovatie." }],
  },
  twitter: { card: "summary_large_image" },
}

// Zoomen mag weer (eigenaar, 22 okt 2026, voor toegankelijkheid 100; was
// sinds 11 okt uit).
export const viewport: Viewport = { width: "device-width", initialScale: 1 }

// Klassiek is weer voor iedereen de standaard (eigenaar, 27 okt 2026: "Zet de
// klassieke site terug vast en laat gebruikers zelf kiezen"); Blueprint alleen
// als de bezoeker het zelf kiest in Weergave. Wie bij de
// 50/50 van 25 okt een layout toegewezen kreeg (`toegewezen`) en daarna niet
// zelf koos, gaat één keer terug naar Klassiek.
// Voor de eerste verf: kies licht of donker uit de bewaarde weergave (of de
// instelling van het toestel), zodat er geen flits is.
const VOORVERF = `try{var s=JSON.parse(localStorage.getItem('gronn-weergave')||'{}'),k=s.kleur||'auto',h=new Date().getHours(),d=k==='donker'||(k==='auto'&&(h>=19||h<7)),c=document.documentElement.classList;c.toggle('donker',d);if(s.toegewezen){delete s.layout;delete s.toegewezen;localStorage.setItem('gronn-weergave',JSON.stringify(s))}c.toggle('plan',s.layout==='plan');c.toggle('stil',!!s.beweging);var t=s.tekst||(s.groot?1:0);c.toggle('tekst-1',t===1);c.toggle('tekst-2',t===2);c.toggle('tekst-3',t===3);c.toggle('contrast',!!s.contrast);c.toggle('onderstreep',!!s.onderstreep);if(s.taal==='en'){c.add('en');document.documentElement.lang='en'}localStorage.removeItem('gronn-dev')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${syne.variable} ${montserrat.variable} ${geistMono.variable} ${smal.variable} ${plex.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: VOORVERF }} />
      </head>
      <body>
        {/* WCAG 2.4.1: met Tab eerst langs de navigatie heen naar de inhoud */}
        <a href="#inhoud" className="overslaan"><T t={{ nl: "Naar de inhoud", en: "Skip to content" }} /></a>
        <div className="alleen-plan contents"><Kop /></div>
        <div className="alleen-klassiek contents"><SiteKop /></div>
        <main id="inhoud" tabIndex={-1}>{children}</main>
        <div className="alleen-plan contents"><Stempel /></div>
        <div className="alleen-klassiek contents">
          {/* De kop, het menu en de voet uit de visuele bouwbrief (21 nov 2026);
              het dock onderin is daarmee vervangen. */}
          <SiteVoet />
          <AutoVegen />
          <ArKop />
        </div>
        <Zoek index={zoekIndex()} />
        <Sneltoetsen />
        {/* Bezoeken en laadsnelheid, zonder cookies (11 okt 2026; zie /privacy).
            Ze tellen pas als ze in het Vercel-dashboard aanstaan. */}
        {/* alleen in de app-weergave: daar is geen browser om te verversen */}
        <PullToRefresh />
        <Analytics />
        <LayoutMeting />
        <SpeedInsights />
      </body>
    </html>
  )
}
