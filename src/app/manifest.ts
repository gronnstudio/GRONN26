import type { MetadataRoute } from "next"

// Web-app-manifest: de site is te installeren als app, op de telefoon en op
// desktop (Chrome/Edge op Windows en Mac). Zelfde iconen als gronn.studio.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GRØNN Studio",
    short_name: "GRØNN",
    description: "Vijvers en natuurlijke tuinen voor huiseigenaren in Stein en omgeving, met een vaste prijs vooraf.",
    start_url: "/",
    display: "standalone",
    background_color: "#202020",
    theme_color: "#202020",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
