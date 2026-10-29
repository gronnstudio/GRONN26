import type { Article } from "@/lib/data/journal"
import type { Project } from "@/lib/data/projects"
import type { Service } from "@/lib/data/services"
import type { L } from "@/lib/i18n"

// The single content document the site renders from. Served from Vercel
// Blob when the editor has published (env CONTENT_BLOB_URL), otherwise
// from the committed content/site-content.json fallback. Shapes reuse
// the site's existing types — the loader is a drop-in for the old
// static imports.
export type SiteCopy = {
  heroTitle: [L, L]
  heroSubtitle: L
  heroLocation: L
  availability: L
  ctaTitle: [L, L]
  ctaSubtitle: L
}

// The /studio page, fully editable: hero, about, founder, mission,
// philosophy list and manifesto.
export type StudioPage = {
  heroTitle: [L, L]
  about: L
  founderName: L
  founderRoles: L[]
  founderBio: L
  mission: L
  philosophy: L[]
  manifestoTitle: [L, L]
  manifestoBody: L
  manifestoClose: L
}

// Shared inner-page hero (PageHero with editBase).
export type PageHeroContent = {
  heroTitle: [L, L]
  heroIntro?: L
}

// Homepage middle chapters — everything between hero and final CTA.
export type HomeContent = {
  observationTitle: L
  observationBody: L
  observationImage?: string
  observationPins: L[]
  systemTitle: L
  systemHint: L
  systemElements: { label: L; text: L }[]
  processTitle: L
  processStages: { title: L; text: L }[]
  brandTitle: [L, L]
  brandBody: L
  principles: L[]
  studioIntroTitle: [L, L]
  studioIntroBody: L
  studioIntroTag: L
  ticker: L
  testimonialsTitle: L
  // Placeholder fiction until real client quotes exist (same rule as
  // the projects). `name` is language-invariant; the context line is
  // what carries the project reference.
  testimonials: { quote: L; name: string; context: L }[]
}

export type ApproachPage = PageHeroContent & {
  framework: { title: L; text: L }[]
  frameworkNote: L
  phases: { index: L; title: L; steps: L[] }[]
}

// The /stack page. Only prose lives here: the layers themselves, which
// technology belongs to which layer and the installed versions stay in
// src/lib/stack.ts (versions are read from package.json), so the page
// can never claim a version the repository does not actually install.
// `layers` and `tech` are positional — index i mirrors STACK_LAYERS[i]
// and STACK_TECH[i].
export type StackPage = PageHeroContent & {
  filterHint: L
  layers: { title: L; summary: L }[]
  tech: { role: L; why: L; cost: L }[]
  principlesTitle: L
  principles: L[]
  closing: L
}

export type SiteContent = {
  siteCopy: SiteCopy
  home: HomeContent
  studio: StudioPage
  approach: ApproachPage
  stack: StackPage
  pages: {
    projects: PageHeroContent
    journal: PageHeroContent
    services: PageHeroContent
    contact: PageHeroContent
  }
  projects: Project[]
  articles: Article[]
  services: Service[]
}
