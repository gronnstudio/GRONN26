import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { LayoutMeting } from "@/components/layout-meting"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed, Montserrat, Syne } from "next/font/google"
import { Menu } from "@/components/menu"
import { Voet } from "@/components/voet"
import { Kop } from "@/components/blad/kop"
import "@/components/blad/blad.css"
import { Zoek } from "@/components/zoek"
import { PullToRefresh } from "@/components/vernieuw"
import { zoekIndex } from "@/lib/zoek-index"
import "@/components/wereld/wereld.css"
import { Stempel } from "@/components/blad/stempel"
import { BUSINESS } from "@/lib/business"
import "./globals.css"

const syne = Syne({ subsets: ["latin"], weight: ["700"], variable: "--font-syne" })
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-montserrat" })
// Layout Tuinplan (Weergave → Layout): IBM Plex, de letter van tekeningen en
// maten. globals.css zet onder html.plan --font-syne op de smalle Condensed
// en --font-montserrat op de gewone Sans, zodat elke pagina meedoet.
const smal = IBM_Plex_Sans_Condensed({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-plex-smal", preload: false })
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-plex", preload: false })
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono", preload: false })

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

// 50/50 (25 okt 2026): wie nog geen layout heeft, krijgt bij het eerste bezoek
// Klassiek of Blueprint en houdt die (LayoutMeting telt het). Geautomatiseerde
// browsers (navigator.webdriver, ook de tests) krijgen altijd Klassiek.
// Voor de eerste verf: kies licht of donker uit de bewaarde weergave (of de
// instelling van het toestel), zodat er geen flits is.
const VOORVERF = `try{var s=JSON.parse(localStorage.getItem('gronn-weergave')||'{}'),k=s.kleur||'auto',h=new Date().getHours(),d=k==='donker'||(k==='auto'&&(h>=19||h<7)),c=document.documentElement.classList;c.toggle('donker',d);if(!s.layout&&!navigator.webdriver){s.layout=Math.random()<.5?'plan':'klassiek';s.toegewezen=1;localStorage.setItem('gronn-weergave',JSON.stringify(s))}c.toggle('plan',s.layout==='plan');c.toggle('stil',!!s.beweging);c.toggle('groot',!!s.groot);c.toggle('contrast',!!s.contrast);c.toggle('onderstreep',!!s.onderstreep);if(s.taal==='en'){c.add('en');document.documentElement.lang='en'}}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${syne.variable} ${montserrat.variable} ${smal.variable} ${plex.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: VOORVERF }} />
      </head>
      <body>
        <div className="alleen-plan contents"><Kop /></div>
        <main>{children}</main>
        <div className="alleen-plan contents"><Stempel /></div>
        <div className="alleen-klassiek contents">
          <Voet />
          <Menu />
        </div>
        <Zoek index={zoekIndex()} />
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
