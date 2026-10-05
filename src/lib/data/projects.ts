// Alleen het type uit de oude site (gronn-studio src/lib/data/projects.ts); de plaatshouderprojecten zijn niet meegenomen.
import type { L } from "@/lib/i18n"

export type ProjectCategory =
  | "gardens"
  | "water"
  | "habitat"
  | "planting"
  | "consultation"
  | "in-progress"

export type CaseSection = {
  index: string
  title: L
  body: L
  points?: L[]
}

// Outcome data — the numbers ARE the layout (campaign Phase 2, the
// Patagonia move: species before and after, litres retained, materials
// reused, seasons of soil recovery). Placeholder fiction by owner
// decision 2 Aug 2026, same register as the rest of the content —
// values swap in place when real project data lands.
export type Outcome = {
  label: L
  // Short numeric strings; CountUp animates the first number in
  // `after`. `before` is optional — some outcomes have no meaningful
  // starting figure ("80% of stone reused").
  before?: L
  after: L
  note?: L
}

export type Project = {
  slug: string
  title: L
  location: string
  category: ProjectCategory
  objective: L
  intervention: L
  status: L
  // Hand-picked picsum IDs (landscape/plant/water shots) — unified into the
  // brand's material language by the `photo-glass` screen, the same
  // treatment the hero mosaic and every other photograph carries.
  imageId: number
  // Editor-uploaded photograph (Vercel Blob URL). When present it wins
  // over imageId — see projectImage() in @/lib/placeholder.
  image?: string
  featured?: boolean
  metrics?: { label: L; value: L }[]
  outcomes?: Outcome[]
  // Before/after pair for the comparison slider — placeholder ids until
  // real project photography exists (same rule as imageId).
  transformation?: { beforeId: number; afterId: number; caption?: L }
  sections?: CaseSection[]
}
