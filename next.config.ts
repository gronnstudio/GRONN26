import type { NextConfig } from "next"
import { readdirSync } from "node:fs"
import { join } from "node:path"

// De wireframes (WF-001 en verder) blijven als statische HTML bestaan onder
// /wireframes, met de naslag op /wireframes/archief. Ze stonden tot 5 okt 2026
// in de root; oude links worden doorgestuurd.
const WIREFRAMES = readdirSync(join(process.cwd(), "public/wireframes"))
  .filter((f) => f.endsWith(".html") && f !== "index.html")
  .map((f) => f.slice(0, -5))

// Namen die nu een echte pagina zijn, sturen we niet door.
const ECHTE_PAGINAS = new Set(["vijvers", "tuinen", "werk", "over", "kennismaken", "faq", "privacy", "404"])

// Adressen van de vorige site (gronn.studio tot 5 okt 2026). Ze staan nog in
// Google, in mails en op sociale media; zonder deze regels gaven ze een 404.
// Engels was zonder voorvoegsel, Nederlands onder /nl; beide komen uit op de
// ene nieuwe pagina.
const OUD: [string, string][] = [
  ["/projects", "/werk"],
  ["/projects/vijverrenovatie-twee-vijvers-waterval-beekloop", "/werk/vijverrenovatie"],
  ["/projects/terras-geulle-24-m2-betontegels", "/werk/terras-geulle"],
  ["/projects/:slug", "/werk"],
  ["/services", "/vijvers"],
  ["/studio", "/over"],
  ["/contact", "/kennismaken"],
  ["/stack", "/techniek"],
  ["/calendar", "/"],
  ["/herfstbeurt", "/vijvers"],
  ["/checklist", "/kennismaken"],
  ["/winkel", "/"],
  ["/voorwaarden-zakelijk", "/voorwaarden"],
  ["/journal", "/werk"],
  ["/journal/:slug", "/werk"],
  ["/kennisbank", "/faq"],
  ["/kennisbank/:slug*", "/faq"],
  ["/easter-eggs", "/"],
  ["/portaal", "/kennismaken"],
]

const nextConfig: NextConfig = {
  // Foto's als AVIF waar de browser dat kan (kleiner bij dezelfde scherpte), anders WebP.
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [
      // Basisbeveiliging (21 okt 2026): geen inbedding op andere sites, geen
      // raden naar bestandstypen, alleen het domein als verwijzer, en camera
      // en locatie dicht. De microfoon blijft voor de assistent in het dashboard.
      {
        source: "/:pad*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self), payment=(), usb=()" },
        ],
      },
      // De wireframes zijn werkmateriaal: nooit in zoekmachines.
      { source: "/wireframes/:pad*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ]
  },
  async rewrites() {
    return [
      { source: "/wireframes", destination: "/wireframes/index.html" },
      { source: "/wireframes/:naam((?!.*\\.).*)", destination: "/wireframes/:naam.html" },
    ]
  },
  async redirects() {
    const oud = OUD.flatMap(([van, naar]) => [
      { source: van, destination: naar, permanent: true },
      { source: `/nl${van}`, destination: naar, permanent: true },
      { source: `/en${van}`, destination: naar, permanent: true },
    ])
    const talen = [
      { source: "/nl", destination: "/", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      // overige /nl/… en /en/… (faq, privacy, voorwaarden, …) bestaan zonder voorvoegsel
      { source: "/:taal(nl|en)/:pad*", destination: "/:pad*", permanent: true },
    ]
    // Beheer heet sinds 10 okt 2026 Dashboard (eigenaar: "maak van beheer dashboard").
    const dashboard = [
      { source: "/beheer", destination: "/dashboard", permanent: true },
      { source: "/beheer/:pad*", destination: "/dashboard/:pad*", permanent: true },
    ]
    // De QR-code op het tuinbord wijst naar /bord (eigenaar, 15 okt 2026). Staat
    // het bord bij een project, dan wijst deze regel naar dat project; tijdelijk,
    // zodat browsers de bestemming niet onthouden.
    const bord = [{ source: "/bord", destination: "/werk", permanent: false }]
    return [...oud, ...talen, ...dashboard, ...bord, ...WIREFRAMES.filter((n) => !ECHTE_PAGINAS.has(n)).map((n) => ({
      source: `/${n}`,
      destination: `/wireframes/${n}`,
      permanent: false,
    }))]
  },
}

export default nextConfig
