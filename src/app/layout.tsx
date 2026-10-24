import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Syne, Montserrat } from "next/font/google"
import { Kop } from "@/components/architect/kop"
import { Zoek } from "@/components/zoek"
import { zoekIndex } from "@/lib/zoek-index"
import "@/components/wereld/wereld.css"
import { Voet } from "@/components/architect/voet"
import { BUSINESS } from "@/lib/business"
import "./globals.css"

const syne = Syne({ subsets: ["latin"], weight: ["700"], variable: "--font-syne" })
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-montserrat" })

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
    <html lang="nl" className={`${syne.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: VOORVERF }} />
      </head>
      <body>
        <Kop />
        <main>{children}</main>
        <Voet />
        <Zoek index={zoekIndex()} />
        {/* Bezoeken en laadsnelheid, zonder cookies (11 okt 2026; zie /privacy).
            Ze tellen pas als ze in het Vercel-dashboard aanstaan. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
