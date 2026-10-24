import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_Condensed } from "next/font/google"
import { Kop } from "@/components/blad/kop"
import "@/components/blad/blad.css"
import { Zoek } from "@/components/zoek"
import { zoekIndex } from "@/lib/zoek-index"
import "@/components/wereld/wereld.css"
import { Stempel } from "@/components/blad/stempel"
import { BUSINESS } from "@/lib/business"
import "./globals.css"

// Tuinplan (24 okt 2026): IBM Plex, de letter van tekeningen en maten. De
// oude variabelenamen blijven, zodat elke pagina meteen meedoet: --font-syne
// is nu de smalle Condensed voor koppen, --font-montserrat de gewone Sans.
const smal = IBM_Plex_Sans_Condensed({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-syne" })
const tekst = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-montserrat" })
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" })

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

// Voor de eerste verf: kies licht of donker uit de bewaarde weergave (of de
// instelling van het toestel), zodat er geen flits is.
const VOORVERF = `try{var s=JSON.parse(localStorage.getItem('gronn-weergave')||'{}'),k=s.kleur||'auto',h=new Date().getHours(),d=k==='donker'||(k==='auto'&&(h>=19||h<7)),c=document.documentElement.classList;c.toggle('donker',d);c.toggle('stil',!!s.beweging);c.toggle('groot',!!s.groot);c.toggle('contrast',!!s.contrast);c.toggle('onderstreep',!!s.onderstreep);if(s.taal==='en'){c.add('en');document.documentElement.lang='en'}}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${smal.variable} ${tekst.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: VOORVERF }} />
      </head>
      <body>
        <Kop />
        <main>{children}</main>
        <Stempel />
        <Zoek index={zoekIndex()} />
        {/* Bezoeken en laadsnelheid, zonder cookies (11 okt 2026; zie /privacy).
            Ze tellen pas als ze in het Vercel-dashboard aanstaan. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
