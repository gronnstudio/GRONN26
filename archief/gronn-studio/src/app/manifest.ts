import type { MetadataRoute } from "next"

// Web app manifest — lets phones pin gronn.studio to the home screen with
// the brand icon and open it like an app (same pattern as Equilibrium).
// Colors match the default Nocturne palette.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GRØNN Studio",
    short_name: "GRØNN",
    description:
      "Ecological design practice for gardens, water systems, habitat creation and regenerative landscape transformation.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a1624",
    theme_color: "#0a1624",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
