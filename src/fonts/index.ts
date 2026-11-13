import localFont from "next/font/local"

// De letters staan in de repo (13 nov 2026): next/font/google haalde ze bij
// elke build op, en de Vercel-builds vielen om toen Google Fonts de server
// een ander antwoord gaf. Latin-subset, dezelfde bestanden als van Google.
// Montserrat, Geist Mono en Plex Sans zijn variabel: één bestand per letter.

export const syne = localFont({ src: "./syne.woff2", weight: "700", variable: "--font-syne" })
export const geistMono = localFont({ src: "./geist-mono.woff2", weight: "400 600", variable: "--font-geist-mono" })
export const montserrat = localFont({ src: "./montserrat.woff2", weight: "300 700", variable: "--font-montserrat" })
export const smal = localFont({
  src: [
    { path: "./plex-smal-500.woff2", weight: "500" },
    { path: "./plex-smal-600.woff2", weight: "600" },
  ],
  variable: "--font-plex-smal",
  preload: false,
})
export const plex = localFont({ src: "./plex-sans.woff2", weight: "300 600", variable: "--font-plex", preload: false })
export const mono = localFont({
  src: [
    { path: "./plex-mono-400.woff2", weight: "400" },
    { path: "./plex-mono-500.woff2", weight: "500" },
    { path: "./plex-mono-600.woff2", weight: "600" },
  ],
  variable: "--font-plex-mono",
  preload: false,
})
