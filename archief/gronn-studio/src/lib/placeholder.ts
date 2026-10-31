import { beeldVan, type DienstBeeld } from "@/lib/data/services"

// Self-hosted placeholder photography (originally picsum, downloaded once
// into public/ph so the site has no external image dependency). Every use
// sits in a fixed-aspect container with object-cover, so one master file
// per id serves all crops. Replace with real project photography when the
// owner provides it.
export const ph = (id: number) => `/ph/${id}.jpg`

// A project's photograph: an editor-uploaded image URL wins over the
// placeholder id.
export const projectImage = (p: { imageId: number; image?: string }) =>
  p.image ?? ph(p.imageId)

// Curated placeholder per service. Lives here rather than beside one
// renderer because the homepage cards and the service detail pages both
// need it, and a second copy would drift.
const SERVICE_IMAGE_IDS: Record<string, number> = {
  "garden-design": 17,
  "water-systems": 28,
  "planting-habitat": 33,
  "garden-transformation": 12,
  consultancy: 10,
  implementation: 25,
  // Only the ids present in public/ph are used — the blur-map prebuild
  // walks that folder, so an id without a file breaks the build.
  "leaf-net": 18,
  "pond-autumn-service": 28,
  winterising: 12,
  "pond-survey": 10,
  "maintenance-subscription": 33,
}

/**
 * A service's photograph, in order: the chosen `beeld` (own work or
 * stock, see DienstBeeld in services.ts — looked up by slug, because the
 * rendered content document does not carry it), then an editor-uploaded
 * card photograph, then the curated placeholder. The mega menu, the
 * /services cards and the JSON-LD all come through here, so they agree.
 * Its label comes from `beeldLabel()` next to it.
 */
export const serviceImage = (s: { slug: string; image?: string; beeld?: DienstBeeld }) =>
  beeldVan(s)?.src ?? s.image ?? ph(SERVICE_IMAGE_IDS[s.slug] ?? 17)
