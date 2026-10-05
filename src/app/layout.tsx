import type { Metadata } from "next"
import { Syne, Montserrat } from "next/font/google"
import { Kop } from "@/components/kop"
import { Menu } from "@/components/menu"
import { Bekijk } from "@/components/bekijk"
import { App } from "@/components/app"
import { WereldBeweging } from "@/components/wereld/beweging"
import "@/components/wereld/wereld.css"
import { Voet } from "@/components/voet"
import { Overgang } from "@/components/overgang/overgang"
import { INTRO_VOORVERF } from "@/components/overgang/voorverf"
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

// Voor de eerste verf: kies licht of donker uit de bewaarde weergave (of de
// klok: donker vóór 07.00 en vanaf 19.00), zodat er geen flits is.
const VOORVERF = `try{var s=JSON.parse(localStorage.getItem('gronn-weergave')||'{}'),u=new Date().getHours(),k=s.kleur||'auto',d=k==='donker'||(k==='auto'&&(u<7||u>=19)),c=document.documentElement.classList;c.toggle('donker',d);c.toggle('stil',!!s.beweging);c.toggle('groot',!!s.groot);c.toggle('contrast',!!s.contrast);c.toggle('onderstreep',!!s.onderstreep);c.toggle('geluid',!!s.geluid);if(s.taal==='en'){c.add('en');document.documentElement.lang='en'}}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${syne.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: VOORVERF }} />
        <script dangerouslySetInnerHTML={{ __html: INTRO_VOORVERF }} />
      </head>
      <body>
        <Kop />
        <main>{children}</main>
        <Voet />
        <Menu />
        <Bekijk />
        <App />
        <WereldBeweging />
        <Overgang />
      </body>
    </html>
  )
}
