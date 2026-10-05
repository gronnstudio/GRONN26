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

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/wireframes", destination: "/wireframes/index.html" },
      { source: "/wireframes/:naam((?!.*\\.).*)", destination: "/wireframes/:naam.html" },
    ]
  },
  async redirects() {
    return WIREFRAMES.filter((n) => !ECHTE_PAGINAS.has(n)).map((n) => ({
      source: `/${n}`,
      destination: `/wireframes/${n}`,
      permanent: false,
    }))
  },
}

export default nextConfig
